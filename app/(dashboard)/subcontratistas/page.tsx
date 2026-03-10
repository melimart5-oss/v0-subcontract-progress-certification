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
    name: "",
    cif: "",
    address: "",
    contact_person: "",
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
      .order("name")
    
    if (data) setSubcontractors(data)
    setLoading(false)
  }

  const filteredSubcontractors = subcontractors.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.cif?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingId) {
      await supabase
        .from("subcontractors")
        .update(formData)
        .eq("id", editingId)
    } else {
      await supabase
        .from("subcontractors")
        .insert({ ...formData, created_by: user.id })
    }

    setDialogOpen(false)
    setEditingId(null)
    setFormData({ name: "", cif: "", address: "", contact_person: "", phone: "", email: "" })
    setSaving(false)
    loadSubcontractors()
  }

  function handleEdit(subcontractor: Subcontractor) {
    setFormData({
      name: subcontractor.name,
      cif: subcontractor.cif || "",
      address: subcontractor.address || "",
      contact_person: subcontractor.contact_person || "",
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Subcontratistas"
        description="Gestiona el directorio de subcontratistas"
      >
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingId(null)
            setFormData({ name: "", cif: "", address: "", contact_person: "", phone: "", email: "" })
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
                  <FieldLabel>Nombre / Razón Social *</FieldLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>CIF</FieldLabel>
                  <Input
                    value={formData.cif}
                    onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Dirección</FieldLabel>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Persona de contacto</FieldLabel>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Teléfono</FieldLabel>
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
      </PageHeader>

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
                  <CardTitle className="text-base">{subcontractor.name}</CardTitle>
                  {subcontractor.cif && (
                    <p className="text-sm text-muted-foreground">{subcontractor.cif}</p>
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
                {subcontractor.contact_person && (
                  <p className="text-sm">{subcontractor.contact_person}</p>
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
  )
}
