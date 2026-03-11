import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Edit, Award, Printer } from 'lucide-react'
import { CertificateApprovalActions } from '@/components/certificates/certificate-approval-actions'
import { CertificateSummaryCard, CertificateItemsTable } from '@/components/certificates/certificate-detail-content'
import { formatDate } from '@/lib/format'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CertificacionDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const { data: certificate } = await supabase
    .from('certificates')
    .select(`
      *,
      subcontract:subcontracts(
        code,
        total_amount,
        project:projects(code, name),
        subcontractor:subcontractors(name, cif, address)
      ),
      items:certificate_items(
        *,
        subcontract_item:subcontract_items(*)
      ),
      created_by_profile:profiles!certificates_created_by_fkey(full_name),
      approved_by_profile:profiles!certificates_approved_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (!certificate) {
    notFound()
  }

  const canApprove = (profile?.role === 'admin' || profile?.role === 'jefe_obra') && 
    certificate.status === 'pending_approval'

  return (
    <>
      <PageHeader
        title={certificate.code}
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Certificaciones', href: '/certificaciones' },
          { label: certificate.code },
        ]}
        actions={
          <div className="flex gap-2">
            {certificate.status === 'draft' && (
              <Button variant="outline" asChild>
                <Link href={`/certificaciones/${id}/editar`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
            {certificate.status === 'approved' && (
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            )}
          </div>
        }
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Header Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {certificate.code}
                  </CardTitle>
                  <CardDescription>
                    Período: {formatDate(certificate.period_start)} - {formatDate(certificate.period_end)}
                  </CardDescription>
                </div>
                <StatusBadge status={certificate.status} type="certificate" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Subcontrato</p>
                  <p className="font-medium">
                    <Link href={`/subcontratos/${certificate.subcontract_id}`} className="hover:underline text-primary">
                      {certificate.subcontract?.code}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subcontratista</p>
                  <p className="font-medium">{certificate.subcontract?.subcontractor?.name}</p>
                  <p className="text-sm text-muted-foreground">{certificate.subcontract?.subcontractor?.cif}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proyecto</p>
                  <p className="font-medium">
                    {certificate.subcontract?.project?.code} - {certificate.subcontract?.project?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creado por</p>
                  <p className="font-medium">
                    {certificate.created_by_profile?.full_name || 'Usuario'}
                  </p>
                </div>
              </div>
              {certificate.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Observaciones</p>
                  <p className="mt-1">{certificate.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <CertificateSummaryCard certificate={certificate} />
        </div>

        {/* Approval Actions */}
        {canApprove && (
          <CertificateApprovalActions certificateId={id} />
        )}

        {/* Certificate Items */}
        <CertificateItemsTable certificate={certificate} />
      </div>
    </>
  )
}
