import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, ClipboardCheck, Eye } from 'lucide-react'

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending_approval: 'outline',
  approved: 'default',
  rejected: 'destructive',
}

export default async function ActasMedicionPage() {
  const supabase = await createClient()

  const { data: measurementActs } = await supabase
    .from('measurement_acts')
    .select(`
      *,
      subcontract:subcontracts(
        code,
        project:projects(code, name),
        subcontractor:subcontractors(name)
      )
    `)
    .order('created_at', { ascending: false })

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES')
  }

  return (
    <>
      <PageHeader
        title="Actas de Medición"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Actas de Medición' },
        ]}
        actions={
          <Button asChild>
            <Link href="/actas-medicion/nuevo">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Acta
            </Link>
          </Button>
        }
      />
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Lista de Actas de Medición
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!measurementActs || measurementActs.length === 0 ? (
              <Empty
                title="Sin actas de medición"
                description="No hay actas de medición registradas. Crea la primera para comenzar."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código AM</TableHead>
                      <TableHead>Subcontrato</TableHead>
                      <TableHead>Subcontratista</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurementActs.map((am) => (
                      <TableRow key={am.id}>
                        <TableCell className="font-medium">{am.code}</TableCell>
                        <TableCell>{am.subcontract?.code || '-'}</TableCell>
                        <TableCell>{am.subcontract?.subcontractor?.name || '-'}</TableCell>
                        <TableCell>
                          {formatDate(am.period_start)} - {formatDate(am.period_end)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[am.status] || 'secondary'}>
                            {statusLabels[am.status] || am.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(am.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/actas-medicion/${am.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
