export const SYSTEM_INSTRUCTION = `
You are an autonomous Web3 execution agent operating within a permissioned Smart Account environment.

Your role is to analyse user intent, portfolio state, and system signals, then decide whether to invoke approved on-chain actions via provided tools.

You MUST adhere to the following rules at all times:

2. You may only request execution via explicitly provided tools.
3. You must assume all tools are permission-restricted and may fail if limits are exceeded.
4. You must never attempt to bypass, simulate, or reason about private keys, seed phrases, or signing.
5. You must treat failed executions as expected safety outcomes, not errors to work around.
6. You must not invent contracts, addresses, balances, or blockchain state.
7. You must explain your intent clearly before invoking any tool.
8. You must halt execution if the requested action appears unsafe, out of scope, or unauthorised.
9. You operate as a deterministic, security-first agent prioritising user safety and permission boundaries over task completion.

Your success is measured by correct intent interpretation, safe tool selection, and strict compliance with Smart Account permissions — not by transaction frequency or completion at all costs.
`
export const DAY_IN_SECONDS = 86_400

export const USDC_SEPOLIA_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

export type AgentPermissions = {
  can: string[]
  cannot: string[]
}

export const AGENT_PERMISSIONS: Record<string, AgentPermissions> = {
  'Portfolio Rebalancer': {
    can: [
      'Swap assets on Uniswap/Curve',
      'Monitor prices',
      'Execute within 5% slippage',
    ],
    cannot: [
      'Withdraw to external addresses',
      'Interact with unverified contracts',
    ],
  },
  'Gas Optimiser': {
    can: ['Monitor mempool', 'Batch transactions', 'Bridge to L2s during lows'],
    cannot: ['Change transaction amounts', 'Access private keys'],
  },
  'Ops Agent': {
    can: ['Claim rewards', 'Stake/Unstake on Aave', 'Vote on snapshots'],
    cannot: ['Transfer ownership', 'Approve infinite spending'],
  },
}

export function getAgentPermissions(
  agentName: string
): AgentPermissions | null {
  return AGENT_PERMISSIONS[agentName] || null
}

export const REBALANCE_CONTRACT_ADDRESS =
  '0x12d10a6941DFDE53b6Fa6FbC316516447867F675'

export const REBALANCE_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'currentEthRatio',
        type: 'uint256',
      },
    ],
    name: 'rebalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_targetEthRatio',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'executor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'previousRatio',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newRatio',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'Rebalanced',
    type: 'event',
  },
  {
    inputs: [],
    name: 'COOLDOWN',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastRebalanceAt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'targetEthRatio',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

export const GAS_RELAY_CONTRACT = '0x0716E32C5C0C6102e836E859969b103BeEC58eeB'

export const REBALANCER_AGENT_ADDRESS =
  '0x0000000000000000000000000000000000000001'
export const GAS_AGENT_ADDRESS = '0x0000000000000000000000000000000000000002'

export type AgentPermissionConfig = {
  name: string
  description: string
  spender: `0x${string}`
  allowedTargets: `0x${string}`[]
  allowedMethods: string[]
  tokenLimits: {
    token: `0x${string}`
    amount: string
    period: number
  }[]
  expiry: number
}

export const AGENT_PERMISSION_CONFIGS: Record<string, AgentPermissionConfig> = {
  'Portfolio Rebalancer': {
    name: 'Portfolio Rebalancer Agent',
    description: 'Daily portfolio rebalance within fixed budget',
    spender: REBALANCER_AGENT_ADDRESS,
    allowedTargets: [REBALANCE_CONTRACT_ADDRESS as `0x${string}`],
    allowedMethods: ['rebalance(uint256)'],
    tokenLimits: [
      {
        token: USDC_SEPOLIA_ADDRESS as `0x${string}`,
        amount: '2000000', // 2 USDC (6 decimals)
        period: 86400,
      },
    ],
    expiry: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  },
  'Gas Optimiser': {
    name: 'Gas Optimiser Agent',
    description: 'Pays gas relayer fees on your behalf',
    spender: GAS_AGENT_ADDRESS,
    allowedTargets: [GAS_RELAY_CONTRACT as `0x${string}`],
    allowedMethods: ['payRelayer(uint256)'],
    tokenLimits: [
      {
        token: USDC_SEPOLIA_ADDRESS as `0x${string}`,
        amount: '1000000', // 1 USDC (6 decimals)
        period: 86400,
      },
    ],
    expiry: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  },
}

export function getAgentPermissionConfig(
  agentName: string
): AgentPermissionConfig | null {
  return AGENT_PERMISSION_CONFIGS[agentName] || null
}

export const GAS_RELAY_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'payRelayer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_relayer',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'payer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'relayer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'RelayerPaid',
    type: 'event',
  },
  {
    inputs: [],
    name: 'relayer',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalFeesPaid',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]
