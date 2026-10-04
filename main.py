from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from supabase import create_client, Client
import hashlib
import agente_de_ia_1
import time
import agente_de_ia_2
import manipulacao_do_banco_de_dados
import agente_de_ia_3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.post("/processar-pdf")
async def processar_pdf(file: UploadFile = File(...)):
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
                
                manipulacao_do_banco_de_dados.salvar_dados_estruturados_do_danfe(dados_estruturados_do_danfe, categoria_de_gasto, nome_unico)
                
            elif classificacao == "Boleto":
                dados_estruturados_do_boleto = documento.get("dados_estruturados_do_boleto", {})
                manipulacao_do_banco_de_dados.salvar_dados_estruturados_do_boleto(dados_estruturados_do_boleto, nome_unico)
                
            elif classificacao == "Outro documento":
                dados_estruturados_do_outro_documento = documento.get("dados_estruturados_do_outro_documento", {})

                categoria_de_gasto = await agente_de_ia_3.classificar_categoria_de_gasto(dados_estruturados_do_outro_documento)

                manipulacao_do_banco_de_dados.salvar_dados_estruturados_do_outro_documento(dados_estruturados_do_outro_documento, categoria_de_gasto, nome_unico)

        await file.seek(0)
        
        file_bytes = await file.read()
        
        manipulacao_do_banco_de_dados.salvar_arquivo_no_storage(file_bytes, nome_unico, file.content_type)

        supabase.table("arquivos_processados").insert({"hash_do_arquivo": hash_do_arquivo}).execute()

        return {"status": "sucesso", "mensagem": "Sucesso!"}

    except Exception as e:
        print(f"Erro geral no processamento: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/gerar-url-documento/{nome_arquivo:path}")
async def obter_url_documento(nome_arquivo: str):
    url_assinada = manipulacao_do_banco_de_dados.gerar_url_assinada(nome_arquivo)
    
    if url_assinada:
        return {"status": "sucesso", "url": url_assinada}
    else:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado ou erro ao gerar URL")