import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { CertificateForm } from '@/components/certificates/certificate-form'

interface PageProps {
  searchParams: Promise<{ subcontract?: string }>
}

export default async function NuevaCertificacionPage({ searchParams }: PageProps) {
  const { subcontract: subcontractId } = await searchParams
  const supabase = await createClient()

  // Get active subcontracts with their items
  const { data: subcontracts } = await supabase
    .from('subcontracts')
    .select(`
      id, 
      code, 
      subcontractor:subcontractors(name),
      items:subcontract_items(*)
    `)
    .eq('status', 'active')
    .order('code')

  // If subcontract is pre-selected, get its items
  let preselectedSubcontract = null
  if (subcontractId) {
    const match = subcontracts?.find(s => s.id === subcontractId)
    if (match) {
      preselectedSubcontract = match
    }
  }

  return (
    <>
      <PageHeader
        title="Nueva Certificación"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Certificaciones', href: '/certificaciones' },
          { label: 'Nueva' },
        ]}
      />
      <div className="flex-1 p-6">
        <CertificateForm 
          subcontracts={subcontracts || []} 
          preselectedSubcontract={preselectedSubcontract}
        />
      </div>
    </>
  )
}
