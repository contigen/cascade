import { getUserAgentLogs } from '@/actions'
import { DashboardPageLayout } from '@/app/(app)/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogItem } from './log-item'

export const revalidate = 10

export default async function MonitoringPage() {
  const logs = await getUserAgentLogs()
  const activityLogs = logs || []

  const activeAgents = new Set(activityLogs.map(log => log.agentName)).size
  const executions24h = activityLogs.filter(
    log =>
      log.createdAt &&
      new Date(log.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length
  const haltedLogs = activityLogs.filter(
    log => log.status === 'error' || log.status === 'Failed'
  ).length
  return (
    <DashboardPageLayout
      header={{
        title: 'Live Monitoring',
        description: 'Real-time autonomous execution feed',
      }}
    >
      <div className='space-y-6 overflow-x-hidden'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className='bg-primary/5 border-primary/20 p-0'>
            <CardHeader className='pb-2 p-4 h-auto px-4'>
              <p className='text-[10px] font-bold uppercase text-primary tracking-widest'>
                Active Agents
              </p>
              <CardTitle className='text-3xl font-display'>
                {activeAgents}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className='bg-success/5 border-success/20 p-0'>
            <CardHeader className='py-4 p-4 h-auto px-4'>
              <p className='text-[10px] font-bold uppercase text-success tracking-widest'>
                Executions (24h)
              </p>
              <CardTitle className='text-3xl font-display'>
                {executions24h}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className='bg-destructive/5 border-destructive/20 p-0'>
            <CardHeader className='p-4 h-auto px-4'>
              <p className='text-[10px] font-bold uppercase text-destructive tracking-widest'>
                Halted Logs
              </p>
              <CardTitle className='text-3xl font-display'>
                {haltedLogs}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className='space-y-4 my-6 overflow-x-hidden'>
          <div className='space-y-2'>
            {activityLogs.length === 0 ? (
              <Card className='border-border/40'>
                <CardContent className='p-8 text-center text-muted-foreground'>
                  <p>No agent activity logs yet</p>
                </CardContent>
              </Card>
            ) : (
              activityLogs.map(log => <LogItem key={log.id} log={log} />)
            )}
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
