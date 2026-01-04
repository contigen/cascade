'use client'

import { useRouter } from 'next/navigation'
import { type JSX, type SVGProps, useState } from 'react'
import { toast } from 'sonner'
import { getSessionAccountAddress, subscribeToAgent } from '@/actions'
import { getAgentPermissionConfig } from '@/app/constant'
import { GearIcon, ProcessorIcon, ShieldIcon, ZapIcon } from '@/app/icons'
import { Badge } from '@/components/ui/badge'
import { Bullet } from '@/components/ui/bullet'
import { Button, ButtonWithSpinner } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { requestAgentPermissions } from '@/lib/viem'

type Agent = {
  id: string
  name: string
  description: string
  cost: string
  iconName: string
  can: string[]
  cannot: string[]
}

type Subscription = {
  agentId: string
  agent: {
    name: string
  }
  status: string
}

type MarketplaceViewProps = {
  agents: Agent[]
  subscriptions: Subscription[]
}

const iconMap: Record<string, (props: SVGProps<SVGSVGElement>) => JSX.Element> =
  {
    ProcessorIcon,
    GearIcon,
    ZapIcon,
  }

export function MarketplaceView({
  agents,
  subscriptions,
}: MarketplaceViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const router = useRouter()

  function handleSubscribe(agent: Agent) {
    setSelectedAgent(agent)
    setIsConfirming(true)
  }

  async function confirmSubscription() {
    if (!selectedAgent) return

    setIsSubscribing(true)
    try {
      const sessionAddress = await getSessionAccountAddress()
      const permissionConfig = getAgentPermissionConfig(selectedAgent.name)
      if (!permissionConfig) {
        throw new Error(
          `No permission config found for agent: ${selectedAgent.name}`
        )
      }
      const grantedPermissions = await requestAgentPermissions(
        sessionAddress,
        permissionConfig
      )

      if (!grantedPermissions || grantedPermissions.length === 0) {
        throw new Error('Failed to get permissions')
      }

      toast.info('Permissions granted successfully')
      const result = await subscribeToAgent({
        agentName: selectedAgent.name,
        description: selectedAgent.description,
        cost: selectedAgent.cost,
        iconName: selectedAgent.iconName,
        grantedPermissions,
      })

      if (result?.success) {
        toast.success(`Subscribed to ${selectedAgent.name}`, {
          description: 'Permissions granted. Agent is now active.',
        })
        setIsConfirming(false)
        setSelectedAgent(null)
        router.refresh()
      } else {
        toast.error('Failed to subscribe to agent')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to subscribe to agent'
      )
    } finally {
      setIsSubscribing(false)
    }
  }

  function isSubscribed(agentName: string) {
    return subscriptions.some(
      sub => sub.agent.name === agentName && sub.status === 'active'
    )
  }

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {agents.map(agent => {
          const Icon = iconMap[agent.iconName] || ProcessorIcon
          const subscribed = isSubscribed(agent.name)

          return (
            <Card
              key={agent.id}
              className='flex flex-col border-border/40 hover:border-primary/50 transition-colors'
            >
              <CardHeader>
                <div className='flex justify-between items-start mb-2'>
                  <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                    <Icon className='size-6' />
                  </div>
                  <Badge variant='secondary' className='font-mono text-[10px]'>
                    {agent.cost}/DAY
                  </Badge>
                </div>
                <CardTitle className='text-xl font-display'>
                  {agent.name}
                </CardTitle>
                <p className='text-xs text-muted-foreground mt-2 leading-relaxed'>
                  {agent.description}
                </p>
              </CardHeader>
              <CardContent className='flex-1 space-y-4'>
                <div className='space-y-2'>
                  <p className='text-[10px] font-bold uppercase text-success flex items-center gap-1'>
                    <ShieldIcon className='size-3' /> Can do
                  </p>
                  <ul className='space-y-1'>
                    {agent.can.map(item => (
                      <li
                        key={item}
                        className='text-xs text-muted-foreground flex items-start gap-2'
                      >
                        <Bullet className='mt-1' />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='space-y-2'>
                  <p className='text-[10px] font-bold uppercase text-destructive flex items-center gap-1'>
                    <ShieldIcon className='size-3' /> Cannot do
                  </p>
                  <ul className='space-y-1'>
                    {agent.cannot.map(item => (
                      <li
                        key={item}
                        className='text-xs text-muted-foreground flex items-start gap-2'
                      >
                        <Bullet className='mt-1' />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className='pt-4 border-t border-border/20'>
                <Button
                  onClick={() => handleSubscribe(agent)}
                  className='w-full font-display uppercase tracking-wider'
                  disabled={subscribed}
                  variant={subscribed ? 'outline' : 'default'}
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {selectedAgent && (
        <Dialog
          open={isConfirming}
          onOpenChange={open => {
            setIsConfirming(open)
            if (!open) {
              setSelectedAgent(null)
            }
          }}
        >
          <DialogContent className='max-w-md border-border/40'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-display uppercase tracking-tight'>
                Review Subscription
              </DialogTitle>
              <DialogDescription className='text-xs uppercase font-mono tracking-widest text-primary'>
                Pre-approval Summary & Safety Bounds
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-6 py-4'>
              <div className='p-4 rounded bg-primary/5 border border-primary/20 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {(() => {
                    const Icon =
                      iconMap[selectedAgent.iconName] || ProcessorIcon
                    return <Icon className='size-6 text-primary' />
                  })()}
                  <div>
                    <p className='text-sm font-bold uppercase'>
                      {selectedAgent.name}
                    </p>
                    <p className='text-[10px] text-muted-foreground uppercase'>
                      {selectedAgent.cost}/DAY
                    </p>
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className='text-success border-success/30 font-mono'
                >
                  READY
                </Badge>
              </div>

              <div className='space-y-3'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2'>
                  <ShieldIcon className='size-3' /> Permission Bounds
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='p-3 rounded bg-success/5 border border-success/10'>
                    <p className='text-[9px] font-bold text-success uppercase mb-1'>
                      Grant Access
                    </p>
                    <ul className='space-y-1'>
                      {selectedAgent.can.slice(0, 2).map((item: string) => (
                        <li
                          key={item}
                          className='text-[10px] text-muted-foreground flex items-center gap-1'
                        >
                          <Bullet className='size-1' /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className='p-3 rounded bg-destructive/5 border border-destructive/10'>
                    <p className='text-[9px] font-bold text-destructive uppercase mb-1'>
                      Restrict Access
                    </p>
                    <ul className='space-y-1'>
                      {selectedAgent.cannot.slice(0, 2).map((item: string) => (
                        <li
                          key={item}
                          className='text-[10px] text-muted-foreground flex items-center gap-1'
                        >
                          <Bullet className='size-1' /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className='p-3 rounded bg-muted/30 border border-border/20 text-center'>
                <p className='text-[10px] text-muted-foreground uppercase leading-relaxed'>
                  By subscribing, you authorise the Smart Account to execute
                  transactions within these defined bounds.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsConfirming(false)}
                className='uppercase font-display'
                disabled={isSubscribing}
              >
                Cancel
              </Button>
              <ButtonWithSpinner
                onClick={confirmSubscription}
                className='uppercase font-display'
                pending={isSubscribing}
                strokeColor='white'
              >
                {isSubscribing ? 'Granting...' : 'Confirm & Grant'}
              </ButtonWithSpinner>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
