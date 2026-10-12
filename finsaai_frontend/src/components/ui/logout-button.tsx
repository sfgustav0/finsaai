"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    // Encerra a sessão no Supabase e destrói os cookies
    await supabase.auth.signOut()
    
    // Redireciona para o login e atualiza o estado do router
    router.push("/login")
    router.refresh() 
  }

  return (
    <Button
      variant="ghost" 
      onClick={handleLogout} 
      className="w-full justify-start gap-2 text-base font-normal"
    >
      <LogOut className="h-5 w-5" />
      Sair
    </Button>
  )
}