import { getUserId } from '@/actions'
import { DashboardPageLayout } from '@/app/(app)/dashboard-layout'
import { getUserSubscriptions } from '@/lib/db-queries'
import { PermissionsView } from './permissions-view'

export default async function PermissionsPage() {
  const userId = (await getUserId())!
  const result = await getUserSubscriptions(userId)
  const subscriptions = result || []

  return (
    <DashboardPageLayout
      header={{
        title: 'Permissions',
        description: 'Manage agent access and security bounds',
      }}
    >
      <PermissionsView subscriptions={subscriptions} />
    </DashboardPageLayout>
  )
}
