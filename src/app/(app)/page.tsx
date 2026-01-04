import Link from 'next/link'
import { getDashboardData } from '@/actions'
import { ActivityIcon, ShieldIcon, WalletIcon, ZapIcon } from '@/app/icons'
import { DashboardChart } from '@/components/chart'
import { Stat } from '@/components/stat'
import { Badge } from '@/components/ui/badge'
import { Bullet } from '@/components/ui/bullet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardPageLayout } from './dashboard-layout'

function formatAddress(address: string | null): string {
  if (!address) return 'Not connected'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    success: 'Permitted',
    executed: 'Permitted',
    error: 'Failed',
    analysed: 'Analysed',
    pending: 'Pending',
  }
  return statusMap[status.toLowerCase()] || status
}

export default async function Page() {
  const dashboardData = await getDashboardData()

  if (!dashboardData) {
    return (
      <DashboardPageLayout
        header={{
          title: 'Cascade',
          description: 'Wallet-native subscriptions powered by ERC-7715',
        }}
      >
        <Card>
          <CardContent className='p-8 text-center text-muted-foreground'>
            <p>Please connect your wallet to view dashboard</p>
          </CardContent>
        </Card>
      </DashboardPageLayout>
    )
  }

  const {
    walletAddress,
    activeAgents,
    dailySpendLimit,
    dailySpent,
    recentActivity,
    chartData,
  } = dashboardData

  const remainingToday = dailySpendLimit - dailySpent
  const spendPercentage =
    dailySpendLimit > 0 ? (dailySpent / dailySpendLimit) * 100 : 0
  return (
    <DashboardPageLayout
      header={{
        title: 'Cascade',
        description: 'Wallet-native subscriptions powered by ERC-7715',
      }}
    >
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card className='md:col-span-2 lg:col-span-1 border-primary/50 bg-primary/5'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <WalletIcon className='size-4' />
              Smart Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-display truncate'>
              {formatAddress(walletAddress)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              {walletAddress ? 'Connected via MetaMask' : 'Not connected'}
            </p>
            <div className='flex gap-2 mt-4'>
              {activeAgents > 0 && (
                <Badge
                  variant='outline'
                  className='text-[10px] border-primary/30 text-primary'
                >
                  ERC-7715 ACTIVE
                </Badge>
              )}
              <Badge variant='outline' className='text-[10px]'>
                SEPOLIA
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Stat
          label='Daily Spend Limit'
          value={`$${dailySpendLimit.toFixed(2)}`}
          description={`$${remainingToday.toFixed(2)} remaining today`}
          icon={WalletIcon}
        />

        <Stat
          label='Active Agents'
          value={activeAgents.toString()}
          description={
            activeAgents > 0 ? 'Running autonomously' : 'No active agents'
          }
          icon={ZapIcon}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div className='lg:col-span-8'>
          <Card className='h-full'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ActivityIcon className='size-4' />
                Live Agent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {recentActivity.length === 0 ? (
                <div className='p-8 text-center text-muted-foreground'>
                  <p className='text-sm'>No agent activity yet</p>
                  <p className='text-xs mt-1'>
                    Subscribe to an agent to see activity here
                  </p>
                </div>
              ) : (
                <>
                  {recentActivity.map(
                    (item: {
                      id?: string
                      agent: string
                      action: string
                      time: Date
                      status: string
                    }) => {
                      const timeAgo = item.time
                        ? formatTimeAgo(new Date(item.time))
                        : 'Unknown'
                      const status = formatStatus(item.status)
                      const isSuccess =
                        status === 'Permitted' || status === 'Success'

                      return (
                        <div
                          key={item.id || `${item.agent}-${item.time}`}
                          className='flex items-center justify-between p-3 border rounded-lg bg-muted/30'
                        >
                          <div className='space-y-1'>
                            <div className='text-sm font-medium flex items-center gap-2'>
                              <Bullet />
                              {item.agent}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              {item.action}
                            </p>
                          </div>
                          <div className='text-right space-y-1'>
                            <Badge
                              variant='outline'
                              className={`text-[10px] ${
                                isSuccess
                                  ? 'border-success/50 text-success'
                                  : 'border-destructive/50 text-destructive'
                              }`}
                            >
                              {status}
                            </Badge>
                            <p className='text-[10px] text-muted-foreground block'>
                              {timeAgo}
                            </p>
                          </div>
                        </div>
                      )
                    }
                  )}
                  <Link href='/monitoring'>
                    <Button
                      variant='ghost'
                      className='w-full text-xs text-muted-foreground hover:text-primary'
                    >
                      View All Executions
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='lg:col-span-4'>
          <Card className='h-full border-warning/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldIcon className='size-4' />
                Safety Bounds
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>
                    Total Daily Budget
                  </span>
                  <span>
                    ${dailySpent.toFixed(2)} / ${dailySpendLimit.toFixed(2)}
                  </span>
                </div>
                <div className='h-2 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary transition-all'
                    style={{
                      width: `${Math.min(spendPercentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className='space-y-4 pt-2'>
                <div className='flex items-start gap-3'>
                  <div className='size-2 rounded-full bg-success mt-1' />
                  <div>
                    <p className='text-xs font-medium'>Compliance Check</p>
                    <p className='text-[10px] text-muted-foreground'>
                      All 12 today were within bounds
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='size-2 rounded-full bg-primary mt-1' />
                  <div>
                    <p className='text-xs font-medium'>Auto-Revoke</p>
                    <p className='text-[10px] text-muted-foreground'>
                      Armed for single bound breach
                    </p>
                  </div>
                </div>
              </div>
              <Link href='/permissions'>
                <Button
                  variant='outline'
                  className='w-full mt-4 text-xs font-mono bg-transparent'
                >
                  Permissions Control
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='mb-6'>
        <DashboardChart data={chartData} />
      </div>
    </DashboardPageLayout>
  )
}
