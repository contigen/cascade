# Cascade

**Wallet-native autonomous agent subscriptions powered by ERC-7715 Advanced Permissions**

Cascade enables users to subscribe to autonomous AI agents that can execute on-chain transactions on their behalf within predefined permission bounds. Built on ERC-7715 Advanced Permissions, Cascade provides a secure, user-controlled way to delegate specific capabilities to AI agents whilst maintaining full control over spending limits and authorised actions.

## Project Description

Cascade is a Web3 application that combines Smart Accounts, ERC-7715 Advanced Permissions, and AI agents to create a subscription-based ecosystem for autonomous on-chain operations. Users can browse and subscribe to specialised agents (such as Portfolio Rebalancers or Gas Optimisers) that operate within strict permission boundaries defined at subscription time.

Key features:

- **Agent Marketplace**: Browse and subscribe to autonomous agents with predefined capabilities
- **Permission Management**: Granular control over what agents can and cannot do
- **Real-time Monitoring**: Track agent executions, tool calls, and LLM responses
- **Spending Limits**: Daily and periodic spending caps enforced at the permission level
- **AI-Powered Execution**: Agents use LLMs to analyse conditions and execute transactions via approved tools

## Tech Stack

### Client

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualisation

### Backend & Infra

- **Next.js Server Actions**
- **Prisma** - Database ORM
- **Prisma PostgreSQL** - Database
- **NextAuth.js** - Authentication

### Web3 & Blockchain

- **Viem** - Ethereum TypeScript library
- **ERC-7715** - Advanced Permissions protocol
- **Smart Accounts** - Account abstraction via MetaMask Smart Accounts Kit
- **Sepolia Testnet** - Ethereum test network

### AI & Agents

- **AI SDK** - Vercel AI SDK for LLM integration
- **Google Gemini 2.5 Flash** - LLM model
- **Zod** - Schema validation

## Advanced Permissions Usage

Cascade leverages ERC-7715 Advanced Permissions to enable secure, granular delegation of transaction capabilities to autonomous agents. The implementation follows a request-redeem pattern where permissions are requested from the user's wallet and then redeemed during transaction execution.

### Requesting Advanced Permissions

Advanced permissions are requested client-side when users subscribe to an agent. The implementation uses Viem's extended `requestExecutionPermissions` method to interact with the user's wallet.

**Code Location**: [`src/lib/viem.ts`](src/lib/viem.ts#L147-L189)

**Implementation**:

```typescript
export async function requestAgentPermissions(
  address: `0x${string}`,
  config: AgentPermissionConfig
): Promise<GrantedExecutionPermissions> {
  // Uses viem's extended client method requestExecutionPermissions
  const client = walletClient as any

  const grantedPermissions = await client.requestExecutionPermissions([
    {
      chainId: chain.id,
      expiry: config.expiry,
      signer: {
        type: 'account',
        data: { address },
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
```

**Usage in Agent Subscription**: [`src/app/(app)/marketplace/marketplace-view.tsx`](<src/app/(app)/marketplace/marketplace-view.tsx#L73-L101>)

The permissions are requested when a user confirms their subscription to an agent, with the granted permissions then passed to the server for storage and future transaction execution.

### Redeeming Advanced Permissions

Permissions are redeemed server-side when executing transactions via the `sendTransactionWithDelegation` method. This occurs automatically when agents call their assigned tools.

**Code Location**: [`src/actions.ts`](src/actions.ts#L53-L88)

**Implementation**:

```typescript
export async function redeemAdvancedPermissions(
  grantedPermissions: GrantedExecutionPermissions
) {
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

  return { success: true, transactionHash }
}
```

**Usage in Tool Execution**: [`src/tools.ts`](src/tools.ts)

The `permissionsContext` and `delegationManager` extracted from granted permissions are used in all tool executions to ensure transactions comply with the user's permission boundaries.

### Permission Flow

1. **User subscribes to agent** → Client requests permissions via `requestAgentPermissions`
2. **Permissions granted** → Wallet returns `GrantedExecutionPermissions` with context and delegation manager
3. **Permissions stored** → Server saves permission context and delegation manager in subscription record
4. **Agent executes** → Tools use stored permissions context when calling `sendTransactionWithDelegation`
5. **Transaction validated** → Smart Account validates transaction against permission boundaries before execution

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- MetaMask or compatible Web3 wallet
- Environment variables configured (see `.env.example`)

### Installation

```bash
# Install dependencies
bun install

# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# Start development server
**bun** run dev
```

### Environment Variables

Create a `.env` file with:

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
SESSION_ACCOUNT_PRIVATE_KEY="0x..."
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (app)/             # Protected routes
│   │   ├── marketplace/   # Agent marketplace
│   │   ├── monitoring/    # Agent execution logs
│   │   └── permissions/   # Permission management
│   └── connect/           # Wallet connection
├── actions.ts             # Server actions
├── tools.ts               # AI agent tools
├── lib/
│   ├── viem.ts           # Web3 utilities & permission requests
│   └── db-queries.ts     # Database operations
└── components/            # React components
```

## License

MIT
