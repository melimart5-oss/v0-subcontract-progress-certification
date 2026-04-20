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
} from '@/components/ui/table'
import { Save, Send } from 'lucide-react'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface SubcontractItem {
  id: string
  item_code: string
  description: string
  unit: string
  unit_price: number
  contracted_quantity: number
  sort_order: number
}

interface Subcontract {
  id: string
  internal_code: string
  subcontractor?: { company_name: string }
  items?: SubcontractItem[]
}

interface MeasurementActFormProps {
  subcontracts: Subcontract[]
  preselectedSubcontract?: Subcontract | null
  initialData?: {
    id: string
    code: string
    subcontract_id: string
    period_start: string
    period_end: string
    notes: string | null
    items?: Array<{
      id: string
      subcontract_item_id: string
      measured_quantity: number
      accumulated_quantity: number
      notes: string | null
    }>
  }
}

interface MeasuredItem {
  subcontract_item_id: string
  current_quantity: number
  accumulated_quantity: number
}

export function MeasurementActForm({ 
  subcontracts, 
  preselectedSubcontract,
  initialData 
}: MeasurementActFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    subcontract_id: initialData?.subcontract_id || preselectedSubcontract?.id || '',
    period_start: initialData?.period_start || '',
    period_end: initialData?.period_end || '',
    observations: initialData?.notes || '',
  })

  const [selectedSubcontract, setSelectedSubcontract] = useState<Subcontract | null>(
    preselectedSubcontract || null
  )

  const [measuredItems, setMeasuredItems] = useState<MeasuredItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Update selected subcontract when selection changes
  useEffect(() => {
    if (formData.subcontract_id) {
      const found = subcontracts.find(s => s.id === formData.subcontract_id)
      setSelectedSubcontract(found || null)
      
      // Initialize measured items based on subcontract items
      if (found?.items) {
        const sorted = [...found.items].sort((a, b) => a.sort_order - b.sort_order)
        setMeasuredItems(
          sorted.map(item => {
            const existing = initialData?.items?.find(
              mi => mi.subcontract_item_id === item.id
            )
            return {
              subcontract_item_id: item.id,
              current_quantity: existing?.measured_quantity || 0,
              accumulated_quantity: existing?.accumulated_quantity || 0,
            }
          })
        )
      }
    }
  }, [formData.subcontract_id, subcontracts, initialData])

  const updateMeasuredItem = (itemId: string, field: 'current_quantity' | 'accumulated_quantity', value: number) => {
    setMeasuredItems(prev => 
      prev.map(item => 
        item.subcontract_item_id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent, submitForApproval = false) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const status = submitForApproval ? 'pending_approval' : 'draft'

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('measurement_acts')
          .update({
            subcontract_id: formData.subcontract_id,
            period_start: formData.period_start || null,
            period_end: formData.period_end || null,
            observations: formData.observations || null,
            status,
          })
          .eq('id', initialData.id)

        if (updateError) throw updateError

        await supabase
          .from('measurement_act_items')
          .delete()
          .eq('measurement_act_id', initialData.id)

        const { error: itemsError } = await supabase
          .from('measurement_act_items')
          .insert(
            measuredItems.map(item => ({
              measurement_act_id: initialData.id,
              subcontract_item_id: item.subcontract_item_id,
              current_quantity: item.current_quantity,
              accumulated_quantity: item.accumulated_quantity,
              previous_quantity: 0,
            }))
          )

        if (itemsError) throw itemsError
        router.push(`/actas-medicion/${initialData.id}`)
      } else {
        const { data: am, error: createError } = await supabase
          .from('measurement_acts')
          .insert({
            subcontract_id: formData.subcontract_id,
            period_start: formData.period_start || null,
            period_end: formData.period_end || null,
            observations: formData.observations || null,
            status,
            created_by: user.id,
          })
          .select()
          .single()

        if (createError) throw createError

        const { error: itemsError } = await supabase
          .from('measurement_act_items')
          .insert(
            measuredItems.map(item => ({
              measurement_act_id: am.id,
              subcontract_item_id: item.subcontract_item_id,
              current_quantity: item.current_quantity,
              accumulated_quantity: item.accumulated_quantity,
              previous_quantity: 0,
            }))
          )

        if (itemsError) throw itemsError
        router.push(`/actas-medicion/${am.id}`)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const { format: formatCurrency } = useCurrencyFormat()

  const calculateItemAmount = (item: SubcontractItem, measured: number) => {
    return item.unit_price * measured
  }

  const calculateTotal = () => {
    return measuredItems.reduce((total, mi) => {
      const item = selectedSubcontract?.items?.find(i => i.id === mi.subcontract_item_id)
      if (item) {
        return total + calculateItemAmount(item, mi.measured_quantity)
      }
      return total
    }, 0)
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del Acta de Medición</CardTitle>
          <CardDescription>
            Información general del acta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field className="lg:col-span-4">
                <FieldLabel htmlFor="subcontract">Subcontrato *</FieldLabel>
                <Select
                  value={formData.subcontract_id}
                  onValueChange={(value) => setFormData({ ...formData, subcontract_id: value })}
                  disabled={!!preselectedSubcontract}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar subcontrato..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subcontracts.length === 0 && (
                      <SelectItem value="__none__" disabled>No hay subcontratos disponibles</SelectItem>
                    )}
                    {subcontracts.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.internal_code} - {sub.subcontractor?.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <Field>
              <FieldLabel htmlFor="observations">Observaciones</FieldLabel>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Notas adicionales sobre la medicion"
                rows={2}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {selectedSubcontract?.items && selectedSubcontract.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mediciones</CardTitle>
            <CardDescription>
              Introduce las cantidades medidas para cada partida
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
                    <TableHead className="w-28">Medición</TableHead>
                    <TableHead className="w-28">Acumulado</TableHead>
                    <TableHead className="text-right w-28">Importe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSubcontract.items.sort((a, b) => a.sort_order - b.sort_order).map((item) => {
                    const measured = measuredItems.find(mi => mi.subcontract_item_id === item.id)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_code}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right">{item.contracted_quantity}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={measured?.current_quantity || 0}
                            onChange={(e) => updateMeasuredItem(
                              item.id, 
                              'current_quantity', 
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
                            value={measured?.accumulated_quantity || 0}
                            onChange={(e) => updateMeasuredItem(
                              item.id, 
                              'accumulated_quantity', 
                              parseFloat(e.target.value) || 0
                            )}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(calculateItemAmount(item, measured?.current_quantity || 0))}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Medición</p>
                <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
              </div>
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
