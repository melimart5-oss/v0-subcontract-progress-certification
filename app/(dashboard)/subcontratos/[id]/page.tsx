import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Plus, FileText, ClipboardCheck, Award } from 'lucide-react'

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

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SubcontratoDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: subcontract } = await supabase
    .from('subcontracts')
    .select(`
      *,
      project:projects(code, name),
      subcontractor:subcontractors(code, name, cif, contact_person, email, phone),
      items:subcontract_items(*)
    `)
    .eq('id', id)
    .single()

  if (!subcontract) {
    notFound()
  }

  // Get related measurement acts
  const { data: measurementActs } = await supabase
    .from('measurement_acts')
    .select('*')
    .eq('subcontract_id', id)
    .order('created_at', { ascending: false })

  // Get related certificates
  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('subcontract_id', id)
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
        title={subcontract.code}
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Subcontratos', href: '/subcontratos' },
          { label: subcontract.code },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/subcontratos/${id}/editar`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/actas-medicion/nuevo?subcontract=${id}`}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva AM
              </Link>
            </Button>
          </div>
        }
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Header Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {subcontract.code}
                  </CardTitle>
                  <CardDescription>
                    {subcontract.description || 'Sin descripción'}
                  </CardDescription>
                </div>
                <Badge variant={statusVariants[subcontract.status] || 'secondary'}>
                  {statusLabels[subcontract.status] || subcontract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Proyecto</p>
                  <p className="font-medium">
                    {subcontract.project?.code} - {subcontract.project?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subcontratista</p>
                  <p className="font-medium">{subcontract.subcontractor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Inicio</p>
                  <p className="font-medium">{formatDate(subcontract.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Fin</p>
                  <p className="font-medium">{formatDate(subcontract.end_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen Económico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Importe Contratado</p>
                <p className="text-2xl font-bold">{formatCurrency(subcontract.total_amount || 0)}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Contacto</p>
                <p className="font-medium">{subcontract.subcontractor?.contact_person || '-'}</p>
                <p className="text-sm text-muted-foreground">{subcontract.subcontractor?.email}</p>
                <p className="text-sm text-muted-foreground">{subcontract.subcontractor?.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Items, AMs, Certificates */}
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">Partidas ({subcontract.items?.length || 0})</TabsTrigger>
            <TabsTrigger value="ams">Actas de Medición ({measurementActs?.length || 0})</TabsTrigger>
            <TabsTrigger value="certificates">Certificaciones ({certificates?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Partidas Contratadas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Nº</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="w-20">Ud.</TableHead>
                      <TableHead className="text-right w-28">P. Unitario</TableHead>
                      <TableHead className="text-right w-24">Cantidad</TableHead>
                      <TableHead className="text-right w-32">Importe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subcontract.items?.map((item: {
                      id: string
                      item_number: string
                      description: string
                      unit: string
                      unit_price: number
                      contracted_quantity: number
                    }) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_number}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right">{item.contracted_quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.unit_price * item.contracted_quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-medium">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(subcontract.total_amount || 0)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ams">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    Actas de Medición
                  </CardTitle>
                  <Button size="sm" asChild>
                    <Link href={`/actas-medicion/nuevo?subcontract=${id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva AM
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!measurementActs || measurementActs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay actas de medición para este subcontrato
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurementActs.map((am) => (
                        <TableRow key={am.id}>
                          <TableCell className="font-medium">{am.code}</TableCell>
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
                              <Link href={`/actas-medicion/${am.id}`}>Ver</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certificaciones
                  </CardTitle>
                  <Button size="sm" asChild>
                    <Link href={`/certificaciones/nuevo?subcontract=${id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Certificación
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!certificates || certificates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay certificaciones para este subcontrato
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
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
                          <TableCell>
                            {formatDate(cert.period_start)} - {formatDate(cert.period_end)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(cert.total)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariants[cert.status] || 'secondary'}>
                              {statusLabels[cert.status] || cert.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/certificaciones/${cert.id}`}>Ver</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
