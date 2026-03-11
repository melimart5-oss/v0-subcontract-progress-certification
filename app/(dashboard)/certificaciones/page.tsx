import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { CertificatesList } from '@/components/certificates/certificates-list'

export default async function CertificacionesPage() {
  const supabase = await createClient()

  const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      *,
      subcontract:subcontracts(
        code,
        project:projects(code, name),
        subcontractor:subcontractors(name)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <>
      <PageHeader
        title="Certificaciones"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Certificaciones' },
        ]}
      />
      <div className="flex-1 p-6">
        <CertificatesList certificates={certificates || []} />
      </div>
    </>
  )
}
