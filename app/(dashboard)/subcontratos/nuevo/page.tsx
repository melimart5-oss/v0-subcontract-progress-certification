import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { SubcontractForm } from '@/components/subcontracts/subcontract-form'

export default async function NuevoSubcontratoPage() {
  const supabase = await createClient()

  const [{ data: projects }, { data: subcontractors }] = await Promise.all([
    supabase.from('projects').select('id, code, name').eq('status', 'active').order('name'),
    supabase.from('subcontractors').select('id, company_name').order('company_name'),
  ])

  // Transform subcontractors to match the expected format
  const formattedSubcontractors = (subcontractors || []).map(s => ({
    id: s.id,
    code: s.id,
    name: s.company_name || '',
  }))

  return (
    <>
      <PageHeader
        title="Nuevo Subcontrato"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Subcontratos', href: '/subcontratos' },
          { label: 'Nuevo' },
        ]}
      />
      <div className="flex-1 p-6">
        <SubcontractForm 
          projects={projects || []} 
          subcontractors={formattedSubcontractors} 
        />
      </div>
    </>
  )
}
