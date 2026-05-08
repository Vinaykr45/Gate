import DashboardLayoutClient from '@/app/dashboard/layout'

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
