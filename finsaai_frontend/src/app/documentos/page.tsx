export const dynamic = 'force-dynamic';

import { supabase } from "@/lib/supabase";
import { DataTable } from "./data_table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CircleHelp } from "lucide-react"; // Pode ser CircleHelp dependendo da versão do Lucide
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import BotaoConciliacao from "@/components/ui/botao_conciliacao";

import { 
  colunasDANFEs, 
  colunasBoletos, 
  colunasOutrosDocumentos,
  colunasComprovantesDePagamento
} from "./columns";


export default async function DocumentosPage() {
  
  const [resNotas, resBoletos, resOutros, resComprovantes] = await Promise.all([
    supabase.from('danfe').select('*').order('created_at', { ascending: false }),
    supabase.from('boleto').select('*').order('created_at', { ascending: false }),
    supabase.from('outro_documento').select('*').order('created_at', { ascending: false }),
    supabase.from('comprovante_de_pagamento').select('*').order('created_at', { ascending: false })
  ]);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 bg-gray-50/30">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          {/* Título e Ícone de ajuda alinhados lado a lado */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Documentos processados</h1>
            
            {/* Pop-up de aviso sobre "Outros" */}
            <Dialog>
              <DialogTrigger className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                <CircleHelp className="h-6 w-6" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    Como funciona a conciliação entre os documentos?
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600 mt-2">
                  A conciliação entre os documentos utiliza as Notas Fiscais como referência. Ou seja, são realizadas as seguintes análises:<br /><br />
                  Boleto - Nota Fiscal: Este boleto corresponde a qual Nota Fiscal?<br />
                  Outro documento - Nota Fiscal: Este outro documento corresponde a qual Nota Fiscal?<br />
                  Comprovante de pagamento - Nota Fiscal: Este comprovante de pagamento corresponde a qual Nota Fiscal?<br /><br />
                  Importante citar que essas correspondências só ocorrem quando o Agente de IA possui mais de 90% de certeza. Caso contrário, é entendido que determinado documento não corresponde a determinada Nota Fiscal.<br /><br />
                  Não há análises para verificar se um comprovante de pagamento corresponde a um boleto, por exemplo. Porém, caso um comprovante de pagamento e um boleto correspondam a uma mesma Nota Fiscal, eles vão ser conciliados indiretamente também. Isso poderá ser visualizado ao clicar no botão "Verificar" na coluna "Status de conciliação" de determinada tabela e linha.
                </p>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-gray-500">Visualize abaixo os dados extraídos e a conciliação dos documentos.</p>
        </div>

        <div>
          {/* O seu botão de conciliação */}
          <BotaoConciliacao />
        </div>
      </div>

      <Tabs defaultValue="notas" className="w-full relative">
        
        <div className="absolute top-4 left-0 z-10">
          <TabsList className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
            <TabsTrigger value="notas" className="rounded-md px-4 py-2">
              Notas Fiscais
            </TabsTrigger>
            <TabsTrigger value="boletos" className="rounded-md px-4 py-2">
              Boletos
            </TabsTrigger>
            <TabsTrigger value="outros" className="rounded-md px-4 py-2">
              Outros
            </TabsTrigger>
            <TabsTrigger value="comprovantes" className="rounded-md px-4 py-2">
              Comprovantes de pagamento
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="notas" className="mt-0">
          {resNotas.error ? (
            <p className="text-red-500">Erro: {resNotas.error.message}</p>
          ) : (
            <DataTable columns={colunasDANFEs} data={resNotas.data || []} searchPlaceholder="Pesquisar" />
          )}
        </TabsContent>

        <TabsContent value="boletos" className="mt-0">
          {resBoletos.error ? (
            <p className="text-red-500">Erro: {resBoletos.error.message}</p>
          ) : (
            <DataTable columns={colunasBoletos} data={resBoletos.data || []} searchPlaceholder="Pesquisar" />
          )}
        </TabsContent>

        <TabsContent value="outros" className="mt-0">
          {resOutros.error ? (
            <p className="text-red-500">Erro: {resOutros.error.message}</p>
          ) : (
            <DataTable columns={colunasOutrosDocumentos} data={resOutros.data || []} searchPlaceholder="Pesquisar" />
          )}
        </TabsContent>

        <TabsContent value="comprovantes" className="mt-0">
          {resComprovantes.error ? (
            <p className="text-red-500">Erro: {resComprovantes.error.message}</p>
          ) : (
            <DataTable columns={colunasComprovantesDePagamento} data={resComprovantes.data || []} searchPlaceholder="Pesquisar" />
          )}
        </TabsContent>

      </Tabs>

    </div>
  );
}