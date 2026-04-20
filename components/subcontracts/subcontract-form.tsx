'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Trash2, Save } from 'lucide-react'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface SubcontractFormProps {
  projects: Array<{ id: string; code: string; name: string }>
  subcontractors: Array<{ id: string; code: string; name: string }>
  initialData?: {
    id: string
    code: string
    project_id: string
    subcontractor_id: string
    description: string | null
    start_date: string | null
    end_date: string | null
    status: string
    items?: Array<{
      id?: string
      item_number: string
      description: string
      unit: string
      unit_price: number
      contracted_quantity: number
    }>
  }
}

interface LineItem {
  id?: string
  item_code: string
  description: string
  unit: string
  unit_price: number
  contracted_quantity: number
}

export function SubcontractForm({ projects, subcontractors, initialData }: SubcontractFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    internal_code: initialData?.code || '',
    project_id: initialData?.project_id || '',
    subcontractor_id: initialData?.subcontractor_id || '',
    description: initialData?.description || '',
    start_date: initialData?.start_date || '',
    required_completion_date: initialData?.end_date || '',
    status: initialData?.status || 'draft',
  })

  const [items, setItems] = useState<LineItem[]>(
    initialData?.items?.map(item => ({
      ...item,
      item_code: item.item_number || '1'
    })) || [
      { item_code: '1', description: '', unit: 'ud', unit_price: 0, contracted_quantity: 0 }
    ]
  )

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([
      ...items,
      {
        item_code: String(items.length + 1),
        description: '',
        unit: 'ud',
        unit_price: 0,
        contracted_quantity: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.unit_price * item.contracted_quantity)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const contract_total_amount = calculateTotal()

      if (isEditing) {
        // Update subcontract
        const { error: updateError } = await supabase
          .from('subcontracts')
          .update({
            ...formData,
            contract_total_amount,
          })
          .eq('id', initialData.id)

        if (updateError) throw updateError

        // Delete existing items and re-insert
        await supabase
          .from('subcontract_items')
          .delete()
          .eq('subcontract_id', initialData.id)

        const { error: itemsError } = await supabase
          .from('subcontract_items')
          .insert(
            items.map((item, index) => ({
              subcontract_id: initialData.id,
              item_code: item.item_code,
              description: item.description,
              unit: item.unit,
              unit_price: item.unit_price,
              contracted_quantity: item.contracted_quantity,
              total_amount: item.unit_price * item.contracted_quantity,
              sort_order: index + 1,
            }))
          )

        if (itemsError) throw itemsError

        router.push(`/subcontratos/${initialData.id}`)
      } else {
        // Create new subcontract
        const insertData = {
          internal_code: formData.internal_code,
          project_id: formData.project_id || null,
          subcontractor_id: formData.subcontractor_id || null,
          description: formData.description || null,
          start_date: formData.start_date || null,
          required_completion_date: formData.required_completion_date || null,
          status: formData.status,
          contract_total_amount,
          created_by: user.id,
        }
        
        const { data: subcontract, error: createError } = await supabase
          .from('subcontracts')
          .insert(insertData)
          .select()
          .single()

        if (createError) throw createError

        // Insert items
        const itemsData = items.map((item, index) => ({
          subcontract_id: subcontract.id,
          item_code: item.item_code,
          description: item.description,
          unit: item.unit,
          unit_price: item.unit_price,
          contracted_quantity: item.contracted_quantity,
          total_amount: item.unit_price * item.contracted_quantity,
          sort_order: index + 1,
        }))
        
        const { error: itemsError } = await supabase
          .from('subcontract_items')
          .insert(itemsData)

        if (itemsError) throw itemsError

        router.push(`/subcontratos/${subcontract.id}`)
      }

      router.refresh()
    } catch (err: unknown) {
      let errorMessage = 'Error desconocido'
      
      if (err && typeof err === 'object' && 'code' in err) {
        const pgError = err as { code: string; message?: string }
        if (pgError.code === '23505') {
          errorMessage = 'Ya existe un subcontrato con ese codigo. Por favor, use un codigo diferente.'
        } else {
          errorMessage = pgError.message || JSON.stringify(err)
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const { format: formatCurrency } = useCurrencyFormat()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del Subcontrato</CardTitle>
          <CardDescription>
            Información general del contrato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="internal_code">Codigo *</FieldLabel>
                <Input
                  id="internal_code"
                  value={formData.internal_code}
                  onChange={(e) => setFormData({ ...formData, internal_code: e.target.value })}
                  placeholder="SUB-001"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="project">Proyecto *</FieldLabel>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="subcontractor">Subcontratista *</FieldLabel>
                <Select
                  value={formData.subcontractor_id}
                  onValueChange={(value) => setFormData({ ...formData, subcontractor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona subcontratista" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcontractors.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del alcance del subcontrato"
                rows={3}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="start_date">Fecha Inicio</FieldLabel>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="required_completion_date">Fecha Fin</FieldLabel>
                <Input
                  id="required_completion_date"
                  type="date"
                  value={formData.required_completion_date}
                  onChange={(e) => setFormData({ ...formData, required_completion_date: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="status">Estado</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Partidas del Contrato</CardTitle>
              <CardDescription>
                Detalle de unidades de obra contratadas
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Partida
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="hidden lg:grid lg:grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
              <div className="col-span-1">Nº</div>
              <div className="col-span-4">Descripción</div>
              <div className="col-span-1">Ud.</div>
              <div className="col-span-2">P. Unitario</div>
              <div className="col-span-2">Cantidad</div>
              <div className="col-span-1">Importe</div>
              <div className="col-span-1"></div>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid gap-2 lg:grid-cols-12 items-start p-3 border rounded-lg">
                <div className="lg:col-span-1">
                  <FieldLabel className="lg:hidden">Nro</FieldLabel>
                  <Input
                    value={item.item_code}
                    onChange={(e) => updateItem(index, 'item_code', e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="lg:col-span-4">
                  <FieldLabel className="lg:hidden">Descripción</FieldLabel>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Descripción de la partida"
                  />
                </div>
                <div className="lg:col-span-1">
                  <FieldLabel className="lg:hidden">Unidad</FieldLabel>
                  <Select
                    value={item.unit}
                    onValueChange={(value) => updateItem(index, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ud">ud</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="m2">m2</SelectItem>
                      <SelectItem value="m3">m3</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="t">t</SelectItem>
                      <SelectItem value="h">h</SelectItem>
                      <SelectItem value="pa">pa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-2">
                  <FieldLabel className="lg:hidden">P. Unitario</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="lg:col-span-2">
                  <FieldLabel className="lg:hidden">Cantidad</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.contracted_quantity}
                    onChange={(e) => updateItem(index, 'contracted_quantity', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="lg:col-span-1 flex items-center">
                  <span className="font-medium text-sm">
                    {formatCurrency(item.unit_price * item.contracted_quantity)}
                  </span>
                </div>
                <div className="lg:col-span-1 flex items-center justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Contrato</p>
                <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner className="mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Actualizar' : 'Crear'} Subcontrato
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
