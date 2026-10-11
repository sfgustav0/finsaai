from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from services.processamento_de_arquivos import processamento_de_arquivos
from database import manipulacao
from core.config import supabase
from agentes_de_ia.agente_de_ia_4 import conciliar_documentos

router = APIRouter()

@router.post("/processar_arquivos")
async def processar_arquivos(file: UploadFile = File(...)):
    try:
        resultado = await processamento_de_arquivos(file)
        return resultado
        
    except Exception as e:
        print(f"Erro geral: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gerar-url-documento/{nome_arquivo:path}")
async def obter_url_documento(nome_arquivo: str):
    url_assinada = manipulacao.gerar_url_assinada(nome_arquivo)
    if url_assinada:
        return {"status": "sucesso", "url": url_assinada}
    raise HTTPException(status_code=404, detail="Arquivo não encontrado")

@router.get("/conciliacao/documento/{tipo}/{id_documento}")
def obter_conciliacao_por_documento(tipo: str, id_documento: int):
    # 1. Mapeia o tipo recebido do frontend para a coluna correspondente no Supabase
    mapa_colunas = {
        "danfe": "id_danfe",
        "boleto": "id_boleto",
        "outro": "id_outro_documento",
        "comprovante": "id_comprovante_de_pagamento"
    }

    coluna_busca = mapa_colunas.get(tipo)
    if not coluna_busca:
        raise HTTPException(status_code=400, detail="Tipo de documento inválido")

    # 2. Procura qual Dossiê contém este ID específico
    conciliacao_response = supabase.table('documentos_conciliados').select('*').eq(coluna_busca, id_documento).execute()

    # Se não encontrar nenhuma conciliação vinculada a este documento
    if not conciliacao_response.data:
        return {"status": "NÃO INICIADO", "danfe": None, "boleto": None, "comprovante": None, "outro": None}

    conciliacao = conciliacao_response.data[0]

    # 3. Agora que temos a linha mestre do Dossiê, buscamos todos os documentos 
    # (Pode reutilizar exatamente a mesma lógica que já usa no endpoint original)
    resposta_final = {
        "status": conciliacao.get("status", "INCOMPLETO"),
        "danfe": None,
        "boleto": None,
        "outro": None,
        "comprovante": None
    }

    if conciliacao.get('id_danfe'):
        danfe_data = supabase.table('danfe').select('*').eq('id', conciliacao['id_danfe']).execute()
        if danfe_data.data: resposta_final["danfe"] = danfe_data.data[0]

    if conciliacao.get('id_boleto'):
        boleto_data = supabase.table('boleto').select('*').eq('id', conciliacao['id_boleto']).execute()
        if boleto_data.data: resposta_final["boleto"] = boleto_data.data[0]
        
    if conciliacao.get('id_outro_documento'):
        outro_data = supabase.table('outro_documento').select('*').eq('id', conciliacao['id_outro_documento']).execute()
        if outro_data.data: resposta_final["outro"] = outro_data.data[0]

    if conciliacao.get('id_comprovante_de_pagamento'):
        comp_data = supabase.table('comprovante_de_pagamento').select('*').eq('id', conciliacao['id_comprovante_de_pagamento']).execute()
        if comp_data.data: resposta_final["comprovante"] = comp_data.data[0]

    return resposta_final

@router.post("/executar-conciliacao")
def iniciar_conciliacao_ia(background_tasks: BackgroundTasks):
    background_tasks.add_task(conciliar_documentos)
    return {"status": "sucesso", "mensagem": "Conciliação por IA iniciada em segundo plano."}