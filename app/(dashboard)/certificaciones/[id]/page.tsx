import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Edit, Award, CheckCircle, Printer, Building2, User, Calendar, TrendingUp } from 'lucide-react'
import { CertificateApprovalActions } from '@/components/certificates/certificate-approval-actions'
import { formatCurrency, formatDate } from '@/lib/format'

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

          <Card>
            <CardHeader>
              <CardTitle>Resumen Económico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-xl font-medium">{formatCurrency(certificate.subtotal || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IVA ({certificate.tax_rate}%)</p>
                <p className="text-xl font-medium">{formatCurrency(certificate.tax_amount || 0)}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(certificate.total || 0)}</p>
              </div>
              {certificate.status === 'approved' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>Aprobado por {certificate.approved_by_profile?.full_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(certificate.approved_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approval Actions */}
        {canApprove && (
          <CertificateApprovalActions certificateId={id} />
        )}

        {/* Certificate Items */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Partidas Certificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Nº</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-16">Ud.</TableHead>
                  <TableHead className="text-right w-24">P. Unitario</TableHead>
                  <TableHead className="text-right w-24">Certificado</TableHead>
                  <TableHead className="text-right w-24">Acumulado</TableHead>
                  <TableHead className="text-right w-28">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificate.items?.map((item: {
                  id: string
                  certified_quantity: number
                  certified_amount: number
                  accumulated_quantity: number
                  subcontract_item?: {
                    item_number: string
                    description: string
                    unit: string
                    unit_price: number
                  }
                }) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.subcontract_item?.item_number}
                    </TableCell>
                    <TableCell>{item.subcontract_item?.description}</TableCell>
                    <TableCell>{item.subcontract_item?.unit}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.subcontract_item?.unit_price || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.certified_quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.accumulated_quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.certified_amount || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-right">Subtotal</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(certificate.subtotal || 0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} className="text-right">
                    IVA ({certificate.tax_rate}%)
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(certificate.tax_amount || 0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {formatCurrency(certificate.total || 0)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
