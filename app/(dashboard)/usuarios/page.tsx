"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Users, Shield, ShieldCheck, HardHat, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import type { Profile, UserRole } from "@/lib/types"

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  jefe_obra: "Jefe de Obra",
  encargado: "Encargado",
}

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: ShieldCheck,
  jefe_obra: Shield,
  encargado: HardHat,
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-primary text-primary-foreground",
  jefe_obra: "bg-chart-1 text-primary-foreground",
  encargado: "bg-chart-2 text-primary-foreground",
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "encargado" as UserRole,
  })
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (profile) setCurrentUser(profile)
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name")
    
    if (data) setProfiles(data)
    setLoading(false)
  }

  const filteredProfiles = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const isAdmin = currentUser?.role === "admin"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAdmin) return
    setSaving(true)

    if (editingProfile) {
      await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          role: formData.role,
        })
        .eq("id", editingProfile.id)
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.full_name,
            role: formData.role,
          },
        },
      })

      if (error) {
        alert(error.message)
        setSaving(false)
        return
      }
    }

    setDialogOpen(false)
    setEditingProfile(null)
    setFormData({ email: "", password: "", full_name: "", role: "encargado" })
    setSaving(false)
    loadData()
  }

  function handleEdit(profile: Profile) {
    setFormData({
      email: profile.email || "",
      password: "",
      full_name: profile.full_name || "",
      role: profile.role,
    })
    setEditingProfile(profile)
    setDialogOpen(true)
  }

  async function handleDelete(id: string) {
    if (!isAdmin) return
    if (id === currentUser?.id) {
      alert("No puedes eliminar tu propio usuario")
      return
    }
    if (confirm("¿Está seguro de eliminar este usuario?")) {
      await supabase.from("profiles").delete().eq("id", id)
      loadData()
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
        title="Usuarios"
        description="Gestiona los usuarios del sistema"
      >
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setEditingProfile(null)
              setFormData({ email: "", password: "", full_name: "", role: "encargado" })
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingProfile ? "Editar Usuario" : "Nuevo Usuario"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProfile 
                      ? "Actualiza los datos del usuario" 
                      : "Crea un nuevo usuario en el sistema"}
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-4">
                  {!editingProfile && (
                    <>
                      <Field>
                        <FieldLabel>Email *</FieldLabel>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Contraseña *</FieldLabel>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={6}
                        />
                      </Field>
                    </>
                  )}
                  <Field>
                    <FieldLabel>Nombre completo *</FieldLabel>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Rol *</FieldLabel>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="jefe_obra">Jefe de Obra</SelectItem>
                        <SelectItem value="encargado">Encargado</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Spinner className="mr-2 h-4 w-4" />}
                    {editingProfile ? "Guardar" : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProfiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay usuarios registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => {
            const RoleIcon = roleIcons[profile.role]
            return (
              <Card key={profile.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${roleColors[profile.role]}`}>
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {profile.full_name || "Sin nombre"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                  {isAdmin && profile.id !== currentUser?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(profile)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(profile.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{roleLabels[profile.role]}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
