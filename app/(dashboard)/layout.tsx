import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { CurrencyProvider } from '@/lib/currency-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <CurrencyProvider>
      <SidebarProvider>
        <AppSidebar user={user} profile={profile} />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </CurrencyProvider>
  )
}
