import { tool } from 'ai'
import { encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { z } from 'zod'
import {
  GAS_RELAY_ABI,
  GAS_RELAY_CONTRACT,
  REBALANCE_CONTRACT_ABI,
  REBALANCE_CONTRACT_ADDRESS,
} from '@/app/constant'
import { sessionAccountWalletClient } from '@/lib/viem'

const sessionAccount = privateKeyToAccount(
  process.env.SESSION_ACCOUNT_PRIVATE_KEY as `0x${string}`
)

export const tools = {
  rebalancePortfolio: tool({
    description:
      'Rebalance the user portfolio within approved limits. Calculates current ETH ratio and executes rebalance if needed.',
    inputSchema: z.object({
      currentEthRatio: z
        .string()
        .describe('Current ETH ratio as a decimal (e.g., "0.6" for 60%)'),
      permissionsContext: z.string().describe('The permissions context'),
      delegationManager: z.string().describe('The delegation manager'),
    }),
    execute: async ({
      currentEthRatio,
      permissionsContext,
      delegationManager,
    }) => {
      try {
        const currentEthRatioValue = currentEthRatio || '0'
        const ratioBigInt = BigInt(
          Math.floor(parseFloat(currentEthRatioValue) * 1e18)
        )

        const calldata = encodeFunctionData({
          abi: REBALANCE_CONTRACT_ABI,
          functionName: 'rebalance',
          args: [ratioBigInt],
        })

        const transactionHash = await sessionAccountWalletClient(
          sessionAccount
        ).sendTransactionWithDelegation({
          account: sessionAccount,
          chain: sepolia,
          to: REBALANCE_CONTRACT_ADDRESS as `0x${string}`,
          data: calldata,
          permissionsContext: permissionsContext as `0x${string}`,
          delegationManager: delegationManager as `0x${string}`,
        })
        const result = {
          type: 'text',
          text: `Portfolio rebalanced successfully. Transaction: ${transactionHash}`,
          transactionHash,
          status: 'success',
        }
        return result
      } catch (error) {
        const errorMessage = (error as Error).message
        const result = {
          type: 'text',
          text: `Rebalance failed: ${errorMessage}`,
          status: 'error',
          error: errorMessage,
        }
        return result
      }
    },
  }),
  payGasRelayer: tool({
    description:
      'Pay gas relayer fees on behalf of the user within approved limits.',
    inputSchema: z.object({
      amount: z
        .string()
        .describe('Amount in USDC (6 decimals, e.g., "1000000" for 1 USDC)'),
      permissionsContext: z.string().describe('The permissions context'),
      delegationManager: z.string().describe('The delegation manager'),
    }),
    execute: async ({ amount, permissionsContext, delegationManager }) => {
      try {
        const amountValue = amount || '1000000' // Default 1 USDC (6 decimals)
        const amountBigInt = BigInt(amountValue)

        const calldata = encodeFunctionData({
          abi: GAS_RELAY_ABI,
          functionName: 'payRelayer',
          args: [amountBigInt],
        })

        const transactionHash = await sessionAccountWalletClient(
          sessionAccount
        ).sendTransactionWithDelegation({
          account: sessionAccount,
          chain: sepolia,
          to: GAS_RELAY_CONTRACT as `0x${string}`,
          data: calldata,
          permissionsContext: permissionsContext as `0x${string}`,
          delegationManager: delegationManager as `0x${string}`,
        })

        const result = {
          type: 'text',
          text: `Gas relayer paid successfully. Transaction: ${transactionHash}`,
          transactionHash,
          status: 'success',
        }
        return result
      } catch (error) {
        const errorMessage = (error as Error).message
        const result = {
          type: 'text',
          text: `Gas payment failed: ${errorMessage}`,
          status: 'error',
          error: errorMessage,
        }
        return result
      }
    },
  }),
}
