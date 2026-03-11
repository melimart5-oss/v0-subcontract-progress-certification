import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { TrackingContent } from '@/components/tracking/tracking-content'

export default async function SeguimientoPage() {
  const supabase = await createClient()

  // Fetch all data for tracking
  const [
    { data: subcontracts },
    { data: certificates },
  ] = await Promise.all([
    supabase.from('subcontracts').select(`
      *,
      subcontractor:subcontractors(name),
      project:projects(code, name)
    `).eq('status', 'active'),
    supabase.from('certificates').select('*').in('status', ['approved', 'issued']),
  ])

  // Calculate totals
  const totalContracted = subcontracts?.reduce((acc, s) => acc + (s.total_amount || 0), 0) || 0
  const totalCertified = certificates?.reduce((acc, c) => acc + (c.total || 0), 0) || 0

  // Calculate per-subcontract stats
  const subcontractStats = subcontracts?.map(sub => {
    const subCertificates = certificates?.filter(c => c.subcontract_id === sub.id) || []
    const certified = subCertificates.reduce((acc, c) => acc + (c.total || 0), 0)
    const percentage = sub.total_amount > 0 ? (certified / sub.total_amount) * 100 : 0
    
    return {
      id: sub.id,
      code: sub.code,
      total_amount: sub.total_amount,
      certified,
      percentage,
      certificateCount: subCertificates.length,
      subcontractor: sub.subcontractor,
      project: sub.project,
    }
  }) || []

  // Sort by certification percentage
  const sortedStats = [...subcontractStats].sort((a, b) => b.percentage - a.percentage)

  return (
    <>
      <PageHeader
        title="Seguimiento"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Seguimiento' },
        ]}
      />
      <TrackingContent
        totalContracted={totalContracted}
        totalCertified={totalCertified}
        subcontractsCount={subcontracts?.length || 0}
        certificatesCount={certificates?.length || 0}
        sortedStats={sortedStats}
      />
    </>
  )
}
