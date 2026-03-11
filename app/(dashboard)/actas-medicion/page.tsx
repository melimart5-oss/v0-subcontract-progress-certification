import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, ClipboardCheck, Eye, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/format'

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
                      <TableRow key={am.id} className="group">
                        <TableCell>
                          <div>
                            <p className="font-semibold">{am.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {am.subcontract?.project?.code || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{am.subcontract?.code || '-'}</TableCell>
                        <TableCell>{am.subcontract?.subcontractor?.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(am.period_start)} - {formatDate(am.period_end)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={am.status} type="measurement_act" />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(am.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/actas-medicion/${am.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
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
