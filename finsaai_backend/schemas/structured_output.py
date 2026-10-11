from pydantic import BaseModel, Field
from typing import List, Literal, Optional

# ================================================================================
# CLASSES COMPARTILHADAS ENTRE "DANFE" E "OutroDocumento"
# ================================================================================

class Emitente(BaseModel):
    model_config = {"extra": "forbid"}
    nome: str
    cnpj: str
    numero: str
    folha: str
    chave_de_acesso: str

class Destinatario(BaseModel):
    model_config = {"extra": "forbid"}
    nome: str
    cnpj: str
    data_da_emissao: str

class CalculoDoImposto(BaseModel):
    model_config = {"extra": "forbid"}
    valor_total_da_nota: str

class DadosDoProduto(BaseModel):
    model_config = {"extra": "forbid"}
    descricao_do_produto: str
    quantidade: str

# ================================================================================
# CLASSES COMPARTILHADAS ENTRE "Boleto" e "ComprovanteDePagamento"
# ================================================================================

class Beneficiario(BaseModel):
    model_config = {"extra": "forbid"}
    nome: str
    cnpj: str

class Pagador(BaseModel):
    model_config = {"extra": "forbid"}
    nome: str
    cnpj: str

# ================================================================================
# CLASSES COMPLETAS PARA TODOS OS DOCUMENTOS
# ================================================================================

class DANFE(BaseModel):
    model_config = {"extra": "forbid"}
    emitente: Emitente
    destinatario: Destinatario
    calculo_do_imposto: CalculoDoImposto
    dados_do_produto: List[DadosDoProduto] = Field(
        description="Liste todos os produtos descritos no DANFE."
    )

class Boleto(BaseModel):
    model_config = {"extra": "forbid"}
    beneficiario: Beneficiario
    pagador: Pagador
    nosso_numero: str
    numero_do_documento: str
    data_do_documento: str
    vencimento: str
    valor_do_documento: str
    valor_cobrado: str
    linha_digitavel: str

class OutroDocumento(BaseModel):
    model_config = {"extra": "forbid"}
    emitente: Emitente
    destinatario: Destinatario
    calculo_do_imposto: CalculoDoImposto
    dados_do_produto: List[DadosDoProduto] = Field(
        description="Liste todos os produtos descritos no Outro Documento."
    )

class ComprovanteDePagamento(BaseModel):
    model_config = {"extra": "forbid"}
    beneficiario: Beneficiario
    pagador: Pagador
    data_de_pagamento: str
    valor_do_pagamento: str
    autenticacao: str
    id_da_transacao: str

# ================================================================================
# CONSOLIDAÇÃO DOS DOCUMENTOS IDENTIFICADOS NO ARQUIVO
# ================================================================================

class Documento(BaseModel):
    model_config = {"extra": "forbid"}
    classificacao: Literal["DANFE", "Boleto", "Outro documento", "Comprovante de pagamento"] = Field(
        description="Analise o arquivo e classifique o documento presente nesse."
    )
    dados_estruturados_do_danfe: Optional[DANFE] = Field(
        default=None,
        description="Preencha APENAS se 'classificacao' for igual a 'DANFE'."
    )
    dados_estruturados_do_boleto: Optional[Boleto] = Field(
        default=None,
        description="Preencha APENAS se 'classificacao' for igual a 'Boleto'."
    )
    dados_estruturados_do_outro_documento: Optional[OutroDocumento] = Field(
        default=None,
        description="Preencha APENAS se 'classificacao' for igual a 'Outro documento'."
    )
    dados_estruturados_do_comprovante_de_pagamento: Optional[ComprovanteDePagamento] = Field(
        default=None,
        description="Preencha APENAS se 'classificacao' for igual a 'Comprovante de pagamento'."
    )

class LoteDeDocumentos(BaseModel):
    model_config = {"extra": "forbid"}
    documentos: List[Documento] = Field(
        description="Liste todos os documentos identificados no arquivo."
    )