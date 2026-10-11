from core.config import supabase
from typesafe_sdk import Choice, TypeSafeClient

def sincronizar_danfes():
    danfes = supabase.table('danfe').select('id').execute().data
    registros_para_conciliacao = supabase.table('documentos_conciliados').select('id_danfe').execute().data
    
    danfes_com_registros_para_conciliacao = [d['id_danfe'] for d in registros_para_conciliacao]
    
    novos_registros = []
    for danfe in danfes:
        if danfe['id'] not in danfes_com_registros_para_conciliacao:
            novos_registros.append({
                "id_danfe": danfe['id'],
                "status": "INCOMPLETO"
            })
            
    if novos_registros:
        supabase.table('documentos_conciliados').insert(novos_registros).execute()
        print(f"[{len(novos_registros)}] Novos registros criados.")

def obter_documentos_pendentes_de_conciliacao(tabela, coluna_de_referencia):
    registros = supabase.table('documentos_conciliados').select(coluna_de_referencia).filter(coluna_de_referencia, 'not.is', 'null').execute().data
    ids_com_registros_para_conciliacao = [d[coluna_de_referencia] for d in registros]
    
    query = supabase.table(tabela).select('*')
    if ids_com_registros_para_conciliacao:
        ids_formatados = ",".join(map(str, ids_com_registros_para_conciliacao))
        query = query.filter('id', 'not.in', f"({ids_formatados})")
        
    return query.execute().data

def construir_criteria(documentos_pendentes_de_conciliacao, classificacao, escape):
    criteria = {}
    for item in documentos_pendentes_de_conciliacao:
        criteria[f"{classificacao}_{item['id']}"] = item
    criteria["nenhuma_correspondencia"] = {"what": escape}
    return criteria

def conciliar_documentos():
    print("Iniciando conciliação...")
    
    sincronizar_danfes()
    
    conciliacoes_em_aberto = supabase.table('documentos_conciliados').select('*').eq('status', 'INCOMPLETO').execute().data
    
    if not conciliacoes_em_aberto:
        print("Todos os DANFEs foram conciliados.")
        return

    boletos_pendentes_de_conciliacao = obter_documentos_pendentes_de_conciliacao('boleto', 'id_boleto')
    outros_documentos_pendentes_de_conciliacao = obter_documentos_pendentes_de_conciliacao('outro_documento', 'id_outro_documento')
    comprovantes_de_pagamento_pendentes_de_conciliacao = obter_documentos_pendentes_de_conciliacao('comprovante_de_pagamento', 'id_comprovante_de_pagamento')

    criteria_para_boletos = construir_criteria(boletos_pendentes_de_conciliacao, "boleto", "Nenhum boleto corresponde a este DANFE.")
    criteria_para_outros_documentos = construir_criteria(outros_documentos_pendentes_de_conciliacao, "outro_documento", "Nenhum documento corresponde a este DANFE.")
    criteria_para_comprovantes_de_pagamento = construir_criteria(comprovantes_de_pagamento_pendentes_de_conciliacao, "comprovante_de_pagamento", "Nenhum comprovante de pagamento corresponde a este DANFE.")

    with TypeSafeClient() as client:
        for conciliacao in conciliacoes_em_aberto:
            print(f"\n--- Analisando Dossiê da DANFE {conciliacao['id_danfe']} ---")
            
            danfe = supabase.table('danfe').select('*').eq('id', conciliacao['id_danfe']).single().execute().data
            
            state = {
                "classificacao": "DANFE",
                "nome_do_emitente": danfe.get("nome_do_emitente", ""),
                "cnpj_do_emitente": danfe.get("cnpj_do_emitente", ""),
                "nome_do_destinatario": danfe.get("nome_do_destinatario", ""),
                "cnpj_do_destinatario": danfe.get("cnpj_do_destinatario", ""),
                "numero": danfe.get("numero", ""),
                "data_de_emissao": danfe.get("data_de_emissao", ""),
                "valor_total_da_nota": danfe.get("valor_total_da_nota", ""),
                "chave_de_acesso": danfe.get("chave_de_acesso", ""),
                "categoria_de_gasto": danfe.get("categoria_de_gasto", ""),
            }
            
            questions = {}
            dados_para_atualizacao = {}
                
            if conciliacao['id_boleto'] is None and boletos_pendentes_de_conciliacao:
                questions["boleto"] = Choice(
                    instructions="Qual destes boletos corresponde a este DANFE?",
                    criteria=criteria_para_boletos
                )

            if conciliacao['id_outro_documento'] is None and outros_documentos_pendentes_de_conciliacao:
                questions["outro_documento"] = Choice(
                    instructions="Qual destes documentos corresponde a este DANFE?",
                    criteria=criteria_para_outros_documentos
                )
                
            if conciliacao['id_comprovante_de_pagamento'] is None and comprovantes_de_pagamento_pendentes_de_conciliacao:
                questions["comprovante_de_pagamento"] = Choice(
                    instructions="Qual destes comprovantes de pagamento corresponde a este DANFE?",
                    criteria=criteria_para_comprovantes_de_pagamento
                )

            if not questions:
                print("Faltam documentos, mas não há candidatos novos para testar.")
                continue

            response = client.system_one(state=state, questions=questions)

            for chave, resposta in response.answers.items():
                escolha = resposta.choice
                confianca = resposta.confidence

                if confianca < 0.90:
                    print(f"[{chave}] Confiança de {confianca*100:.1f}% insuficiente para a escolha '{escolha}'. Forçando 'nenhuma_correspondencia'.")
                    escolha = "nenhuma_correspondencia"

                if escolha and escolha != "nenhuma_correspondencia":
                    id_encontrado = int(escolha.split("_")[1])
                    if chave == "boleto":
                        dados_para_atualizacao['id_boleto'] = id_encontrado
                    elif chave == "comp":
                        dados_para_atualizacao['id_comprovante_de_pagamento'] = id_encontrado
                    elif chave == "outro":
                        dados_para_atualizacao['id_outro_documento'] = id_encontrado

            if dados_para_atualizacao:
                tem_boleto = conciliacao['id_boleto'] or dados_para_atualizacao.get('id_boleto')
                tem_comp = conciliacao['id_comprovante_de_pagamento'] or dados_para_atualizacao.get('id_comprovante_de_pagamento')
                tem_outro_documento = conciliacao['id_outro_documento'] or dados_para_atualizacao.get('id_outro_documento')
                
                if tem_boleto and tem_comp and tem_outro_documento:
                    dados_para_atualizacao['status'] = 'COMPLETO'
                    
                supabase.table('documentos_conciliados').update(dados_para_atualizacao).eq('id', conciliacao['id']).execute()
                print(f"Atualizado: {dados_para_atualizacao}")
            else:
                print("O Jev não encontrou correspondências desta vez.")

if __name__ == "__main__":
    conciliar_documentos()