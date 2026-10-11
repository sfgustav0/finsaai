"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "./data_table_features"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { useState } from "react";
import ModalConciliacao from "@/components/ui/modal_de_conciliacao";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"

import { DataTableColumnHeader } from "@/components/ui/data_table_column_header"
import { BotaoVerProdutos } from "@/components/ui/visualizar_dados_dos_produtos";
import { obterUrlDoDocumento } from "@/lib/documentos";

export type DANFE = {
  id: number
  nome_do_arquivo: string[] | null;
  nome_do_emitente: string | null;
  cnpj_do_emitente: string | null;
  nome_do_destinatario: string | null;
  cnpj_do_destinatario: string | null;
  numero: string | null;
  data_de_emissao: string | null;
  valor_total_da_nota: number | null;
  chave_de_acesso: string | null;
  categoria_de_gasto: string | null;
}

export type Boleto = {
  id: number
  caminho_do_arquivo: string | null;
  nome_do_beneficiario: string | null;
  cnpj_do_beneficiario: string | null;
  nome_do_pagador: string | null;
  cnpj_do_pagador: string | null;
  nosso_numero: string | null;
  numero_do_documento: string | null;
  data_do_documento: string | null;
  valor_do_documento: number | null;
  linha_digitavel: string | null;
  valor_cobrado: number | null;
  vencimento: string | null;
}

export type OutroDocumento = {
  id: number
  nome_do_arquivo: string | null;
  nome_do_emitente: string | null;
  cnpj_do_emitente: string | null;
  nome_do_destinatario: string | null;
  cnpj_do_destinatario: string | null;
  numero: string | null;
  data_de_emissao: string | null;
  valor_total_do_documento: number | null;
  chave_de_acesso: string | null;
  categoria_de_gasto: string | null;
}

export type ComprovanteDePagamento = {
  id: number
  nome_do_arquivo: string | null;
  nome_do_beneficiario: string | null;
  cnpj_do_beneficiario: string | null;
  nome_do_pagador: string | null;
  cnpj_do_pagador: string | null;
  data_de_pagamento: string | null;
  valor_do_pagamento: number | null;
  autenticacao: string | null;
  id_da_transacao: string | null;
}

const helperDANFEs = createColumnHelper<DataTableFeatures, DANFE>()
const helperBoletos = createColumnHelper<DataTableFeatures, Boleto>()
const helperOutrosDocumentos = createColumnHelper<DataTableFeatures, OutroDocumento>()
const helperComprovantesDePagamentos = createColumnHelper<DataTableFeatures, ComprovanteDePagamento>();

const createSelectColumn = (helper: any) => 
  helper.display({
    id: "select",
    header: ({ table }: any) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar tudo"
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  })

export const colunasDANFEs = helperDANFEs.columns([
  createSelectColumn(helperDANFEs),
  helperDANFEs.accessor("id", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />
  }),
  helperDANFEs.accessor("nome_do_emitente", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do emitente" />
  }),
  helperDANFEs.accessor("cnpj_do_emitente", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do emitente" />
  }),
  helperDANFEs.accessor("categoria_de_gasto", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoria de gasto" />
  }),
  helperDANFEs.accessor("nome_do_destinatario", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do destinatário" />
  }),
  helperDANFEs.accessor("cnpj_do_destinatario", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do destinatário" />
  }),
  helperDANFEs.accessor("numero", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Número" />
  }),
  helperDANFEs.accessor("data_de_emissao", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data de emissão" />
  }),
  helperDANFEs.accessor("valor_total_da_nota", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor total da nota" />,
    cell: ({ row }) => {
      const valor = row.getValue("valor_total_da_nota") as number;
      if (valor === null || valor === undefined) return "-";
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }
  }),
  helperDANFEs.accessor("chave_de_acesso", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Chave de acesso" />
  }),
  
    helperDANFEs.display({
      id: "itens",
      header: () => <div className="text-center font-medium">Dados do produto</div>,
      cell: ({ row }) => {
        const chave = row.original.chave_de_acesso;
        
        if (!chave) {
          return <div className="text-center text-gray-400 text-sm">-</div>;
        }
        
        return (
          <div className="text-center">
            <BotaoVerProdutos 
              chaveDeAcesso={chave} 
              tabelaProdutos="danfe_dados_do_produto" 
            />
          </div>
        );
      }
    }),

    helperDANFEs.display({
    id: "status_conciliacao",
    header: () => <div className="text-center font-medium">Status de conciliação</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <ModalConciliacao tipo="danfe" idDocumento={row.original.id} />
      </div>
    ),
  }),

    helperDANFEs.display({
      id: "acoes",
      cell: ({ row }) => {
        const danfe = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Lógica para listar todos os arquivos do documento */}
                {(() => {
                  const dadoBruto = row.original.nome_do_arquivo;
                  
                  if (!dadoBruto) {
                    return <DropdownMenuItem disabled>Sem arquivos anexos</DropdownMenuItem>;
                  }

                  // Normalização segura do array de arquivos
                  let listaDeArquivos: string[] = [];
                  if (Array.isArray(dadoBruto)) {
                    listaDeArquivos = dadoBruto;
                  } else if (typeof dadoBruto === "string") {
                    try {
                      listaDeArquivos = (dadoBruto as string).startsWith("[") ? JSON.parse(dadoBruto as string) : [dadoBruto];
                    } catch {
                      listaDeArquivos = [dadoBruto];
                    }
                  }

                  // Se houver apenas 1 arquivo, mostra botão simples
                  if (listaDeArquivos.length === 1) {
                    return (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={async () => {
                          try {
                            const urlSegura = await obterUrlDoDocumento(listaDeArquivos[0]);
                            window.open(urlSegura, '_blank');
                          } catch (erro) {
                            console.error(erro);
                            alert("Erro ao abrir o documento.");
                          }
                        }}
                      >
                        Visualizar documento
                      </DropdownMenuItem>
                    );
                  }

                  // Se houver MÚLTIPLOS arquivos, cria um item no menu para cada um
                  return (
                    <>
                      <DropdownMenuLabel className="text-xs text-gray-500">Visualizar documento</DropdownMenuLabel>
                      {listaDeArquivos.map((nomeArquivo, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="cursor-pointer"
                          onClick={async () => {
                            try {
                              const urlSegura = await obterUrlDoDocumento(nomeArquivo);
                              window.open(urlSegura, '_blank');
                            } catch (erro) {
                              console.error(erro);
                              alert(`Erro ao abrir a página ${index + 1}.`);
                            }
                          }}
                        >
                          Arquivo {index + 1}
                        </DropdownMenuItem>
                      ))}
                    </>
                  );
                })()}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ])

export const colunasBoletos = helperBoletos.columns([
  createSelectColumn(helperBoletos),
  helperBoletos.accessor("id", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> 
  }),
  helperBoletos.accessor("nome_do_beneficiario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do beneficiário" /> 
  }),
  helperBoletos.accessor("cnpj_do_beneficiario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do beneficiário" /> 
  }),
  helperBoletos.accessor("nome_do_pagador", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do pagador" /> 
  }),
  helperBoletos.accessor("cnpj_do_pagador", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do pagador" /> 
  }),
  helperBoletos.accessor("nosso_numero", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nosso número" /> 
  }),
  helperBoletos.accessor("numero_do_documento", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Número do documento" /> 
  }),
  helperBoletos.accessor("data_do_documento", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Data do documento" />
    }),
    helperBoletos.accessor("vencimento", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vencimento" />
  }),
  helperBoletos.accessor("valor_do_documento", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor do documento" />,
    cell: ({ row }) => {
      const valor = row.getValue("valor_do_documento") as number;
      if (valor === null || valor === undefined) return "-";
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }
  }),
  helperBoletos.accessor("valor_cobrado", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor cobrado" />,
    cell: ({ row }) => {
      const valor = row.getValue("valor_cobrado") as number;
      if (valor === null || valor === undefined) return "-";
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }
  }),
  helperBoletos.accessor("linha_digitavel", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Linha digitável" />
  }),

  helperBoletos.display({
      id: "status_conciliacao",
      header: () => <div className="text-center font-medium">Status de conciliação</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <ModalConciliacao tipo="boleto" idDocumento={row.original.id} />
        </div>
      ),
    }),

    helperBoletos.display({
      id: "acoes",
      cell: ({ row }) => {
        const boleto = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={async () => {
                  if (boleto.caminho_do_arquivo) {
                    try {
                      const urlSegura = await obterUrlDoDocumento(boleto.caminho_do_arquivo);
                      
                      window.open(urlSegura, '_blank');
                    } catch (erro) {
                      console.error("Erro ao obter URL:", erro);
                      alert("Erro ao abrir o documento. Verifique se o servidor está rodando.");
                    }
                  } else {
                    alert("Arquivo não encontrado ou sem caminho registrado.");
                  }
                }}
              >
                Visualizar documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ])

export const colunasOutrosDocumentos = helperOutrosDocumentos.columns([
  createSelectColumn(helperOutrosDocumentos),
  helperOutrosDocumentos.accessor("id", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />
  }),
  helperOutrosDocumentos.accessor("nome_do_emitente", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do emitente" />
  }),
  helperOutrosDocumentos.accessor("cnpj_do_emitente", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do emitente" />
  }),
  helperOutrosDocumentos.accessor("categoria_de_gasto", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categoria de gasto" />
  }),
  helperOutrosDocumentos.accessor("nome_do_destinatario", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do destinatário" />
  }),
  helperOutrosDocumentos.accessor("cnpj_do_destinatario", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do destinatário" />
  }),
  helperOutrosDocumentos.accessor("numero", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Número" />
  }),
  helperOutrosDocumentos.accessor("data_de_emissao", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data de emissão" />
  }),
  helperOutrosDocumentos.accessor("valor_total_do_documento", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor total do documento" />,
    cell: ({ row }) => {
      const valor = row.getValue("valor_total_do_documento") as number;
      if (valor === null || valor === undefined) return "-";
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }
  }),

    helperOutrosDocumentos.display({
      id: "itens",
      header: () => <div className="text-center font-medium">Dados do produto</div>,
      cell: ({ row }) => {
        const chave = row.original.chave_de_acesso;
        
        if (!chave) {
          return <div className="text-center text-gray-400 text-sm">-</div>;
        }
        
        return (
          <div className="text-center">
            <BotaoVerProdutos 
              chaveDeAcesso={chave} 
              tabelaProdutos="outro_documento_dados_do_produto" 
            />
          </div>
        );
      }
    }),

    helperBoletos.display({
        id: "status_conciliacao",
        header: () => <div className="text-center font-medium">Status de conciliação</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <ModalConciliacao tipo="outro" idDocumento={row.original.id} />
          </div>
        ),
      }),

    helperOutrosDocumentos.display({
      id: "acoes",
      cell: ({ row }) => {
        const outro_documento = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={async () => {
                  if (outro_documento.nome_do_arquivo) {
                    try {
                      const urlSegura = await obterUrlDoDocumento(outro_documento.nome_do_arquivo[0]);
                      
                      window.open(urlSegura, '_blank');
                    } catch (erro) {
                      console.error("Erro ao obter URL:", erro);
                      alert("Erro ao abrir o documento. Verifique se o servidor está rodando.");
                    }
                  } else {
                    alert("Arquivo não encontrado ou sem caminho registrado.");
                  }
                }}
              >
                Visualizar documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ])

export const colunasComprovantesDePagamento = helperComprovantesDePagamentos.columns([
  createSelectColumn(helperComprovantesDePagamentos),
  helperComprovantesDePagamentos.accessor("id", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> 
  }),
  helperComprovantesDePagamentos.accessor("nome_do_beneficiario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do beneficiário" /> 
  }),
  helperComprovantesDePagamentos.accessor("cnpj_do_beneficiario", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do beneficiário" /> 
  }),
  helperComprovantesDePagamentos.accessor("nome_do_pagador", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome do pagador" /> 
  }),
  helperComprovantesDePagamentos.accessor("cnpj_do_pagador", { 
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ do pagador" /> 
  }),
  helperComprovantesDePagamentos.accessor("data_de_pagamento", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data de pagamento" />
  }),
  helperComprovantesDePagamentos.accessor("valor_do_pagamento", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor do pagamento" />,
    cell: ({ row }) => {
      const valor = row.getValue("valor_do_pagamento") as number;
      if (valor === null || valor === undefined) return "-";
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }
  }),
  helperComprovantesDePagamentos.accessor("autenticacao", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Autenticação" />
  }),
  helperComprovantesDePagamentos.accessor("id_da_transacao", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID da transação" />
  }),
  
    helperBoletos.display({
        id: "status_conciliacao",
        header: () => <div className="text-center font-medium">Status de conciliação</div>,
        cell: ({ row }) => (
          <div className="text-center">
            <ModalConciliacao tipo="comprovante" idDocumento={row.original.id} />
          </div>
        ),
      }),

    helperComprovantesDePagamentos.display({
      id: "acoes",
      cell: ({ row }) => {
        const comprovante = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={async () => {
                  if (comprovante.nome_do_arquivo) {
                    try {
                      const urlSegura = await obterUrlDoDocumento(comprovante.nome_do_arquivo);
                      
                      window.open(urlSegura, '_blank');
                    } catch (erro) {
                      console.error("Erro ao obter URL:", erro);
                      alert("Erro ao abrir o documento. Verifique se o servidor está rodando.");
                    }
                  } else {
                    alert("Arquivo não encontrado ou sem caminho registrado.");
                  }
                }}
              >
                Visualizar documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ])