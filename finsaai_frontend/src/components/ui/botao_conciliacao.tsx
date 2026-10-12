"use client";

import React, { useState } from "react";
// Assumindo que tem o componente Button do shadcn configurado
import { Button } from "@/components/ui/button"; 

import { Link } from "lucide-react";

export default function BotaoConciliacao({ userId }: { userId: string }) {
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const acionarIA = async () => {
    setCarregando(true);
    setMensagem("");
    
    try {
      const formData = new FormData();
      formData.append("user_id", userId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/executar-conciliacao`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMensagem("Conciliação iniciada! Atualize a página em alguns instantes.");
      } else {
        setMensagem("Erro ao iniciar a conciliação.");
      }
    } catch (error) {
      console.error("Falha ao comunicar com o servidor:", error);
      setMensagem("Falha na comunicação.");
    } finally {
      setCarregando(false);
      // Limpa a mensagem de sucesso após 5 segundos
      setTimeout(() => setMensagem(""), 5000);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Button 
        onClick={acionarIA} 
        disabled={carregando}
        variant="outline"
        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm font-medium h-9 px-4 py-2"
      >
        {carregando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Acordando Agente de IA...
          </>
        ) : (
          <>
            <Link className="mr-2 h-4 w-4" />
            Executar conciliação
          </>
        )}
      </Button>
      
      {mensagem && (
        <span className="text-sm font-medium text-green-600 animate-fade-in">
          {mensagem}
        </span>
      )}
    </div>
  );
}