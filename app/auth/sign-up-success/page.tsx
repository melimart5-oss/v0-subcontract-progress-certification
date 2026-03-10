import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MailCheck, HardHat } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground">
              <HardHat className="w-8 h-8" />
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success">
              <MailCheck className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">Revisa tu correo</CardTitle>
          <CardDescription>
            Te hemos enviado un enlace de confirmación a tu correo electrónico.
            Por favor, haz clic en el enlace para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Volver al inicio de sesión
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
