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
import { Plus, FileText, Eye } from 'lucide-react'

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

export default async function SubcontratosPage() {
  const supabase = await createClient()

  const { data: subcontracts } = await supabase
    .from('subcontracts')
    .select(`
      *,
      project:projects(code, name),
      subcontractor:subcontractors(code, name)
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
        title="Subcontratos"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Subcontratos' },
        ]}
        actions={
          <Button asChild>
            <Link href="/subcontratos/nuevo">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Subcontrato
            </Link>
          </Button>
        }
      />
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lista de Subcontratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!subcontracts || subcontracts.length === 0 ? (
              <Empty
                title="Sin subcontratos"
                description="No hay subcontratos registrados. Crea el primero para comenzar."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Subcontratista</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subcontracts.map((subcontract) => (
                      <TableRow key={subcontract.id}>
                        <TableCell className="font-medium">{subcontract.code}</TableCell>
                        <TableCell>
                          {subcontract.project?.code || '-'}
                        </TableCell>
                        <TableCell>
                          {subcontract.subcontractor?.name || '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {subcontract.description || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(subcontract.total_amount || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[subcontract.status] || 'secondary'}>
                            {statusLabels[subcontract.status] || subcontract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(subcontract.start_date)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/subcontratos/${subcontract.id}`}>
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
