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
import { Plus, Award, Eye } from 'lucide-react'

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente',
  approved: 'Aprobado',
  invoiced: 'Facturado',
  paid: 'Pagado',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending_approval: 'outline',
  approved: 'default',
  invoiced: 'secondary',
  paid: 'default',
}

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES')
  }

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
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.code}</TableCell>
                        <TableCell>{cert.subcontract?.code || '-'}</TableCell>
                        <TableCell>{cert.subcontract?.subcontractor?.name || '-'}</TableCell>
                        <TableCell>
                          {formatDate(cert.period_start)} - {formatDate(cert.period_end)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(cert.total || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[cert.status] || 'secondary'}>
                            {statusLabels[cert.status] || cert.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/certificaciones/${cert.id}`}>
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
