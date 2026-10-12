"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ModalConciliacaoProps {
  tipo: "danfe" | "boleto" | "outro" | "comprovante";
  idDocumento: number | string;
}

export default function ModalConciliacao({ tipo, idDocumento }: ModalConciliacaoProps) {
  const [dados, setDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);

  async function buscarConciliacao() {
    if (!idDocumento) return;
    setCarregando(true);

    try {
      // 1. Instanciar o cliente e capturar o utilizador logado
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("Erro: Utilizador não autenticado!");
        setCarregando(false);
        return;
      }

      // 2. Anexar o user_id no final do URL (como Query Parameter)
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conciliacao/documento/${tipo}/${idDocumento}?user_id=${user.id}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setDados(data);
    } catch (err) {
      console.error("Erro ao carregar conciliação:", err);
    } finally {
      setCarregando(false);
    }
  }

  function aoMudarEstado(estaAberto: boolean) {
    setAberto(estaAberto);
    if (estaAberto && !dados) {
      buscarConciliacao();
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudarEstado}>
      
      <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "h-8" })}>
        Verificar
      </DialogTrigger>

      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-0 shadow-2xl bg-white">
        <DialogHeader className="px-6 py-4 border-b bg-gray-50/50 flex flex-row items-center justify-between">
          <DialogTitle className="text-md font-bold text-gray-900">
            Conciliação #{idDocumento}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
          {carregando ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-950" />
              <p className="text-xs text-gray-500 font-medium">Carregando documentos...</p>
            </div>
          ) : dados ? (
            <div className="space-y-8">
              
              {/* --- DANFE --- */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold tracking-wider flex items-center gap-1.5">
                  DANFE
                </h3>
                {/* Mesmas classes do data_table.tsx */}
                <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                  <Table className="text-xs whitespace-nowrap">
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700 w-16">ID</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome do emitente</TableHead>
                        <TableHead className="font-semibold text-gray-700">CNPJ do emitente</TableHead>
                        <TableHead className="font-semibold text-gray-700">Categoria de gasto</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome do destinatário</TableHead>
                        <TableHead className="font-semibold text-gray-700">CNPJ do destinatário</TableHead>
                        <TableHead className="font-semibold text-gray-700">Número</TableHead>
                        <TableHead className="font-semibold text-gray-700">Data de emissão</TableHead>
                        <TableHead className="font-semibold text-gray-700">Valor total da nota</TableHead>
                        <TableHead className="font-semibold text-gray-700">Chave de acesso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{dados.danfe?.id || '-'}</TableCell>
                        <TableCell>{dados.danfe?.nome_do_emitente || '-'}</TableCell>
                        <TableCell>{dados.danfe?.cnpj_do_emitente || '-'}</TableCell>
                        <TableCell>{dados.danfe?.categoria_de_gasto || '-'}</TableCell>
                        <TableCell>{dados.danfe?.nome_do_destinatario || '-'}</TableCell>
                        <TableCell>{dados.danfe?.cnpj_do_destinatario || '-'}</TableCell>
                        <TableCell>{dados.danfe?.numero || '-'}</TableCell>
                        <TableCell>{dados.danfe?.data_de_emissao || '-'}</TableCell>
                        <TableCell className="font-medium">
                          {dados.danfe?.valor_total_da_nota ? `R$ ${dados.danfe.valor_total_da_nota}` : '-'}
                        </TableCell>
                        <TableCell title={dados.danfe?.chave_de_acesso}>
                          {dados.danfe?.chave_de_acesso || '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* --- BOLETO --- */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold tracking-wider flex items-center gap-1.5">
                  Boleto
                </h3>
                <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                  <Table className="text-xs whitespace-nowrap">
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700 w-16">ID</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome do beneficiário</TableHead>
                        <TableHead className="font-semibold text-gray-700">CNPJ do beneficiário</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome do pagador</TableHead>
                        <TableHead className="font-semibold text-gray-700">CNPJ do pagador</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nosso número</TableHead>
                        <TableHead className="font-semibold text-gray-700">Número do documento</TableHead>
                        <TableHead className="font-semibold text-gray-700">Data do documento</TableHead>
                        <TableHead className="font-semibold text-gray-700">Vencimento</TableHead>
                        <TableHead className="font-semibold text-gray-700">Valor do documento</TableHead>
                        <TableHead className="font-semibold text-gray-700">Valor cobrado</TableHead>
                        <TableHead className="font-semibold text-gray-700">Linha digitável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dados.boleto ? (
                        <TableRow className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{dados.boleto.id}</TableCell>
                          <TableCell>{dados.boleto.nome_do_beneficiario || '-'}</TableCell>
                          <TableCell>{dados.boleto.cnpj_do_beneficiario || '-'}</TableCell>
                          <TableCell>{dados.boleto.nome_do_pagador || '-'}</TableCell>
                          <TableCell>{dados.boleto.cnpj_do_pagador || '-'}</TableCell>
                          <TableCell>{dados.boleto.nosso_numero || '-'}</TableCell>
                          <TableCell>{dados.boleto.numero_do_documento || '-'}</TableCell>
                          <TableCell>{dados.boleto.data_do_documento || '-'}</TableCell>
                          <TableCell>{dados.boleto.vencimento || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {dados.boleto.valor_do_documento ? `R$ ${dados.boleto.valor_do_documento}` : '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {dados.boleto.valor_cobrado ? `R$ ${dados.boleto.valor_cobrado}` : '-'}
                          </TableCell>
                          <TableCell title={dados.boleto.linha_digitavel}>
                            {dados.boleto.linha_digitavel || '-'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={12} className="h-16 text-center text-gray-400">
                            Nenhum boleto corresponde a este DANFE
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* --- OUTRO DOCUMENTO --- */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold tracking-wider flex items-center gap-1.5">
                  Outro documento
                </h3>
                <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                  <Table className="text-xs whitespace-nowrap">
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700 w-16">ID</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome do emitente</TableHead>
                        <TableHead className="font-semibold text-gray-700">CNPJ do emitente</TableHead>
                        <TableHead className="font-semibold text-gray-700">Categoria de gasto</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome do destinatário</TableHead>
                        <TableHead className="font-semibold text-gray-700">CNPJ do destinatário</TableHead>
                        <TableHead className="font-semibold text-gray-700">Número</TableHead>
                        <TableHead className="font-semibold text-gray-700">Data de emissão</TableHead>
                        <TableHead className="font-semibold text-gray-700">Valor total do documento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dados.outro ? (
                        <TableRow className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{dados.outro.id}</TableCell>
                          <TableCell>{dados.outro.nome_do_emitente || '-'}</TableCell>
                          <TableCell>{dados.outro.cnpj_do_emitente || '-'}</TableCell>
                          <TableCell>{dados.outro.categoria_de_gasto || '-'}</TableCell>
                          <TableCell>{dados.outro.nome_do_destinatario || '-'}</TableCell>
                          <TableCell>{dados.outro.cnpj_do_destinatario || '-'}</TableCell>
                          <TableCell>{dados.outro.numero || '-'}</TableCell>
                          <TableCell>{dados.outro.data_de_emissao || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {dados.outro.valor_total_do_documento ? `R$ ${dados.outro.valor_total_do_documento}` : '-'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-16 text-center text-gray-400">
                            Nenhum outro documento corresponde a este DANFE
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* --- COMPROVANTE DE PAGAMENTO --- */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold tracking-wider flex items-center gap-1.5">
                  Comprovante de pagamento
                </h3>
                <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                  <Table className="text-xs whitespace-nowrap">
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700 w-16">ID</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome do beneficiário</TableHead>
                        <TableHead className="font-semibold text-gray-700">CNPJ do beneficiário</TableHead>
                        <TableHead className="font-semibold text-gray-700">Nome do pagador</TableHead>
                        <TableHead className="font-semibold text-gray-700">CNPJ do pagador</TableHead>
                        <TableHead className="font-semibold text-gray-700">Data do pagamento</TableHead>
                        <TableHead className="font-semibold text-gray-700">Valor do pagamento</TableHead>
                        <TableHead className="font-semibold text-gray-700">Autenticação</TableHead>
                        <TableHead className="font-semibold text-gray-700">ID da transação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dados.comprovante ? (
                        <TableRow className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{dados.comprovante.id}</TableCell>
                          <TableCell>{dados.comprovante.nome_do_beneficiario || '-'}</TableCell>
                          <TableCell>{dados.comprovante.cnpj_do_beneficiario || '-'}</TableCell>
                          <TableCell>{dados.comprovante.nome_do_pagador || '-'}</TableCell>
                          <TableCell>{dados.comprovante.cnpj_do_pagador || '-'}</TableCell>
                          <TableCell>{dados.comprovante.data_do_pagamento || '-'}</TableCell>
                          <TableCell className="font-medium">
                            {dados.comprovante.valor_pago ? `R$ ${dados.comprovante.valor_pago}` : '-'}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate" title={dados.comprovante.autenticacao}>
                            {dados.comprovante.autenticacao || '-'}
                          </TableCell>
                          <TableCell>{dados.comprovante.id_transacao || '-'}</TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="h-16 text-center text-gray-400">
                            Nenhum comprovante de pagamento corresponde a este DANFE
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}