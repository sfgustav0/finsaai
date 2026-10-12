"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"
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

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    setSucesso(false)

    // Validações locais
    if (password !== confirmPassword) {
      setErro("As senhas não são iguais.")
      setCarregando(false)
      return
    }

    if (password.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.")
      setCarregando(false)
      return
    }

    // Chamada à API do Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name, // Guarda o nome do utilizador nos metadados da conta
        },
      },
    })

    if (error) {
      setErro(error.message || "Ocorreu um erro ao criar a conta. Tente novamente.")
      setCarregando(false)
    } else {
      setSucesso(true)
      setCarregando(false)
      // Limpar formulário após sucesso
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crie sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          {sucesso ? (
            <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
              <div className="text-green-600 bg-green-50 p-4 rounded-md">
                <p className="font-medium text-lg mb-1">Conta criada com sucesso!</p>
                <p className="text-sm">
                  Enviamos um link de confirmação para o seu e-mail<strong>{email}</strong>. 
                  Por favor, verifique a sua caixa de entrada para ativar a sua conta.
                </p>
              </div>
              <Button 
                type="button" 
                className="w-full mt-4" 
                onClick={() => window.location.href = "/login"}
                >
                Ir para o Login
                </Button>
            </div>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input 
                    id="name" 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                
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

                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <p className="text-[0.8rem] text-gray-500">
                    Deve ter pelo menos 8 caracteres.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmar senha</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>

                {erro && <p className="text-sm text-red-500 text-center">{erro}</p>}

                <div className="flex flex-col gap-2 mt-2">
                  <Button type="submit" className="w-full" disabled={carregando}>
                    {carregando ? "Cadastrando conta..." : "Cadastrar"}
                  </Button>
                </div>
              </div>
              <div className="mt-6 text-center text-sm">
                Já tem uma conta?{" "}
                <a href="/login" className="underline underline-offset-4 hover:text-primary">
                  Entrar
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}