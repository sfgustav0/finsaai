"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export function AtualizarSenhaForm() {
  const [email, setEmail] = useState("")
  const [codigo, setCodigo] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)

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

    // 1. Valida o código de 6 dígitos
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: 'recovery',
    })

    if (otpError) {
      setErro("Código inválido ou expirado. Peça um novo.")
      setCarregando(false)
      return
    }

    // 2. Atualiza a palavra-passe após validação
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setErro("Não foi possível atualizar a senha.")
      setCarregando(false)
    } else {
      setSucesso(true)
      setCarregando(false)
      await supabase.auth.signOut()
      
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Redefina sua senha</CardTitle>
        <CardDescription>
          Insira seu e-mail cadastrado, o código que recebeu e sua nova senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sucesso ? (
          <div className="text-green-600 bg-green-50 p-4 rounded-md text-center">
            <p className="font-medium mb-1">Senha atualizada!</p>
            <p className="text-sm">Movendo você para a tela de login...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} required maxLength={8} className="tracking-widest text-center text-lg" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={mostrarSenha ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <div className="relative">
                <Input 
                  id="confirm-password" 
                  type={mostrarConfirmarSenha ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {mostrarConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {erro && <p className="text-sm text-red-500 text-center">{erro}</p>}

            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Carregando..." : "Atualizar"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}