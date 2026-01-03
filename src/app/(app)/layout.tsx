import { Sidebar } from '@/components/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='w-full flex min-h-screen'>
      <div className='hidden lg:block w-64 border-r border-border sticky top-0 h-screen'>
        <Sidebar />
      </div>
      <div className='flex-1 overflow-auto'>{children}</div>
    </div>
  )
}
