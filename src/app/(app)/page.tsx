import { ActivityIcon, ShieldIcon, WalletIcon, ZapIcon } from '@/app/icons'
import { DashboardChart } from '@/components/chart'
import { Stat } from '@/components/stat'
import { Badge } from '@/components/ui/badge'
import { Bullet } from '@/components/ui/bullet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardPageLayout } from './dashboard-layout'

export default function Page() {
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
            <div className='text-2xl font-display truncate'>0x71C...4f92</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Connected via MetaMask
            </p>
            <div className='flex gap-2 mt-4'>
              <Badge
                variant='outline'
                className='text-[10px] border-primary/30 text-primary'
              >
                ERC-7715 ACTIVE
              </Badge>
              <Badge variant='outline' className='text-[10px]'>
                MAINNET
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Stat
          label='Daily Spend Limit'
          value='$50.00'
          description='$34.20 remaining today'
          icon={WalletIcon}
        />

        <Stat
          label='Active Agents'
          value='3'
          description='Running autonomously'
          icon={ZapIcon}
        />
      </div>

      {/* Live Activity & Permission Status */}
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
              {[
                {
                  agent: 'Portfolio Rebalancer',
                  action: 'Swapped 0.5 ETH for USDC',
                  time: '2m ago',
                  status: 'Permitted',
                },
                {
                  agent: 'Gas Optimizer',
                  action: 'Bridged 1.2 ETH to Base',
                  time: '15m ago',
                  status: 'Permitted',
                },
                {
                  agent: 'Portfolio Rebalancer',
                  action: 'Rebalanced WBTC/ETH pool',
                  time: '1h ago',
                  status: 'Permitted',
                },
              ].map((item, i) => (
                <div
                  key={i}
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
                      className='text-[10px] border-success/50 text-success'
                    >
                      {item.status}
                    </Badge>
                    <p className='text-[10px] text-muted-foreground block'>
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                variant='ghost'
                className='w-full text-xs text-muted-foreground hover:text-primary'
              >
                View All Executions
              </Button>
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
                  <span>$15.80 / $50.00</span>
                </div>
                <div className='h-2 bg-muted rounded-full overflow-hidden'>
                  <div className='h-full bg-primary w-[31%]' />
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
              <Button
                variant='outline'
                className='w-full mt-4 text-xs font-mono bg-transparent'
              >
                Permissions Control
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='mb-6'>
        <DashboardChart />
      </div>
    </DashboardPageLayout>
  )
}
