from core.config import supabase
from schemas.valid_structured_output import DadosEstruturadosDoDanfeTratado, DadosEstruturadosDoBoletoTratado, DadosEstruturadosDoOutroDocumentoTratado, DadosEstruturadosDoComprovanteDePagamentoTratado

def salvar_dados_estruturados_do_danfe(dados_estruturados_do_danfe: dict, categoria_de_gasto: str, nome_arquivo_original: str, user_id: str):
    emitente = dados_estruturados_do_danfe.get("emitente", {})
    destinatario = dados_estruturados_do_danfe.get("destinatario", {})
    calculo_do_imposto = dados_estruturados_do_danfe.get("calculo_do_imposto", {})
    dados_do_produto_brutos = dados_estruturados_do_danfe.get("dados_do_produto", [])

    try:
        danfe_limpo = DadosEstruturadosDoDanfeTratado(
            nome_do_emitente=emitente.get("nome"),
            cnpj_do_emitente=emitente.get("cnpj"),
            nome_do_destinatario=destinatario.get("nome"),
            cnpj_do_destinatario=destinatario.get("cnpj"),
            numero=emitente.get("numero"),
            data_de_emissao=destinatario.get("data_da_emissao"),
            valor_total_da_nota=calculo_do_imposto.get("valor_total_da_nota"),
            chave_de_acesso=emitente.get("chave_de_acesso"),
            categoria_de_gasto=categoria_de_gasto,
            dados_do_produto=dados_do_produto_brutos
        )
    except Exception as e:
        print(f"Erro ao validar e higienizar o output da IA: {e}")
        return

    if not danfe_limpo.chave_de_acesso:
        print("Aviso: Chave de acesso não identificada ou inválida nesta página.")
        return

    dados_para_insercao = danfe_limpo.model_dump(exclude_none=True)
    dados_para_insercao.pop("dados_do_produto", None)
    dados_para_insercao["user_id"] = user_id
    
    try:
        verificacao = supabase.table("danfe").select("id, nome_do_arquivo").eq("chave_de_acesso", danfe_limpo.chave_de_acesso).execute()
        
        if len(verificacao.data) > 0:
            arquivos_existentes = verificacao.data[0].get("nome_do_arquivo")
            if not isinstance(arquivos_existentes, list):
                arquivos_existentes = []
            
            if nome_arquivo_original not in arquivos_existentes:
                arquivos_existentes.append(nome_arquivo_original)
                dados_para_insercao["nome_do_arquivo"] = arquivos_existentes
            
            if dados_para_insercao:
                supabase.table("danfe").update(dados_para_insercao).eq("chave_de_acesso", danfe_limpo.chave_de_acesso).execute()
            print(f"Sucesso! DANFE atualizada com os dados complementares (Chave: {danfe_limpo.chave_de_acesso})")
        else:
            dados_para_insercao["nome_do_arquivo"] = [nome_arquivo_original]
            supabase.table("danfe").insert(dados_para_insercao).execute()
            print(f"Sucesso! Nova DANFE registrada (Chave: {danfe_limpo.chave_de_acesso})")
            
    except Exception as e:
        print(f"Erro ao processar o cabeçalho da DANFE: {e}")

    lote_de_produtos = []
    
    for produto in danfe_limpo.dados_do_produto:
        if not produto.descricao_do_produto:
            continue
            
        lote_de_produtos.append({
            "chave_de_acesso": danfe_limpo.chave_de_acesso,
            "descricao_do_produto": produto.descricao_do_produto,
            "quantidade": produto.quantidade,
            "user_id": user_id
        })
    
    if lote_de_produtos:
        try:
            supabase.table("danfe_dados_do_produto").insert(lote_de_produtos).execute()
            print(f"Sucesso! {len(lote_de_produtos)} produtos inseridos em lote.")
        except Exception as e:
            print(f"Erro ao inserir o lote de produtos: {e}")

def salvar_dados_estruturados_do_boleto(dados_estruturados_do_boleto: dict, nome_arquivo_original: str, user_id: str):
    
    beneficiario = dados_estruturados_do_boleto.get("beneficiario", {})
    pagador = dados_estruturados_do_boleto.get("pagador", {})

    try:
        boleto_limpo = DadosEstruturadosDoBoletoTratado(
            nome_do_beneficiario=beneficiario.get("nome"),
            cnpj_do_beneficiario=beneficiario.get("cnpj"),
            nome_do_pagador=pagador.get("nome"),
            cnpj_do_pagador=pagador.get("cnpj"),
            nosso_numero=dados_estruturados_do_boleto.get("nosso_numero"),
            numero_do_documento=dados_estruturados_do_boleto.get("numero_do_documento"),
            data_do_documento=dados_estruturados_do_boleto.get("data_do_documento"),
            vencimento=dados_estruturados_do_boleto.get("vencimento"),
            valor_do_documento=dados_estruturados_do_boleto.get("valor_do_documento"),
            valor_cobrado=dados_estruturados_do_boleto.get("valor_cobrado"),
            linha_digitavel=dados_estruturados_do_boleto.get("linha_digitavel")
        )
    except Exception as e:
        print(f"Erro ao validar e higienizar os dados do Boleto: {e}")
        return

    dados_insercao = boleto_limpo.model_dump(exclude_none=True)
    dados_insercao["caminho_do_arquivo"] = nome_arquivo_original
    dados_insercao["user_id"] = user_id

    try:
        resposta = supabase.table("boleto").insert(dados_insercao).execute()
        
        if resposta.data:
            print(f"Sucesso! Boleto inserido no Supabase: ID {resposta.data[0]['id']}")
        else:
            print("Sucesso! Boleto inserido.")
            
    except Exception as e:
        print(f"Erro ao inserir Boleto: {e}")

def salvar_dados_estruturados_do_outro_documento(dados_estruturados_do_outro_documento: dict, categoria_de_gasto: str, nome_arquivo_original: str, user_id: str):

    emitente = dados_estruturados_do_outro_documento.get("emitente", {})
    destinatario = dados_estruturados_do_outro_documento.get("destinatario", {})
    calculo_do_imposto = dados_estruturados_do_outro_documento.get("calculo_do_imposto", {})
    dados_do_produto_brutos = dados_estruturados_do_outro_documento.get("dados_do_produto", [])

    try:
        outro_documento_limpo = DadosEstruturadosDoOutroDocumentoTratado(
            nome_do_emitente=emitente.get("nome"),
            cnpj_do_emitente=emitente.get("cnpj"),
            nome_do_destinatario=destinatario.get("nome"),
            cnpj_do_destinatario=destinatario.get("cnpj"),
            numero=emitente.get("numero"),
            data_de_emissao=destinatario.get("data_da_emissao"),
            valor_total_do_documento=calculo_do_imposto.get("valor_total_da_nota"),
            chave_de_acesso=emitente.get("chave_de_acesso"),
            categoria_de_gasto=categoria_de_gasto,
            dados_do_produto=dados_do_produto_brutos
        )
    except Exception as e:
        print(f"Erro ao validar e higienizar o output da IA: {e}")
        return

    if not outro_documento_limpo.chave_de_acesso:
        print("Aviso: Chave de acesso não identificada ou inválida nesta página.")
        return

    dados_para_insercao = outro_documento_limpo.model_dump(exclude_none=True)
    dados_para_insercao.pop("dados_do_produto", None)
    dados_para_insercao["user_id"] = user_id
    
    try:
        verificacao = supabase.table("outro_documento").select("id, nome_do_arquivo").eq("chave_de_acesso", outro_documento_limpo.chave_de_acesso).execute()
        
        if len(verificacao.data) > 0:
            arquivos_existentes = verificacao.data[0].get("nome_do_arquivo")
            if not isinstance(arquivos_existentes, list):
                arquivos_existentes = []
            
            if nome_arquivo_original not in arquivos_existentes:
                arquivos_existentes.append(nome_arquivo_original)
                dados_para_insercao["nome_do_arquivo"] = arquivos_existentes
            
            if dados_para_insercao:
                supabase.table("outro_documento").update(dados_para_insercao).eq("chave_de_acesso", outro_documento_limpo.chave_de_acesso).execute()
            print(f"Sucesso! Outro documento atualizado com os dados complementares (Chave: {outro_documento_limpo.chave_de_acesso})")
        else:
            dados_para_insercao["nome_do_arquivo"] = [nome_arquivo_original]
            supabase.table("outro_documento").insert(dados_para_insercao).execute()
            print(f"Sucesso! Novo Outro documento registrado (Chave: {outro_documento_limpo.chave_de_acesso})")
            
    except Exception as e:
        print(f"Erro ao processar o cabeçalho do Outro documento: {e}")

    lote_de_produtos = []
    
    for produto in outro_documento_limpo.dados_do_produto:
        if not produto.descricao_do_produto:
            continue
            
        lote_de_produtos.append({
            "chave_de_acesso": outro_documento_limpo.chave_de_acesso,
            "descricao_do_produto": produto.descricao_do_produto,
            "quantidade": produto.quantidade,
            "user_id": user_id
        })
    
    if lote_de_produtos:
        try:
            supabase.table("outro_documento_dados_do_produto").insert(lote_de_produtos).execute()
            print(f"Sucesso! {len(lote_de_produtos)} produtos inseridos em lote.")
        except Exception as e:
            print(f"Erro ao inserir o lote de produtos: {e}")

def salvar_dados_estruturados_do_comprovante_de_pagamento(dados_estruturados_do_comprovante_de_pagamento: dict, nome_arquivo_original: str, user_id: str):
    
    beneficiario = dados_estruturados_do_comprovante_de_pagamento.get("beneficiario", {})
    pagador = dados_estruturados_do_comprovante_de_pagamento.get("pagador", {})

    try:
        comprovante_de_pagamento_limpo = DadosEstruturadosDoComprovanteDePagamentoTratado(
            nome_do_beneficiario=beneficiario.get("nome"),
            cnpj_do_beneficiario=beneficiario.get("cnpj"),
            nome_do_pagador=pagador.get("nome"),
            cnpj_do_pagador=pagador.get("cnpj"),
            data_de_pagamento=dados_estruturados_do_comprovante_de_pagamento.get("data_de_pagamento"),
            valor_do_pagamento=dados_estruturados_do_comprovante_de_pagamento.get("valor_do_pagamento"),
            autenticacao=dados_estruturados_do_comprovante_de_pagamento.get("autenticacao"),
            id_da_transacao=dados_estruturados_do_comprovante_de_pagamento.get("id_da_transacao")
        )
    except Exception as e:
        print(f"Erro ao validar e higienizar os dados do Comprovante de Pagamento: {e}")
        return

    dados_insercao = comprovante_de_pagamento_limpo.model_dump(exclude_none=True)
    dados_insercao["nome_do_arquivo"] = nome_arquivo_original
    dados_insercao["user_id"] = user_id

    try:
        resposta = supabase.table("comprovante_de_pagamento").insert(dados_insercao).execute()
        
        if resposta.data:
            print(f"Sucesso! Comprovante de pagamento inserido no Supabase: ID {resposta.data[0]['id']}")
        else:
            print("Sucesso! Comprovante de pagamento inserido.")
            
    except Exception as e:
        print(f"Erro ao inserir Comprovante de pagamento: {e}")

def salvar_arquivo_no_storage(file_bytes: bytes, nome_arquivo: str, content_type: str, user_id: str):
    try:
        resposta = supabase.storage.from_("arquivos-dos-documentos-processados").upload(
            file=file_bytes,
            path=nome_arquivo,
            file_options={"content-type": content_type}
        )
        print(f"Sucesso! Arquivo '{nome_arquivo}' salvo no Storage.")
    except Exception as e:
        print(f"Erro ao salvar arquivo no Storage: {e}")

def gerar_url_assinada(nome_arquivo: str, expiracao_em_segundos: int = 3600):
    try:
        nome_limpo = nome_arquivo.split("/")[-1]
        
        resposta = supabase.storage.from_("arquivos-dos-documentos-processados").create_signed_url(
            path=nome_limpo,
            expires_in=expiracao_em_segundos
        )
        return resposta.get("signedURL")
    except Exception:
        return None