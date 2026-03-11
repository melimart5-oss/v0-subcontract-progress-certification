import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Award, Eye, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'

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
        actions={
          <Button asChild>
            <Link href="/certificaciones/nuevo">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Certificación
            </Link>
          </Button>
        }
      />
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Lista de Certificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!certificates || certificates.length === 0 ? (
              <Empty
                title="Sin certificaciones"
                description="No hay certificaciones registradas. Crea la primera para comenzar."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Subcontrato</TableHead>
                      <TableHead>Subcontratista</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert.id} className="group">
                        <TableCell>
                          <div>
                            <p className="font-semibold">{cert.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {cert.subcontract?.project?.code || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{cert.subcontract?.code || '-'}</TableCell>
                        <TableCell>{cert.subcontract?.subcontractor?.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(cert.period_start)} - {formatDate(cert.period_end)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-primary">
                            {formatCurrency(cert.total || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={cert.status} type="certificate" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/certificaciones/${cert.id}`}>
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
