import type { MetaMaskInpageProvider } from '@metamask/providers'
import { getSmartAccountsEnvironment } from '@metamask/smart-accounts-kit'
import {
  erc7710WalletActions,
  erc7715ProviderActions,
} from '@metamask/smart-accounts-kit/actions'
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseUnits,
} from 'viem'
import type { PrivateKeyAccount } from 'viem/accounts'
import { sepolia as chain } from 'viem/chains'
import {
  type AgentPermissionConfig,
  DAY_IN_SECONDS,
  USDC_SEPOLIA_ADDRESS,
} from '@/app/constant'

export type PermissionRule = {
  type: string
  isAdjustmentAllowed: boolean
  data?: unknown
}

export type PermissionData = {
  tokenAddress: `0x${string}`
  periodAmount: string
  periodDuration: number
  startTime: number
  justification?: string
}

export type GrantedPermission = {
  address: `0x${string}`
  chainId: `0x${string}`
  context: `0x${string}`
  dependencyInfo: unknown[]
  permission: {
    type: string
    data: PermissionData
    rules: PermissionRule[]
    isAdjustmentAllowed: boolean
  }
  signer: {
    type: 'account'
    data: {
      address: `0x${string}`
    }
  }
  signerMeta: {
    delegationManager: `0x${string}`
  }
}

export type GrantedExecutionPermissions = GrantedPermission[]

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

export const walletClient =
  typeof window !== 'undefined' && window.ethereum
    ? createWalletClient({
        transport: custom(window.ethereum),
      }).extend(erc7715ProviderActions())
    : (null as unknown as ReturnType<typeof createWalletClient>)

export const publicClient = createPublicClient({
  chain,
  transport: http(),
})

export const sessionAccountWalletClient = (sessionAccount: PrivateKeyAccount) =>
  createWalletClient({
    account: sessionAccount,
    chain,
    transport: http(),
  }).extend(erc7710WalletActions())

export async function checkForSmartAccountUpgrade() {
  console.log('upgrading to smart account')
  const addresses = await walletClient.requestAddresses()
  const address = addresses[0]
  const code = await publicClient.getCode({
    address,
  })

  if (code) {
    const delegatorAddress = `0x${code.substring(8)}`

    const statelessDelegatorAddress = getSmartAccountsEnvironment(chain.id)
      .implementations.EIP7702StatelessDeleGatorImpl

    const isAccountUpgraded =
      delegatorAddress.toLowerCase() === statelessDelegatorAddress.toLowerCase()
    return isAccountUpgraded
  }
  return false
}

export async function requestPermissions(
  address: `0x${string}`
): Promise<GrantedExecutionPermissions> {
  if (!walletClient || !window.ethereum) {
    throw new Error('Wallet client not available')
  }

  const currentTime = Math.floor(Date.now() / 1000)
  const expiry = currentTime + DAY_IN_SECONDS

  // Use viem's extended client method requestExecutionPermissions
  // Type assertion needed because TypeScript doesn't fully recognize extended methods
  // biome-ignore lint/suspicious/noExplicitAny: Extended viem client methods not fully typed
  const client = walletClient as any

  const grantedPermissions = await client.requestExecutionPermissions([
    {
      chainId: chain.id,
      expiry,
      signer: {
        type: 'account',
        data: {
          address,
        },
      },
      permission: {
        type: 'erc20-token-periodic',
        data: {
          tokenAddress: USDC_SEPOLIA_ADDRESS,
          periodAmount: parseUnits('10', 6),
          periodDuration: DAY_IN_SECONDS,
          justification: 'Permission to transfer 10 USDC every day',
        },
      },
      isAdjustmentAllowed: true,
    },
  ])

  return grantedPermissions
}

export async function requestAgentPermissions(
  address: `0x${string}`,
  config: AgentPermissionConfig
): Promise<GrantedExecutionPermissions> {
  if (!walletClient || !window.ethereum) {
    throw new Error('Wallet client not available')
  }

  // Use viem's extended client method requestExecutionPermissions
  // Type assertion needed because TypeScript doesn't fully recognize extended methods
  // biome-ignore lint/suspicious/noExplicitAny: Extended viem client methods not fully typed
  const client = walletClient as any

  const tokenLimit = config.tokenLimits[0]
  if (!tokenLimit) {
    throw new Error('Token limit not found in config')
  }

  const grantedPermissions = await client.requestExecutionPermissions([
    {
      chainId: chain.id,
      expiry: config.expiry,
      signer: {
        type: 'account',
        data: {
          address,
        },
      },
      permission: {
        type: 'erc20-token-periodic',
        data: {
          tokenAddress: tokenLimit.token,
          periodAmount: BigInt(tokenLimit.amount),
          periodDuration: tokenLimit.period,
          justification: config.description,
        },
      },
      isAdjustmentAllowed: true,
    },
  ])

  return grantedPermissions
}

export async function downgradePermission(permission: GrantedPermission) {
  return {
    type: 'erc20SpendLimit',
    value: {
      token: USDC_SEPOLIA_ADDRESS,
      amount: parseUnits('1', 6),
      period: 'DAY',
    },
  }

  // await window?.ethereum?.request({
  //   method: 'wallet_revokePermissions',
  //   params: [
  //     {
  //       eth_sendTransaction: {},
  //     },
  //   ],
  // })
}

export async function pausePermission(permission: GrantedPermission) {
  await window?.ethereum?.request({
    method: 'wallet_revokePermissions',
    params: [
      {
        eth_sendTransaction: {},
      },
    ],
  })
}
