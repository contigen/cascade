'use client'

import { Glasses } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ActivityIcon, LayoutIcon, ShieldIcon, ZapIcon } from '@/app/icons'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

const navigation = [
  {
    title: 'Dashboard',
    url: '/',
    icon: ZapIcon,
  },
  {
    title: 'Marketplace',
    url: '/marketplace',
    icon: LayoutIcon,
  },
  {
    title: 'Permissions',
    url: '/permissions',
    icon: ShieldIcon,
  },
  {
    title: 'Monitoring',
    url: '/monitoring',
    icon: ActivityIcon,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className='flex flex-col h-full bg-background border-r border-border'>
      <div className='p-6 border-b border-border'>
        <div className='flex items-center gap-3'>
          <div className='size-10 bg-primary rounded flex items-center justify-center'>
            <Glasses className='size-6 dark:text-black text-white' />
          </div>
          <div>
            <h1 className='text-xl font-display font-bold tracking-tight'>
              CASCADE
            </h1>
            <p className='text-[10px] text-muted-foreground font-mono'>
              ERC-7715
            </p>
          </div>
          <div className='ml-auto'>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <nav className='flex-1 p-4 space-y-1'>
        {navigation.map(item => {
          const isActive = pathname === item.url
          const Icon = item.icon

          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className='size-5' />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className='p-4 border-t border-border'>
        <div className='text-[10px] text-muted-foreground font-mono space-y-1'>
          <p>Wallet-native subscriptions</p>
          <p>Powered by ERC-7715</p>
        </div>
      </div>
    </div>
  )
}
