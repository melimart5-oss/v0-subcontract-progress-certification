'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, FileText, Eye } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface Subcontract {
  id: string
  code: string
  description: string | null
  status: string
  total_amount: number
  start_date: string | null
  project?: { code: string; name: string } | null
  subcontractor?: { code: string; name: string } | null
}

interface SubcontractsListProps {
  subcontracts: Subcontract[]
  certifiedBySubcontract: Record<string, number>
}

export function SubcontractsList({ subcontracts, certifiedBySubcontract }: SubcontractsListProps) {
  const { format } = useCurrencyFormat()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Lista de Subcontratos
        </CardTitle>
        <Button asChild>
          <Link href="/subcontratos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Subcontrato
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!subcontracts || subcontracts.length === 0 ? (
          <Empty
            title="No hay subcontratos"
            description="Crea tu primer subcontrato para comenzar a gestionar tu obra"
          >
            <Button asChild>
              <Link href="/subcontratos/nuevo">
                <Plus className="w-4 h-4 mr-2" />
                Crear Subcontrato
              </Link>
            </Button>
          </Empty>
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
                          <p className="font-medium">{format(total)}</p>
                          <p className="text-xs text-muted-foreground">
                            Cert: {format(certified)}
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
  )
}
