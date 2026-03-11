'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { HardHat } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-sidebar-foreground flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <HardHat className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">GestOBRA</span>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-balance">
            Gestiona tus subcontratos y certificaciones de obra de forma eficiente
          </h1>
          <p className="text-lg text-sidebar-foreground/70">
            Control total de tu obra civil: subcontratos, mediciones, certificaciones y seguimiento financiero en un solo lugar.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-sidebar-foreground/70">Control de obra</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-sidebar-foreground/70">Disponibilidad</p>
            </div>
            <div>
              <p className="text-3xl font-bold">+50</p>
              <p className="text-sm text-sidebar-foreground/70">Empresas confían</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-sidebar-foreground/50">
          © 2026 GestOBRA. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground mb-4">
              <HardHat className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">GestOBRA</h1>
            <p className="text-muted-foreground">Sistema de Gestión de Obra</p>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="text-center lg:text-left">
              <CardTitle className="text-xl">Iniciar sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </Field>
                  {error && (
                    <FieldError>{error}</FieldError>
                  )}
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </Button>
                </FieldGroup>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <span>¿No tienes cuenta? </span>
                <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                  Regístrate aquí
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
