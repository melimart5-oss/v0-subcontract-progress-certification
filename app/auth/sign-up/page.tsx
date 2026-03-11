'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HardHat } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<string>('jefe_produccion')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
          `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/auth/sign-up-success')
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
            Únete a las empresas que ya optimizan su gestión de obra
          </h1>
          <ul className="space-y-4 text-lg text-sidebar-foreground/80">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm">1</span>
              Gestión completa de subcontratos
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm">2</span>
              Flujo de aprobación digital
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm">3</span>
              Seguimiento financiero en tiempo real
            </li>
          </ul>
        </div>
        <p className="text-sm text-sidebar-foreground/50">
          © 2026 GestOBRA. Todos los derechos reservados.
        </p>
      </div>

      {/* Right side - Sign up form */}
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
              <CardTitle className="text-xl">Crear cuenta</CardTitle>
              <CardDescription>
                Completa tus datos para registrarte en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan García"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </Field>
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
                      minLength={6}
                      className="h-11"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="role">Rol</FieldLabel>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="encargado">Encargado de Obra</SelectItem>
                        <SelectItem value="jefe_obra">Jefe de Obra</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  {error && (
                    <FieldError>{error}</FieldError>
                  )}
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                </FieldGroup>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <span>¿Ya tienes cuenta? </span>
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Iniciar sesión
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
