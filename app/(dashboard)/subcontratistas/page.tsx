"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Building2, Phone, Mail, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import type { Subcontractor } from "@/lib/types"

export default function SubcontractorsPage() {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company_name: "",
    cuit_cuil: "",
    address: "",
    contact_name: "",
    phone: "",
    email: "",
  })

  const supabase = createClient()

  useEffect(() => {
    loadSubcontractors()
  }, [])

  async function loadSubcontractors() {
    const { data } = await supabase
      .from("subcontractors")
      .select("*")
      .order("company_name")
    
    if (data) setSubcontractors(data)
    setLoading(false)
  }

  const filteredSubcontractors = subcontractors.filter(s =>
    s.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.cuit_cuil?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    if (editingId) {
      await supabase
        .from("subcontractors")
        .update(formData)
        .eq("id", editingId)
    } else {
      await supabase
        .from("subcontractors")
        .insert(formData)
    }

    setDialogOpen(false)
    setEditingId(null)
    setFormData({ company_name: "", cuit_cuil: "", address: "", contact_name: "", phone: "", email: "" })
    setSaving(false)
    loadSubcontractors()
  }

  function handleEdit(subcontractor: Subcontractor) {
    setFormData({
      company_name: subcontractor.company_name || "",
      cuit_cuil: subcontractor.cuit_cuil || "",
      address: subcontractor.address || "",
      contact_name: subcontractor.contact_name || "",
      phone: subcontractor.phone || "",
      email: subcontractor.email || "",
    })
    setEditingId(subcontractor.id)
    setDialogOpen(true)
  }

  async function handleDelete(id: string) {
    if (confirm("¿Está seguro de eliminar este subcontratista?")) {
      await supabase.from("subcontractors").delete().eq("id", id)
      loadSubcontractors()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Subcontratistas"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Subcontratistas' },
        ]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setEditingId(null)
              setFormData({ company_name: "", cuit_cuil: "", address: "", contact_name: "", phone: "", email: "" })
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Subcontratista
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Editar Subcontratista" : "Nuevo Subcontratista"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId ? "Actualiza los datos del subcontratista" : "Registra un nuevo subcontratista en el sistema"}
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-4">
                  <Field>
                    <FieldLabel>Nombre / Razon Social *</FieldLabel>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>CUIT/CUIL</FieldLabel>
                    <Input
                      value={formData.cuit_cuil}
                      onChange={(e) => setFormData({ ...formData, cuit_cuil: e.target.value })}
                      placeholder="XX-XXXXXXXX-X"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Direccion</FieldLabel>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Persona de contacto</FieldLabel>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Telefono</FieldLabel>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Spinner className="mr-2 h-4 w-4" />}
                    {editingId ? "Guardar" : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="flex-1 p-6 space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o CIF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredSubcontractors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay subcontratistas registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubcontractors.map((subcontractor) => (
            <Card key={subcontractor.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{subcontractor.company_name}</CardTitle>
                  {subcontractor.cuit_cuil && (
                    <p className="text-sm text-muted-foreground">CUIT: {subcontractor.cuit_cuil}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(subcontractor)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(subcontractor.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2">
                {subcontractor.contact_name && (
                  <p className="text-sm">{subcontractor.contact_name}</p>
                )}
                {subcontractor.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {subcontractor.phone}
                  </div>
                )}
                {subcontractor.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {subcontractor.email}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </>
  )
}
