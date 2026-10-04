export const dynamic = 'force-dynamic';

import { supabase } from "@/lib/supabase";
import { DataTable } from "./data_table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { 
  colunasDANFEs, 
  colunasBoletos, 
  colunasOutrosDocumentos 
} from "./columns";


export default async function DocumentosPage() {
  
  const [resNotas, resBoletos, resOutros] = await Promise.all([
    supabase.from('danfe').select('*').order('created_at', { ascending: false }),
    supabase.from('boleto').select('*').order('created_at', { ascending: false }),
    supabase.from('outro_documento').select('*').order('created_at', { ascending: false })
  ]);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 bg-gray-50/30">
      
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Documentos processados</h1>
        <p className="text-gray-500">Visualize abaixo os dados extraídos dos documentos.</p>
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

      </Tabs>

    </div>
  );
}