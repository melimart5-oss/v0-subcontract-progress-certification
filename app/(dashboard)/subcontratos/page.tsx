import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { SubcontractsList } from '@/components/subcontracts/subcontracts-list'

export default async function SubcontratosPage() {
  const supabase = await createClient()

  const [{ data: subcontracts }, { data: certificates }] = await Promise.all([
    supabase.from('subcontracts').select(`
      *,
      project:projects(code, name),
      subcontractor:subcontractors(code, name)
    `).order('created_at', { ascending: false }),
    supabase.from('certificates').select('subcontract_id, total').in('status', ['approved', 'issued']),
  ])

  // Calculate certified amount per subcontract
  const certifiedBySubcontract = (certificates || []).reduce((acc, cert) => {
    acc[cert.subcontract_id] = (acc[cert.subcontract_id] || 0) + (cert.total || 0)
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <PageHeader
        title="Subcontratos"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Subcontratos' },
        ]}
      />
      <div className="flex-1 p-6">
        <SubcontractsList 
          subcontracts={subcontracts || []} 
          certifiedBySubcontract={certifiedBySubcontract} 
        />
      </div>
    </>
  )
}
