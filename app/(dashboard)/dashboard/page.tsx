import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { PendingApprovals } from '@/components/dashboard/pending-approvals'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard statistics
  const [
    { count: totalSubcontracts },
    { count: activeSubcontracts },
    { count: projectsCount },
    { count: subcontractorsCount },
    { data: subcontracts },
    { data: pendingAMs },
    { data: pendingCertificates },
    { data: recentAMs },
    { data: recentCertificates },
  ] = await Promise.all([
    supabase.from('subcontracts').select('*', { count: 'exact', head: true }),
    supabase.from('subcontracts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('subcontractors').select('*', { count: 'exact', head: true }),
    supabase.from('subcontracts').select('total_amount'),
    supabase.from('measurement_acts').select('*, subcontract:subcontracts(code, subcontractor:subcontractors(name))').in('status', ['pending_jefe', 'pending_admin']).limit(5),
    supabase.from('certificates').select('*, subcontract:subcontracts(code, subcontractor:subcontractors(name))').in('status', ['pending_jefe', 'pending_admin']).limit(5),
    supabase.from('measurement_acts').select('*, subcontract:subcontracts(code, subcontractor:subcontractors(name))').order('created_at', { ascending: false }).limit(5),
    supabase.from('certificates').select('*, subcontract:subcontracts(code, subcontractor:subcontractors(name))').order('created_at', { ascending: false }).limit(5),
  ])

  const totalContractedAmount = subcontracts?.reduce((acc, s) => acc + (s.total_amount || 0), 0) || 0

  // Calculate total certified from approved certificates
  const { data: allCertificates } = await supabase
    .from('certificates')
    .select('total')
    .in('status', ['approved', 'issued'])

  const totalCertifiedAmount = allCertificates?.reduce((acc, c) => acc + (c.total || 0), 0) || 0

  const stats = {
    totalSubcontracts: totalSubcontracts || 0,
    activeSubcontracts: activeSubcontracts || 0,
    projectsCount: projectsCount || 0,
    subcontractorsCount: subcontractorsCount || 0,
    totalContractedAmount,
    totalCertifiedAmount,
    pendingAMs: pendingAMs?.length || 0,
    pendingCertificates: pendingCertificates?.length || 0,
  }

  return (
    <>
      <PageHeader 
        title="Panel de Control"
        breadcrumbs={[{ label: 'Panel' }]}
      />
      <div className="flex-1 p-6">
        <DashboardStats stats={stats} />
        
        <div className="grid gap-6 mt-6 lg:grid-cols-2">
          <PendingApprovals 
            pendingAMs={pendingAMs || []} 
            pendingCertificates={pendingCertificates || []} 
          />
          <RecentActivity 
            recentAMs={recentAMs || []} 
            recentCertificates={recentCertificates || []} 
          />
        </div>
      </div>
    </>
  )
}
