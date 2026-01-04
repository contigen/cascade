import { getUserAgentSubscriptions } from '@/actions'
import { DashboardPageLayout } from '@/app/(app)/dashboard-layout'
import { MarketplaceView } from './marketplace-view'

const AGENTS = [
  {
    id: 'portfolio-rebalancer',
    name: 'Portfolio Rebalancer',
    description:
      'Daily portfolio rebalance within fixed budget. Automatically maintains your target asset allocation.',
    cost: '$0.50',
    iconName: 'ProcessorIcon',
    can: [
      'Rebalance portfolio within approved limits',
      'Execute rebalance transactions',
      'Maintain target ETH ratio',
    ],
    cannot: [
      'Exceed daily budget limit (2 USDC)',
      'Withdraw to external addresses',
      'Access private keys',
    ],
  },
  {
    id: 'gas-optimiser',
    name: 'Gas Optimiser',
    description:
      'Pays gas relayer fees on your behalf within approved limits. Optimizes transaction costs.',
    cost: '$0.25',
    iconName: 'GearIcon',
    can: [
      'Pay gas relayer fees',
      'Execute within daily limit (1 USDC)',
      'Optimize transaction costs',
    ],
    cannot: [
      'Exceed daily spending limit',
      'Change transaction amounts',
      'Access private keys',
    ],
  },
]

export default async function AgentMarketplacePage() {
  const subscriptionsResult = await getUserAgentSubscriptions()
  const subscriptions = subscriptionsResult || []

  return (
    <DashboardPageLayout
      header={{
        title: 'Agent Marketplace',
        description: 'Discover and subscribe to autonomous agents',
      }}
    >
      <MarketplaceView agents={AGENTS} subscriptions={subscriptions} />
    </DashboardPageLayout>
  )
}
