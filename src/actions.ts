'use server'

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { redirect } from 'next/navigation'
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { auth } from '@/auth'
import {
  createAgentLog,
  createSubscription,
  getAgentLogsByUser,
  getOrCreateAgent,
  getSubscription,
  getSubscriptionById,
  getUserSubscriptions,
} from '@/lib/db-queries'
import {
  type GrantedExecutionPermissions,
  sessionAccountWalletClient,
} from '@/lib/viem'
import { tools } from '@/tools'
import {
  getAgentPermissionConfig,
  getAgentPermissions,
  SYSTEM_INSTRUCTION,
  USDC_SEPOLIA_ADDRESS,
} from './app/constant'

export async function getUserId() {
  const session = await auth()
  if (!session) redirect('/connect')
  return session?.user?.id
}

async function getSessionAccount() {
  await getUserId()
  const sessionPrivateKey = generatePrivateKey()
  const sessionAccount = privateKeyToAccount(sessionPrivateKey)
  return sessionAccount.address
}

const sessionAccount = privateKeyToAccount(
  process.env.SESSION_ACCOUNT_PRIVATE_KEY as `0x${string}`
)

export async function getSessionAccountAddress() {
  await getUserId()
  return sessionAccount.address
}

export async function redeemAdvancedPermissions(
  grantedPermissions: GrantedExecutionPermissions
) {
  try {
    const calldata = encodeFunctionData({
      abi: erc20Abi,
      args: [sessionAccount.address, parseUnits('1', 6)],
      functionName: 'transfer',
    })

    const permissionsContext = grantedPermissions[0].context
    const delegationManager = grantedPermissions[0].signerMeta.delegationManager

    const transactionHash = await sessionAccountWalletClient(
      sessionAccount
    ).sendTransactionWithDelegation({
      account: sessionAccount,
      chain: sepolia,
      to: USDC_SEPOLIA_ADDRESS,
      data: calldata,
      permissionsContext,
      delegationManager,
    })

    return {
      success: true,
      transactionHash,
      message: 'Advanced permissions redeemed successfully',
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).cause as string,
    }
  }
}

export async function subscribeToAgent(data: {
  agentName: string
  description: string
  cost: string
  iconName: string
  grantedPermissions: GrantedExecutionPermissions
}) {
  const userId = await getUserId()
  const permissions = getAgentPermissions(data.agentName)
  if (!permissions) {
    throw new Error(`No permissions found for agent: ${data.agentName}`)
  }

  const sessionAddress = await getSessionAccount()
  const agent = await getOrCreateAgent({
    name: data.agentName,
    description: data.description,
    cost: data.cost,
    can: permissions.can,
    cannot: permissions.cannot,
  })

  if (!agent) {
    throw new Error('Failed to get or create agent')
  }

  const existingSubscription = await getSubscription(userId!, agent.id)
  if (existingSubscription) {
    return {
      success: true,
      subscription: existingSubscription,
      message: 'Already subscribed to this agent',
    }
  }

  if (!data.grantedPermissions || data.grantedPermissions.length === 0) {
    throw new Error('No permissions provided')
  }

  const permission = data.grantedPermissions[0]

  const subscription = await createSubscription({
    userId: userId!,
    agentId: agent.id,
    sessionAddress,
    permissionContext: permission.context,
    delegationManager: permission.signerMeta.delegationManager,
    chainId: permission.chainId,
  })

  if (!subscription) {
    throw new Error('Failed to create subscription')
  }

  try {
    await executeAgent({
      subscriptionId: subscription.id,
      agentName: data.agentName,
      // No need to pass raw permission data - permission config already has all the info
    })
  } catch (error) {
    console.error(error)
    return { success: false, subscription: null, permissions: null }
  }

  return {
    success: true,
    subscription,
    permissions: data.grantedPermissions,
  }
}

export async function getUserAgentSubscriptions() {
  const userId = await getUserId()
  return getUserSubscriptions(userId!)
}

export async function getUserAgentLogs() {
  const userId = await getUserId()
  return getAgentLogsByUser(userId!)
}

export async function getDashboardData() {
  const userId = await getUserId()
  const session = await auth()
  const subscriptions = await getUserSubscriptions(userId!)
  const logs = await getAgentLogsByUser(userId!)

  const activeSubscriptions =
    subscriptions?.filter(sub => sub.status === 'active') || []
  const activeAgentsCount = activeSubscriptions.length

  const recentLogs =
    logs?.slice(0, 5).map(log => ({
      id: log.id,
      agent: log.agentName,
      action: log.action,
      time: log.createdAt,
      status: log.status,
    })) || []

  let totalDailyLimit = 0

  activeSubscriptions.forEach(sub => {
    const config = getAgentPermissionConfig(sub.agent.name)
    if (config?.tokenLimits[0]) {
      const limit = parseFloat(config.tokenLimits[0].amount) / 1e6 // Convert from 6 decimals to USDC
      totalDailyLimit += limit
    }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const logsToday =
    logs?.filter(log => {
      const logDate = new Date(log.createdAt)
      return (
        logDate >= today &&
        logDate <= todayEnd &&
        log.status === 'success' &&
        log.transactionHash
      )
    }) || []

  let totalSpentToday = 0
  logsToday.forEach(log => {
    const metadata = log.metadata as
      | { amount?: string; currentEthRatio?: string }
      | null
      | undefined

    if (metadata?.amount) {
      // Amount is stored in 6 decimals (e.g., "1000000" = 1 USDC)
      const amount = parseFloat(metadata.amount) / 1e6
      totalSpentToday += amount
    } else {
      const config = getAgentPermissionConfig(log.agentName)
      if (config?.tokenLimits[0]) {
        // Use 5% of daily limit as a conservative estimate for rebalance operations
        const agentLimit = parseFloat(config.tokenLimits[0].amount) / 1e6
        totalSpentToday += agentLimit * 0.05
      }
    }
  })

  const chartData = generateChartData(logs || [], totalDailyLimit)

  return {
    walletAddress: session?.user?.walletAddress || null,
    activeAgents: activeAgentsCount,
    dailySpendLimit: totalDailyLimit,
    dailySpent: totalSpentToday,
    recentActivity: recentLogs,
    subscriptions: activeSubscriptions,
    chartData,
  }
}

function generateChartData(
  logs: Array<{
    createdAt: Date
    status: string
    transactionHash: string | null
    agentName: string
    metadata: unknown
  }>,
  dailyLimit: number
) {
  const now = new Date()
  const successfulLogs = logs.filter(
    log => log.status === 'success' && log.transactionHash
  )

  const getSpendingFromLog = (log: {
    agentName: string
    metadata: unknown
  }): number => {
    const metadata = log.metadata as
      | { amount?: string; currentEthRatio?: string }
      | null
      | undefined

    if (metadata?.amount) {
      return parseFloat(metadata.amount) / 1e6
    }

    const config = getAgentPermissionConfig(log.agentName)
    if (config?.tokenLimits[0]) {
      const agentLimit = parseFloat(config.tokenLimits[0].amount) / 1e6
      return agentLimit * 0.05 // 5% estimate for rebalance operations
    }

    return 0
  }

  const weekData: Array<{ date: string; spending: number; limit: number }> = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const dateEnd = new Date(date)
    dateEnd.setHours(23, 59, 59, 999)

    const dayLogs = successfulLogs.filter(log => {
      const logDate = new Date(log.createdAt)
      return logDate >= date && logDate <= dateEnd
    })

    let daySpending = 0
    dayLogs.forEach(log => {
      daySpending += getSpendingFromLog(log)
    })

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    weekData.push({
      date: dayNames[date.getDay()],
      spending: Math.round(daySpending * 100) / 100,
      limit: Math.round(dailyLimit * 100) / 100,
    })
  }

  return {
    week: weekData,
  }
}

export async function executeAgent(data: {
  subscriptionId: string
  agentName: string
  prompt?: string
}) {
  const userId = (await getUserId())!

  const subscription = await getSubscriptionById(data.subscriptionId)
  if (!subscription || subscription.userId !== userId) {
    throw new Error('Subscription not found')
  }

  const permissionsContext = subscription.permissionContext as `0x${string}`
  const delegationManager = subscription.delegationManager as `0x${string}`

  const permissionConfig = getAgentPermissionConfig(data.agentName)

  const tokenLimitsFormatted = permissionConfig?.tokenLimits
    .map(
      limit =>
        `${parseFloat(limit.amount) / 1e6} USDC per ${
          limit.period / 86400
        } day(s)`
    )
    .join(', ')

  const agentInfo = `
Agent: ${data.agentName}
Description: ${subscription.agent?.description}

Your Permissions:
- Allowed Target Contracts: ${permissionConfig?.allowedTargets.join(', ')}
- Allowed Methods: ${permissionConfig?.allowedMethods.join(', ')}
- Spending Limits: ${tokenLimitsFormatted || 'N/A'}
- Permission Expiry: ${
    permissionConfig?.expiry
      ? new Date(permissionConfig.expiry * 1000).toISOString()
      : 'N/A'
  }

Technical Details (for transaction execution):
- Permission Context: ${permissionsContext}
- Delegation Manager: ${delegationManager}

IMPORTANT: The "Allowed Target Contracts" above are the contract addresses you can interact with. Use these addresses when calling tools.
`

  const { text, toolCalls, toolResults } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: data.prompt
      ? `${agentInfo}\n\nUser Request: ${data.prompt}`
      : `${agentInfo}\n\nAnalyse the current state and execute any necessary actions within your permissions.`,
    system: SYSTEM_INSTRUCTION,
    tools,
  })

  await createAgentLog({
    subscriptionId: data.subscriptionId,
    agentName: data.agentName,
    action: `Agent execution${data.prompt ? `: ${data.prompt}` : ''}`,
    status: toolCalls && toolCalls.length > 0 ? 'executed' : 'analysed',
    metadata: {
      text,
      toolCalls,
      toolResults,
    },
  })

  return {
    text,
    toolCalls,
    toolResults,
  }
}
