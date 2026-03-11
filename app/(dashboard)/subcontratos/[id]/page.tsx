import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Empty } from '@/components/ui/empty'
import { StatusBadge } from '@/components/ui/status-badge'
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
import { Edit, Plus, FileText, ClipboardCheck, Award, Building2, Calendar, TrendingUp, Phone, Mail, User } from 'lucide-react'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'

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

  // Get related certificates with totals
  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('subcontract_id', id)
    .order('created_at', { ascending: false })

  // Calculate certified amount
  const certifiedAmount = (certificates || [])
    .filter(c => c.status === 'approved' || c.status === 'issued')
    .reduce((sum, c) => sum + (c.total || 0), 0)
  
  const totalAmount = subcontract.total_amount || 0
  const progress = totalAmount > 0 ? (certifiedAmount / totalAmount) * 100 : 0
  const pendingAmount = totalAmount - certifiedAmount

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
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="w-5 h-5 text-primary" />
                    {subcontract.code}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {subcontract.description || 'Sin descripción'}
                  </CardDescription>
                </div>
                <StatusBadge status={subcontract.status} type="subcontract" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Proyecto</p>
                    <p className="font-medium">
                      {subcontract.project?.code} - {subcontract.project?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Subcontratista</p>
                    <p className="font-medium">{subcontract.subcontractor?.name}</p>
                    {subcontract.subcontractor?.cif && (
                      <p className="text-xs text-muted-foreground">CIF: {subcontract.subcontractor.cif}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Período</p>
                    <p className="font-medium">
                      {formatDate(subcontract.start_date)} - {formatDate(subcontract.end_date)}
                    </p>
                  </div>
                </div>
                {subcontract.subcontractor?.contact_person && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Contacto</p>
                      <p className="font-medium">{subcontract.subcontractor.contact_person}</p>
                      {subcontract.subcontractor.phone && (
                        <p className="text-xs text-muted-foreground">{subcontract.subcontractor.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Resumen Económico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Importe Contratado</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Certificado</span>
                  <span className="font-medium text-success">{formatCurrency(certifiedAmount)}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatPercent(progress)} completado</span>
                  <span>Pendiente: {formatCurrency(pendingAmount)}</span>
                </div>
              </div>
              {subcontract.subcontractor?.email && (
                <div className="pt-4 border-t">
                  <a 
                    href={`mailto:${subcontract.subcontractor.email}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {subcontract.subcontractor.email}
                  </a>
                </div>
              )}
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
                            <StatusBadge status={am.status} type="measurement_act" />
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
                            <StatusBadge status={cert.status} type="certificate" />
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
