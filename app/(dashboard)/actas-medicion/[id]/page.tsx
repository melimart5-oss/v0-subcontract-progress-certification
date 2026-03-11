import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Edit, ClipboardCheck } from 'lucide-react'
import { ApprovalActions } from '@/components/measurement-acts/approval-actions'
import { MeasurementActSummaryCard, MeasurementActItemsTable } from '@/components/measurement-acts/measurement-act-detail-content'
import { formatDate } from '@/lib/format'

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

          <MeasurementActSummaryCard
            totalMeasured={totalMeasured}
            status={am.status}
            approvedAt={am.approved_at}
            approvedByName={am.approved_by_profile?.full_name}
          />
        </div>

        {/* Approval Actions */}
        {canApprove && (
          <ApprovalActions amId={id} currentStatus={am.status} />
        )}

        {/* Measurement Items */}
        <MeasurementActItemsTable
          items={am.items || []}
          totalMeasured={totalMeasured}
        />
      </div>
    </>
  )
}
