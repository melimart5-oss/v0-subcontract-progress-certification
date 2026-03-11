import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { StatusBadge } from '@/components/ui/status-badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, FileText, Eye, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'

export default async function SubcontratosPage() {
  const supabase = await createClient()

  const [{ data: subcontracts }, { data: certificates }] = await Promise.all([
    supabase.from('subcontracts').select(`
      *,
      project:projects(code, name),
      subcontractor:subcontractors(code, name)
    `).order('created_at', { ascending: false }),
    supabase.from('certificates').select('subcontract_id, total').in('status', ['approved', 'issued']),
  ])

  // Calculate certified amount per subcontract
  const certifiedBySubcontract = (certificates || []).reduce((acc, cert) => {
    acc[cert.subcontract_id] = (acc[cert.subcontract_id] || 0) + (cert.total || 0)
    return acc
  }, {} as Record<string, number>)

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
                      <TableHead className="text-right">Contratado</TableHead>
                      <TableHead>Avance</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subcontracts.map((subcontract) => {
                      const certified = certifiedBySubcontract[subcontract.id] || 0
                      const total = subcontract.total_amount || 0
                      const progress = total > 0 ? (certified / total) * 100 : 0
                      
                      return (
                        <TableRow key={subcontract.id} className="group">
                          <TableCell>
                            <div>
                              <p className="font-semibold">{subcontract.code}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {subcontract.description || '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{subcontract.project?.code || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{subcontract.subcontractor?.name || '-'}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <p className="font-medium">{formatCurrency(total)}</p>
                              <p className="text-xs text-muted-foreground">
                                Cert: {formatCurrency(certified)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Avance</span>
                                <span className="font-medium">{progress.toFixed(0)}%</span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={subcontract.status} type="subcontract" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`/subcontratos/${subcontract.id}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
