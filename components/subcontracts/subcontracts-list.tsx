'use client'

import { useState } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, FileText, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useCurrencyFormat } from '@/hooks/use-currency-format'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Subcontract {
  id: string
  internal_code: string
  description: string | null
  status: string
  contract_total_amount: number
  start_date: string | null
  project?: { code: string; name: string } | null
  subcontractor?: { id: string; company_name: string } | null
}

interface SubcontractsListProps {
  subcontracts: Subcontract[]
  certifiedBySubcontract: Record<string, number>
}

export function SubcontractsList({ subcontracts, certifiedBySubcontract }: SubcontractsListProps) {
  const { format } = useCurrencyFormat()
  const router = useRouter()
  const supabase = createClient()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(profile?.role || null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('subcontracts')
        .delete()
        .eq('id', deleteId)
      
      if (error) throw error
      router.refresh()
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const isAdmin = userRole === 'admin'

  return (
    <>
    {deleteId && (
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Subcontrato</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este subcontrato? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    )}

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
                  const total = subcontract.contract_total_amount || 0
                  const progress = total > 0 ? (certified / total) * 100 : 0
                  
                  return (
                    <TableRow key={subcontract.id} className="group">
                      <TableCell>
                        <div>
                          <p className="font-semibold">{subcontract.internal_code}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {subcontract.description || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{subcontract.project?.code || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{subcontract.subcontractor?.company_name || '-'}</span>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/subcontratos/${subcontract.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/subcontratos/${subcontract.id}/editar`}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Modificar
                              </Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  checkUserRole()
                                  setDeleteId(subcontract.id)
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
    </>
  )
}
