from pydantic import BaseModel, field_validator, model_validator
from typing import Optional, List
import re
import hashlib

class DadosDoProdutoTratado(BaseModel):
    descricao_do_produto: Optional[str] = None
    quantidade: Optional[float] = None

    @field_validator("quantidade", mode="before")
    @classmethod
    def limpar_quantidade(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None

        valor_str = str(valor).strip().lower()

        apenas_numeros = re.sub(r'[^0-9,\.]', '', valor_str)

        if not apenas_numeros:
            return None

        apenas_numeros = apenas_numeros.replace(".", "").replace(",", ".")

        try:
            return float(apenas_numeros)
        except ValueError:
            return None

class DadosEstruturadosDoDanfeTratado(BaseModel):
    nome_do_emitente: Optional[str] = None
    cnpj_do_emitente: Optional[str] = None
    nome_do_destinatario: Optional[str] = None
    cnpj_do_destinatario: Optional[str] = None
    numero: Optional[str] = None
    data_de_emissao: Optional[str] = None
    valor_total_da_nota: Optional[float] = None
    chave_de_acesso: Optional[str] = None
    categoria_de_gasto: Optional[str] = None
    dados_do_produto: List[DadosDoProdutoTratado] = []

    @field_validator("valor_total_da_nota", mode="before")
    @classmethod
    def limpar_valor_total_da_nota(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
            
        valor_str = str(valor).replace("R$", "").strip()
        
        if "." in valor_str and "," in valor_str:
            valor_str = valor_str.replace(".", "").replace(",", ".")
        elif "," in valor_str:
            valor_str = valor_str.replace(",", ".")
            
        try:
            return float(valor_str)
        except ValueError:
            return None

    @field_validator("cnpj_do_emitente", "cnpj_do_destinatario", mode="before")
    @classmethod
    def limpar_cnpj(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return re.sub(r'[^0-9]', '', str(valor))

    @field_validator("chave_de_acesso", mode="before")
    @classmethod
    def limpar_chave_de_acesso(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return re.sub(r'[^0-9]', '', str(valor))

    @field_validator("nome_do_emitente", "nome_do_destinatario", mode="before")
    @classmethod
    def limpar_nome(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @field_validator("numero", mode="before")
    @classmethod
    def limpar_numero(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @field_validator("data_de_emissao", mode="before")
    @classmethod
    def limpar_data_de_emissao(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

class DadosEstruturadosDoBoletoTratado(BaseModel):
    nome_do_beneficiario: Optional[str] = None
    cnpj_do_beneficiario: Optional[str] = None
    nome_do_pagador: Optional[str] = None
    cnpj_do_pagador: Optional[str] = None
    nosso_numero: Optional[str] = None
    numero_do_documento: Optional[str] = None
    data_do_documento: Optional[str] = None
    vencimento: Optional[str] = None
    valor_do_documento: Optional[float] = None
    valor_cobrado: Optional[float] = None
    linha_digitavel: Optional[str] = None

    @field_validator("nome_do_beneficiario", "nome_do_pagador", mode="before")
    @classmethod
    def limpar_nome(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @field_validator("cnpj_do_beneficiario", "cnpj_do_pagador", mode="before")
    @classmethod
    def limpar_cnpj(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return re.sub(r'[^0-9]', '', str(valor))

    @field_validator("data_do_documento", "vencimento", mode="before")
    @classmethod
    def limpar_data(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @field_validator("valor_do_documento", "valor_cobrado", mode="before")
    @classmethod
    def limpar_valor(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
            
        valor_str = str(valor).replace("R$", "").strip()
        
        if "." in valor_str and "," in valor_str:
            valor_str = valor_str.replace(".", "").replace(",", ".")
        elif "," in valor_str:
            valor_str = valor_str.replace(",", ".")
            
        try:
            return float(valor_str)
        except ValueError:
            return None

    @field_validator("linha_digitavel", "nosso_numero", "numero_do_documento", mode="before")
    @classmethod
    def limpar_numero(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return re.sub(r'[^0-9]', '', str(valor))

    @model_validator(mode="after")
    def igualar_valor(self):
        if self.valor_cobrado is None and self.valor_do_documento is not None:
            self.valor_cobrado = self.valor_do_documento
        return self

class DadosEstruturadosDoOutroDocumentoTratado(BaseModel):
    nome_do_emitente: Optional[str] = None
    cnpj_do_emitente: Optional[str] = None
    nome_do_destinatario: Optional[str] = None
    cnpj_do_destinatario: Optional[str] = None
    numero: Optional[str] = None
    data_de_emissao: Optional[str] = None
    valor_total_do_documento: Optional[float] = None
    chave_de_acesso: Optional[str] = None
    categoria_de_gasto: Optional[str] = None
    dados_do_produto: List[DadosDoProdutoTratado] = []

    @field_validator("valor_total_do_documento", mode="before")
    @classmethod
    def limpar_valor_total_da_nota(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
            
        valor_str = str(valor).replace("R$", "").strip()
        
        if "." in valor_str and "," in valor_str:
            valor_str = valor_str.replace(".", "").replace(",", ".")
        elif "," in valor_str:
            valor_str = valor_str.replace(",", ".")
            
        try:
            return float(valor_str)
        except ValueError:
            return None

    @field_validator("cnpj_do_emitente", "cnpj_do_destinatario", mode="before")
    @classmethod
    def limpar_cnpj(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return re.sub(r'[^0-9]', '', str(valor))

    @field_validator("chave_de_acesso", mode="before")
    @classmethod
    def limpar_chave_de_acesso(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return re.sub(r'[^0-9]', '', str(valor))

    @field_validator("nome_do_emitente", "nome_do_destinatario", mode="before")
    @classmethod
    def limpar_nome(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @field_validator("numero", mode="before")
    @classmethod
    def limpar_numero(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @field_validator("data_de_emissao", mode="before")
    @classmethod
    def limpar_data_de_emissao(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @model_validator(mode="after")
    def gerar_chave_de_acesso_sintetica(self):
        if not self.chave_de_acesso:
            cnpj = str(self.cnpj_do_emitente or "SEM_CNPJ")
            numero = str(self.numero or "SEM_NUMERO")
            data = str(self.data_de_emissao or "SEM_DATA")
            valor = str(self.valor_total_do_documento or "0")
            
            string_base = f"{cnpj}_{numero}_{data}_{valor}"
            
            self.chave_de_acesso = hashlib.md5(string_base.encode('utf-8')).hexdigest()
            
        return self

class DadosEstruturadosDoComprovanteDePagamentoTratado(BaseModel):
    nome_do_beneficiario: Optional[str] = None
    cnpj_do_beneficiario: Optional[str] = None
    nome_do_pagador: Optional[str] = None
    cnpj_do_pagador: Optional[str] = None
    data_de_pagamento: Optional[str] = None
    valor_do_pagamento: Optional[float] = None
    autenticacao: Optional[float] = None
    id_da_transacao: Optional[str] = None

    @field_validator("nome_do_beneficiario", "nome_do_pagador", mode="before")
    @classmethod
    def limpar_nome(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @field_validator("cnpj_do_beneficiario", "cnpj_do_pagador", mode="before")
    @classmethod
    def limpar_cnpj(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return re.sub(r'[^0-9]', '', str(valor))

    @field_validator("data_de_pagamento", mode="before")
    @classmethod
    def limpar_data(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return str(valor)

    @field_validator("valor_do_pagamento", mode="before")
    @classmethod
    def limpar_valor(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
            
        valor_str = str(valor).replace("R$", "").strip()
        
        if "." in valor_str and "," in valor_str:
            valor_str = valor_str.replace(".", "").replace(",", ".")
        elif "," in valor_str:
            valor_str = valor_str.replace(",", ".")
            
        try:
            return float(valor_str)
        except ValueError:
            return None

    @field_validator("autenticacao", "id_da_transacao", mode="before")
    @classmethod
    def limpar_numero(cls, valor):
        if not valor or str(valor).strip().lower() in ["na", "n/a", "null", "", "none"]:
            return None
        return re.sub(r'[^0-9]', '', str(valor))