import hashlib
import time
import os
from fastapi import UploadFile
from core.config import supabase
from database import manipulacao
from agentes_de_ia import agente_de_ia_1, agente_de_ia_2, agente_de_ia_3

async def processamento_de_arquivos(file: UploadFile, user_id: str):
    try:

        conteudo_do_arquivo = await file.read()
        hash_do_arquivo = hashlib.md5(conteudo_do_arquivo).hexdigest()

        verificacao_de_hash_do_arquivo = supabase.table("arquivos_processados").select("id").eq("hash_do_arquivo", hash_do_arquivo).execute()

        if len(verificacao_de_hash_do_arquivo.data) > 0:
            return {"status": "erro", "mensagem": "Este arquivo já foi processado anteriormente."}
        
        await file.seek(0)

        dados_estruturados_de_documentos = await agente_de_ia_1.extrair_dados_estruturados_de_documentos(file)

        nome_original = file.filename
        nome_base, extensao = os.path.splitext(nome_original)
        carimbo_tempo = int(time.time())
        nome_unico = f"{nome_base}_{carimbo_tempo}{extensao}"

        lista_de_dados_estruturados_de_documentos = dados_estruturados_de_documentos.get("documentos", [])

        for documento in lista_de_dados_estruturados_de_documentos:
            classificacao = documento.get("classificacao")

            if classificacao == "DANFE":
                dados_estruturados_do_danfe = documento.get("dados_estruturados_do_danfe", {})
                
                categoria_de_gasto = await agente_de_ia_2.classificar_categoria_de_gasto(dados_estruturados_do_danfe)
                
                manipulacao.salvar_dados_estruturados_do_danfe(dados_estruturados_do_danfe, categoria_de_gasto, nome_unico, user_id)
                
            elif classificacao == "Boleto":
                dados_estruturados_do_boleto = documento.get("dados_estruturados_do_boleto", {})
                manipulacao.salvar_dados_estruturados_do_boleto(dados_estruturados_do_boleto, nome_unico, user_id)
                
            elif classificacao == "Outro documento":
                dados_estruturados_do_outro_documento = documento.get("dados_estruturados_do_outro_documento", {})

                categoria_de_gasto = await agente_de_ia_3.classificar_categoria_de_gasto(dados_estruturados_do_outro_documento)

                manipulacao.salvar_dados_estruturados_do_outro_documento(dados_estruturados_do_outro_documento, categoria_de_gasto, nome_unico, user_id)

            elif classificacao == "Comprovante de pagamento":
                dados_estruturados_do_comprovante_de_pagamento = documento.get("dados_estruturados_do_comprovante_de_pagamento", {})
                manipulacao.salvar_dados_estruturados_do_comprovante_de_pagamento(dados_estruturados_do_comprovante_de_pagamento, nome_unico, user_id)

        await file.seek(0)
        
        file_bytes = await file.read()
        
        manipulacao.salvar_arquivo_no_storage(file_bytes, nome_unico, file.content_type, user_id)

        supabase.table("arquivos_processados").insert({
            "hash_do_arquivo": hash_do_arquivo,
            "user_id": user_id
        }).execute()

        return {"status": "sucesso", "mensagem": "Sucesso!"}

    except Exception as e:
        print(f"Erro geral no processamento: {e}")
        raise RuntimeError(f"Falha ao processar arquivo: {str(e)}")