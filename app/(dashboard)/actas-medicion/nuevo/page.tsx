import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { MeasurementActForm } from '@/components/measurement-acts/measurement-act-form'

interface PageProps {
  searchParams: Promise<{ subcontract?: string }>
}

export default async function NuevaActaMedicionPage({ searchParams }: PageProps) {
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
        title="Nueva Acta de Medición"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Actas de Medición', href: '/actas-medicion' },
          { label: 'Nueva' },
        ]}
      />
      <div className="flex-1 p-6">
        <MeasurementActForm 
          subcontracts={subcontracts || []} 
          preselectedSubcontract={preselectedSubcontract}
        />
      </div>
    </>
  )
}
