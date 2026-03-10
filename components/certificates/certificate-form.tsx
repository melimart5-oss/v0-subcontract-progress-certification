'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Save, Send } from 'lucide-react'

interface SubcontractItem {
  id: string
  item_number: string
  description: string
  unit: string
  unit_price: number
  contracted_quantity: number
}

interface Subcontract {
  id: string
  code: string
  subcontractor?: { name: string }
  items?: SubcontractItem[]
}

interface CertificateFormProps {
  subcontracts: Subcontract[]
  preselectedSubcontract?: Subcontract | null
}

interface CertifiedItem {
  subcontract_item_id: string
  certified_quantity: number
  accumulated_quantity: number
}

export function CertificateForm({ 
  subcontracts, 
  preselectedSubcontract,
}: CertificateFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    code: '',
    subcontract_id: preselectedSubcontract?.id || '',
    period_start: '',
    period_end: '',
    tax_rate: 21,
    notes: '',
  })

  const [selectedSubcontract, setSelectedSubcontract] = useState<Subcontract | null>(
    preselectedSubcontract || null
  )

  const [certifiedItems, setCertifiedItems] = useState<CertifiedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Update selected subcontract when selection changes
  useEffect(() => {
    if (formData.subcontract_id) {
      const found = subcontracts.find(s => s.id === formData.subcontract_id)
      setSelectedSubcontract(found || null)
      
      // Initialize certified items based on subcontract items
      if (found?.items) {
        setCertifiedItems(
          found.items.map(item => ({
            subcontract_item_id: item.id,
            certified_quantity: 0,
            accumulated_quantity: 0,
          }))
        )
      }
    }
  }, [formData.subcontract_id, subcontracts])

  const updateCertifiedItem = (itemId: string, field: keyof CertifiedItem, value: number) => {
    setCertifiedItems(prev => 
      prev.map(item => 
        item.subcontract_item_id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    )
  }

  const calculateItemAmount = (item: SubcontractItem, certified: number) => {
    return item.unit_price * certified
  }

  const calculateSubtotal = () => {
    return certifiedItems.reduce((total, ci) => {
      const item = selectedSubcontract?.items?.find(i => i.id === ci.subcontract_item_id)
      if (item) {
        return total + calculateItemAmount(item, ci.certified_quantity)
      }
      return total
    }, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (formData.tax_rate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async (e: React.FormEvent, submitForApproval = false) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const subtotal = calculateSubtotal()
      const tax_amount = calculateTax()
      const total = calculateTotal()
      const status = submitForApproval ? 'pending_approval' : 'draft'

      // Create certificate
      const { data: certificate, error: createError } = await supabase
        .from('certificates')
        .insert({
          ...formData,
          subtotal,
          tax_amount,
          total,
          status,
          created_by: user.id,
        })
        .select()
        .single()

      if (createError) throw createError

      // Insert certificate items
      const { error: itemsError } = await supabase
        .from('certificate_items')
        .insert(
          certifiedItems.map(item => {
            const subItem = selectedSubcontract?.items?.find(
              i => i.id === item.subcontract_item_id
            )
            return {
              certificate_id: certificate.id,
              subcontract_item_id: item.subcontract_item_id,
              certified_quantity: item.certified_quantity,
              certified_amount: (subItem?.unit_price || 0) * item.certified_quantity,
              accumulated_quantity: item.accumulated_quantity,
              accumulated_amount: (subItem?.unit_price || 0) * item.accumulated_quantity,
            }
          })
        )

      if (itemsError) throw itemsError

      router.push(`/certificaciones/${certificate.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Certificación</CardTitle>
          <CardDescription>
            Información general de la certificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field>
                <FieldLabel htmlFor="code">Código *</FieldLabel>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CERT-001"
                  required
                />
              </Field>
              <Field className="lg:col-span-3">
                <FieldLabel htmlFor="subcontract">Subcontrato *</FieldLabel>
                <Select
                  value={formData.subcontract_id}
                  onValueChange={(value) => setFormData({ ...formData, subcontract_id: value })}
                  disabled={!!preselectedSubcontract}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona subcontrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcontracts.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.code} - {sub.subcontractor?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="period_start">Período Inicio *</FieldLabel>
                <Input
                  id="period_start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="period_end">Período Fin *</FieldLabel>
                <Input
                  id="period_end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="tax_rate">IVA (%)</FieldLabel>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="notes">Observaciones</FieldLabel>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales"
                rows={2}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {selectedSubcontract?.items && selectedSubcontract.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Partidas a Certificar</CardTitle>
            <CardDescription>
              Introduce las cantidades a certificar para cada partida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Nº</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-16">Ud.</TableHead>
                    <TableHead className="text-right w-24">P.Unit.</TableHead>
                    <TableHead className="text-right w-24">Contratado</TableHead>
                    <TableHead className="w-28">Certificar</TableHead>
                    <TableHead className="w-28">Acumulado</TableHead>
                    <TableHead className="text-right w-28">Importe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSubcontract.items.map((item) => {
                    const certified = certifiedItems.find(ci => ci.subcontract_item_id === item.id)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_number}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right">{item.contracted_quantity}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={certified?.certified_quantity || 0}
                            onChange={(e) => updateCertifiedItem(
                              item.id, 
                              'certified_quantity', 
                              parseFloat(e.target.value) || 0
                            )}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={certified?.accumulated_quantity || 0}
                            onChange={(e) => updateCertifiedItem(
                              item.id, 
                              'accumulated_quantity', 
                              parseFloat(e.target.value) || 0
                            )}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(calculateItemAmount(item, certified?.certified_quantity || 0))}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={7} className="text-right">Subtotal</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(calculateSubtotal())}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} className="text-right">
                      IVA ({formData.tax_rate}%)
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(calculateTax())}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {formatCurrency(calculateTotal())}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <FieldError>{error}</FieldError>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="secondary" disabled={loading}>
          {loading ? (
            <>
              <Spinner className="mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </>
          )}
        </Button>
        <Button 
          type="button" 
          disabled={loading}
          onClick={(e) => handleSubmit(e, true)}
        >
          {loading ? (
            <>
              <Spinner className="mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar a Aprobación
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
