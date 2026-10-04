"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";

// Definimos uma interface TypeScript rigorosa para as propriedades (Props)
interface BotaoVerProdutosProps {
  chaveDeAcesso: string;
  tabelaProdutos: "danfe_dados_do_produto" | "outro_documento_dados_do_produto";
}

export function BotaoVerProdutos({ chaveDeAcesso, tabelaProdutos }: BotaoVerProdutosProps) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);

  async function buscarProdutos() {
    if (!chaveDeAcesso) return;
    
    setCarregando(true);
    
    const { data, error } = await supabase
      .from(tabelaProdutos)
      .select("*")
      .eq("chave_de_acesso", chaveDeAcesso);

    if (!error && data) {
      setProdutos(data);
    }
    
    setCarregando(false);
  }

  // Intercepta a abertura do painel para disparar a busca de dados
  function aoMudarEstado(estaAberto: boolean) {
    setAberto(estaAberto);
    if (estaAberto && produtos.length === 0) {
      buscarProdutos();
    }
  }

  return (
    <Sheet open={aberto} onOpenChange={aoMudarEstado}>
      <SheetTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "h-8" })}>
        Visualizar
      </SheetTrigger>
      
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dados do produto</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          {carregando ? (
            <p className="text-center text-sm text-gray-500 py-4">A carregar produtos...</p>
          ) : produtos.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">Nenhum produto encontrado.</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 font-medium">Descrição do produto</th>
                  <th className="p-2 font-medium text-right">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{produto.descricao_do_produto}</td>
                    <td className="p-2 text-right">{produto.quantidade ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}