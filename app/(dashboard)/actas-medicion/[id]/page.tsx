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
import { Edit, ClipboardCheck, CheckCircle, XCircle, Calendar, Building2, User, FileText, AlertCircle } from 'lucide-react'
import { ApprovalActions } from '@/components/measurement-acts/approval-actions'
import { formatCurrency, formatDate } from '@/lib/format'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ActaMedicionDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const { data: am } = await supabase
    .from('measurement_acts')
    .select(`
      *,
      subcontract:subcontracts(
        code,
        total_amount,
        project:projects(code, name),
        subcontractor:subcontractors(name)
      ),
      items:measurement_act_items(
        *,
        subcontract_item:subcontract_items(*)
      ),
      created_by_profile:profiles!measurement_acts_created_by_fkey(full_name),
      approved_by_profile:profiles!measurement_acts_approved_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (!am) {
    notFound()
  }

  // Check if user can approve (jefe_obra for pending_jefe, admin for pending_admin)
  const canApproveJefe = profile?.role === 'jefe_obra' && am.status === 'pending_jefe'
  const canApproveAdmin = profile?.role === 'admin' && am.status === 'pending_admin'
  const canApprove = canApproveJefe || canApproveAdmin

  const totalMeasured = am.items?.reduce((acc: number, item: {
    measured_quantity: number
    subcontract_item?: { unit_price: number }
  }) => {
    return acc + (item.measured_quantity * (item.subcontract_item?.unit_price || 0))
  }, 0) || 0

  return (
    <>
      <PageHeader
        title={am.code}
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Actas de Medición', href: '/actas-medicion' },
          { label: am.code },
        ]}
        actions={
          am.status === 'draft' && (
            <Button variant="outline" asChild>
              <Link href={`/actas-medicion/${id}/editar`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
          )
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
                    <ClipboardCheck className="w-5 h-5" />
                    {am.code}
                  </CardTitle>
                  <CardDescription>
                    Período: {formatDate(am.period_start)} - {formatDate(am.period_end)}
                  </CardDescription>
                </div>
                <StatusBadge status={am.status} type="measurement_act" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Subcontrato</p>
                  <p className="font-medium">
                    <Link href={`/subcontratos/${am.subcontract_id}`} className="hover:underline text-primary">
                      {am.subcontract?.code}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subcontratista</p>
                  <p className="font-medium">{am.subcontract?.subcontractor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proyecto</p>
                  <p className="font-medium">
                    {am.subcontract?.project?.code} - {am.subcontract?.project?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creado por</p>
                  <p className="font-medium">
                    {am.created_by_profile?.full_name || 'Usuario'}
                  </p>
                </div>
              </div>
              {am.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Observaciones</p>
                  <p className="mt-1">{am.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Medición</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMeasured)}</p>
              </div>
              {am.status === 'approved' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>Aprobado por {am.approved_by_profile?.full_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(am.approved_at)}
                  </p>
                </div>
              )}
              {am.status === 'rejected' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span>Rechazado</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approval Actions */}
        {canApprove && (
          <ApprovalActions amId={id} currentStatus={am.status} />
        )}

        {/* Measurement Items */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Mediciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Nº</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-16">Ud.</TableHead>
                  <TableHead className="text-right w-24">P. Unitario</TableHead>
                  <TableHead className="text-right w-24">Contratado</TableHead>
                  <TableHead className="text-right w-24">Medición</TableHead>
                  <TableHead className="text-right w-24">Acumulado</TableHead>
                  <TableHead className="text-right w-28">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {am.items?.map((item: {
                  id: string
                  measured_quantity: number
                  accumulated_quantity: number
                  subcontract_item?: {
                    item_number: string
                    description: string
                    unit: string
                    unit_price: number
                    contracted_quantity: number
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
                    <TableCell className="text-right">
                      {item.subcontract_item?.contracted_quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.measured_quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.accumulated_quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(
                        item.measured_quantity * (item.subcontract_item?.unit_price || 0)
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(totalMeasured)}
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
