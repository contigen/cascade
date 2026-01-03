import { DashboardPageLayout } from '@/app/(app)/dashboard-layout'
import { LockIcon, ProcessorIcon } from '@/app/icons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const permissionsData = [
  {
    agent: 'Portfolio Rebalancer',
    status: 'Active',
    permissions: [
      {
        id: 'swap',
        label: 'Asset Swapping',
        description: 'Allow agent to execute swaps on DEXs',
        enabled: true,
      },
      {
        id: 'withdraw',
        label: 'External Withdrawals',
        description: 'Allow agent to move funds out',
        enabled: false,
      },
    ],
  },
  {
    agent: 'Gas Optimizer',
    status: 'Active',
    permissions: [
      {
        id: 'batch',
        label: 'Batch Transactions',
        description: 'Allow bundling multiple TXs',
        enabled: true,
      },
      {
        id: 'bridge',
        label: 'Cross-chain Bridging',
        description: 'Allow moving assets across L2s',
        enabled: true,
      },
    ],
  },
]

export default function PermissionsPage() {
  return (
    <DashboardPageLayout
      header={{
        title: 'Permissions',
        description: 'Manage agent access and security bounds',
      }}
    >
      <div className='space-y-6'>
        {permissionsData.map(agent => (
          <Card key={agent.agent} className='border-border/40'>
            <CardHeader className='flex flex-row items-center justify-between py-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded bg-primary/10 text-primary'>
                  <ProcessorIcon className='size-5' />
                </div>
                <div>
                  <CardTitle className='text-lg font-display'>
                    {agent.agent}
                  </CardTitle>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-widest'>
                    Active Subscription
                  </p>
                </div>
              </div>
              <Badge
                variant='outline'
                className='text-success border-success/30 bg-success/5 font-mono'
              >
                COMPLIANT
              </Badge>
            </CardHeader>
            <CardContent className='space-y-4 pt-4 border-t border-border/20'>
              {agent.permissions.map(perm => (
                <div
                  key={perm.id}
                  className='flex items-center justify-between space-x-4'
                >
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <Label
                        htmlFor={perm.id}
                        className='text-sm font-bold uppercase tracking-tight'
                      >
                        {perm.label}
                      </Label>
                      {!perm.enabled && (
                        <LockIcon className='size-3 text-destructive' />
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {perm.description}
                    </p>
                  </div>
                  <Switch id={perm.id} defaultChecked={perm.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardPageLayout>
  )
}
