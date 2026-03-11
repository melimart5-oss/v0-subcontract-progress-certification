'use client'

import Link from 'next/link'
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
import { useCurrencyFormat } from '@/hooks/use-currency-format'
import { formatDate } from '@/lib/format'

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

interface Project {
  id: string
  code: string
  name: string
  client: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  status: string
}

interface ProjectsListProps {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const { format } = useCurrencyFormat()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5" />
          Lista de Proyectos
        </CardTitle>
        <Button asChild>
          <Link href="/proyectos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Link>
        </Button>
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
                  <TableHead>Codigo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Presupuesto</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="group">
                    <TableCell className="font-medium">{project.code}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.client || '-'}</TableCell>
                    <TableCell className="text-right">
                      {project.budget ? (
                        <span className="font-medium">{format(project.budget)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(project.start_date)}</TableCell>
                    <TableCell>{formatDate(project.end_date)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[project.status] || 'secondary'}>
                        {statusLabels[project.status] || project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/proyectos/${project.id}`}>
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
  )
}
