"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export default function NewProjectPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    client: "",
    location: "",
    start_date: "",
    end_date: "",
    budget: "",
  })

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("projects")
      .insert({
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        created_by: user.id,
      })

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    router.push("/proyectos")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nuevo Proyecto"
        description="Registra un nuevo proyecto de obra"
        backHref="/proyectos"
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Código *</FieldLabel>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="ej. PRY-2026-001"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>Nombre *</FieldLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Descripción</FieldLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Cliente</FieldLabel>
                  <Input
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Ubicación</FieldLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel>Fecha inicio</FieldLabel>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Fecha fin prevista</FieldLabel>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Presupuesto</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0.00"
                  />
                </Field>
              </div>
            </FieldGroup>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Spinner className="mr-2 h-4 w-4" />}
                Crear Proyecto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
