'use client'

import { GearIcon, LockIcon, ProcessorIcon, ZapIcon } from '@/app/icons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const iconMap: Record<string, typeof ProcessorIcon> = {
  ProcessorIcon,
  GearIcon,
  ZapIcon,
}

type Subscription = {
  id: string
  agent: {
    name: string
    can: string[]
    cannot: string[]
  }
  status: string
  permissionContext: string
  delegationManager: string
}

type PermissionsViewProps = {
  subscriptions: Subscription[]
}

export function PermissionsView({ subscriptions }: PermissionsViewProps) {
  if (subscriptions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <p className='text-muted-foreground text-sm'>
          No active subscriptions. Subscribe to agents in the marketplace.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {subscriptions.map(subscription => {
        const Icon = iconMap[subscription.agent.name] || ProcessorIcon
        const isActive = subscription.status === 'active'

        return (
          <Card key={subscription.id} className='border-border/40 py-3'>
            <CardHeader className='flex flex-row items-center justify-between py-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded bg-primary/10 text-primary'>
                  <Icon className='size-5' />
                </div>
                <div>
                  <CardTitle className='text-lg font-display tracking-tight'>
                    {subscription.agent.name}
                  </CardTitle>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-widest'>
                    {isActive ? 'Active Subscription' : 'Inactive'}
                  </p>
                </div>
              </div>
              <Badge
                variant='outline'
                className={`font-mono ${
                  isActive
                    ? 'text-success border-success/30 bg-success/5'
                    : 'text-muted-foreground border-muted-foreground/30'
                }`}
              >
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </CardHeader>
            <CardContent className='space-y-4 pt-4 border-t border-border/20'>
              <div className='space-y-3'>
                <div className='space-y-2'>
                  <p className='text-[10px] font-bold uppercase text-success flex items-center gap-1'>
                    Can do
                  </p>
                  <ul className='space-y-1'>
                    {subscription.agent.can.map(item => (
                      <li
                        key={`${subscription.id}-can-${item}`}
                        className='text-xs text-muted-foreground flex items-start gap-2'
                      >
                        <span className='text-success mt-1'>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='space-y-2'>
                  <p className='text-[10px] font-bold uppercase text-destructive flex items-center gap-1'>
                    Cannot do
                  </p>
                  <ul className='space-y-1'>
                    {subscription.agent.cannot.map(item => (
                      <li
                        key={`${subscription.id}-cannot-${item}`}
                        className='text-xs text-muted-foreground flex items-start gap-2'
                      >
                        <LockIcon className='size-3 text-destructive mt-0.5' />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className='pt-2 border-t border-border/20'>
                <div className='flex items-center justify-between space-x-4'>
                  <div className='flex-1 space-y-1'>
                    <Label className='text-sm font-bold uppercase tracking-tight'>
                      Subscription Status
                    </Label>
                    <p className='text-xs text-muted-foreground'>
                      {isActive
                        ? 'Agent is active and can execute transactions'
                        : 'Agent subscription is inactive'}
                    </p>
                  </div>
                  <Switch checked={isActive} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
