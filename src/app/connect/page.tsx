'use client'

import { Glasses } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { use, useState } from 'react'
import { toast } from 'sonner'
import { getSessionAccount } from '@/actions'
import { ShieldIcon, WalletIcon, ZapIcon } from '@/app/icons'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { ButtonWithSpinner } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { checkForSmartAccountUpgrade, requestPermissions } from '@/lib/viem'
import { connectWallet } from '@/lib/wallet'

export default function WalletConnectPage({
  searchParams,
}: PageProps<'/connect'>) {
  const errorParam = use(searchParams).error as string | undefined
  const [address, setAddress] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [pendingPermissions, setPendingPermissions] = useState(false)

  async function handleConnect() {
    setPending(true)
    try {
      const { address } = await connectWallet()
      const isAccountUpgraded = await checkForSmartAccountUpgrade()
      if (isAccountUpgraded) {
        toast.success('Wallet upgraded to smart account')
      } else {
        toast.warning('Wallet not upgraded to smart account')
        // return
      }
      setPending(false)
      if (address) {
        setAddress(address)
        toast.info(
          `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`
        )
        await signIn('credentials', {
          walletAddress: address,
        })
      } else {
        toast.warning('Failed to connect wallet')
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Failed to connect wallet')
    } finally {
      setPending(false)
    }
  }

  async function handleRequestPermissions() {
    if (!address) {
      toast.warning('Please connect your wallet first')
      return
    }

    setPendingPermissions(true)
    try {
      const sessionAddress = await getSessionAccount()
      const grantedPermissions = await requestPermissions(sessionAddress)
      console.log('grantedPermissions', grantedPermissions)
      if (grantedPermissions?.length) {
        const permission = grantedPermissions[0]
        toast.success('Permissions granted successfully', {
          description: `Context: ${permission.context.slice(0, 10)}...`,
        })
      } else {
        toast.warning('No permissions were granted')
      }
    } catch {
      toast.error('Failed to request permissions')
    } finally {
      setPendingPermissions(false)
    }
  }

  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden'>
      <div className='absolute top-0 left-0 w-full h-full pointer-events-none opacity-5'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-xl dark:blur-2xl' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-xl dark:blur-2xl' />
      </div>
      <div className='w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10'>
        <div className='space-y-8'>
          <div className='flex items-center gap-3'>
            <div className='size-10 bg-primary flex items-center justify-center rounded-sm'>
              <Glasses className='size-6 dark:text-black text-white' />
            </div>
            <h1 className='text-4xl font-display uppercase tracking-tighter'>
              Cascade.
            </h1>
          </div>

          <div className='space-y-4'>
            <h2 className='text-5xl font-display leading-[0.9] uppercase italic tracking-tighter'>
              The Protocol <br /> For Autonomous <br />{' '}
              <span className='text-primary'>Subscriptions</span>
            </h2>
            <p className='text-muted-foreground max-w-md leading-relaxed'>
              Cascade enables wallet-native recurring payments and agent
              permissions via ERC-7715. Connect your smart account to manage
              autonomous workflows with complete safety bounds.
            </p>
          </div>

          <div className='space-y-4 pt-4'>
            <div className='flex items-start gap-4 p-4 border bg-muted/20 rounded-lg'>
              <ShieldIcon className='size-5 text-primary shrink-0 mt-1' />
              <div>
                <h4 className='text-sm font-bold uppercase tracking-tight'>
                  Granular Permissions
                </h4>
                <p className='text-xs text-muted-foreground'>
                  Define exactly what an agent can do within your wallet without
                  manual approvals.
                </p>
              </div>
            </div>
            <div className='flex items-start gap-4 p-4 border bg-muted/20 rounded-lg'>
              <ZapIcon className='size-5 text-primary shrink-0 mt-1' />
              <div>
                <h4 className='text-sm font-bold uppercase tracking-tight'>
                  ERC-7715 Native
                </h4>
                <p className='text-xs text-muted-foreground'>
                  Built on the latest standards for cross-chain subscription
                  portability and compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
        <span className='border-2 border-muted-foreground hover:bg-muted inline-flex justify-center'>
          <ThemeToggle />
        </span>
        <div className='flex flex-col gap-4 -col-end-1'>
          <Card className='border-2 border-primary shadow-[8px_8px_0px_0px_rgba(var(--primary-rgb),0.2)]'>
            <CardHeader className='my-4'>
              <CardTitle className='text-xl font-display uppercase italic tracking-tight'>
                Connect Wallet
              </CardTitle>
              <CardDescription
                className={`font-mono text-[10px] uppercase ml-1 ${
                  errorParam ? 'text-destructive' : ''
                }`}
              >
                {errorParam
                  ? 'Authentication failed. Please try again.'
                  : 'Select your smart account provider'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {[
                {
                  name: 'MetaMask',
                  type: 'Browser Extension',
                  icon: WalletIcon,
                },
              ].map(wallet => (
                <ButtonWithSpinner
                  key={wallet.name}
                  variant='outline'
                  className='w-full justify-between h-14 group hover:border-primary hover:bg-primary/5 transition-all mb-3 bg-transparent'
                  onClick={handleConnect}
                  pending={pending}
                >
                  <div className='flex items-center gap-3'>
                    <div className='size-8 bg-muted group-hover:bg-primary/20 flex items-center justify-center rounded transition-colors'>
                      <wallet.icon className='size-4' />
                    </div>
                    <div className='text-left'>
                      <div className='text-sm font-bold uppercase tracking-tight'>
                        {wallet.name}
                      </div>
                      <div className='text-[10px] text-muted-foreground font-mono'>
                        {wallet.type}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant='outline'
                    className={`text-[10px] ${
                      address ? 'opacity-100' : 'opacity-0'
                    } group-hover:opacity-100 transition-opacity rounded-none border-2`}
                  >
                    {address ? 'CONNECTED' : 'DISCONNECTED'}
                  </Badge>
                </ButtonWithSpinner>
              ))}
              <ButtonWithSpinner
                className='group border-primary transition-all mb-3 bg-primary w-full uppercase tracking-tight'
                onClick={handleRequestPermissions}
                pending={pendingPermissions}
                strokeColor='white'
              >
                Request Permissions
              </ButtonWithSpinner>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
