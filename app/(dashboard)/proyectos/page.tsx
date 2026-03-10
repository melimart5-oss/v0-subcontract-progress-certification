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
import { Plus, FolderKanban, Eye } from 'lucide-react'

const statusLabels: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  suspended: 'Suspendido',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  completed: 'outline',
  suspended: 'destructive',
}

export default async function ProyectosPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES')
  }

  return (
    <>
      <PageHeader
        title="Proyectos"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Proyectos' },
        ]}
        actions={
          <Button asChild>
            <Link href="/proyectos/nuevo">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Link>
          </Button>
        }
      />
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Lista de Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!projects || projects.length === 0 ? (
              <Empty
                title="Sin proyectos"
                description="No hay proyectos registrados. Crea el primero para comenzar."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.code}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{project.client || '-'}</TableCell>
                        <TableCell>{project.location || '-'}</TableCell>
                        <TableCell>{formatDate(project.start_date)}</TableCell>
                        <TableCell>{formatDate(project.end_date)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[project.status] || 'secondary'}>
                            {statusLabels[project.status] || project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/proyectos/${project.id}`}>
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
