"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RecuperarSenhaForm() {
  const [email, setEmail] = useState("")
  const [mensagem, setMensagem] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)

    // Pede ao Supabase para enviar o email com o código OTP de 6 dígitos
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setErro(error.message)
      setCarregando(false)
    } else {
      // Redireciona manualmente para a página de inserir o código
      window.location.href = "/update-password"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Recupere sua conta</CardTitle>
        <CardDescription>
          Insira seu e-mail cadastrado para receber um link de recuperação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mensagem ? (
          <div className="text-green-600 bg-green-50 p-4 rounded-md text-sm text-center mb-4">
            Se este e-mail estiver registrado em nosso sistema, você receberá um link de recuperação em alguns instantes. Por favor, verifique também a sua caixa de spam. Se não receber nada, verifique se digitou o e-mail corretamente e tente novamente.
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            {erro && <p className="text-sm text-red-500">{erro}</p>}
            
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "A enviar..." : "Enviar link"}
            </Button>
          </form>
        )}
        <div className="mt-6 text-center text-sm">
          Lembrou-se da senha?{" "}
          <a href="/login" className="underline underline-offset-4 hover:text-primary">
            Entrar
          </a>
        </div>
      </CardContent>
    </Card>
  )
}