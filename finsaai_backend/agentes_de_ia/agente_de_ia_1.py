from schemas.structured_output import LoteDeDocumentos
import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.instrumentation.anthropic import AnthropicInstrumentor
from anthropic import AsyncAnthropic
from fastapi import UploadFile
import base64
import json
from json_repair import repair_json

#provedor = TracerProvider()
#trace.set_tracer_provider(provedor)
#langfuse_public_key = os.environ.get("LANGFUSE_PUBLIC_KEY")
#langfuse_secret_key = os.environ.get("LANGFUSE_SECRET_KEY")
#langfuse_base_url = os.environ.get("LANGFUSE_BASE_URL", "https://us.cloud.langfuse.com")
#credencial = base64.b64encode(f"{langfuse_public_key}:{langfuse_secret_key}".encode()).decode()
#exportador = OTLPSpanExporter(
    #endpoint=f"{langfuse_base_url}/api/public/otel/v1/traces",
    #headers={"Authorization": f"Basic {credencial}"}
#)
#provedor.add_span_processor(SimpleSpanProcessor(exportador))
#AnthropicInstrumentor().instrument()

client = AsyncAnthropic()

async def extrair_dados_estruturados_de_documentos(file: UploadFile):

    file_bytes = await file.read()
    file_data = base64.b64encode(file_bytes).decode("utf-8")
    extensao = file.filename.lower().split('.')[-1]
    if extensao == "pdf":
        media_type = "application/pdf"
    elif extensao == "png":
        media_type = "image/png"
    else:
        media_type = "image/jpeg"

    message = await client.beta.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=20000,
        system="""Você extrai dados estruturados de um arquivo que contém 'DANFEs', 'Boletos', 'Outros documentos' ou 'Comprovantes de pagamento'. As seguintes instruções te auxiliam a cumprir a sua atividade:
        1. Um 'DANFE' sempre terá um campo e um número destinados a sua 'Chave de Acesso';
        2. Um 'Boleto' sempre terá um campo e um número destinados ao seu 'Nosso Número';
        3. Um 'Outro documento' é um documento que substitue um 'DANFE' por um breve período de tempo, como 'Cupons' e 'Pedidos de compra'. É possível que esse contenha apenas uma descrição de produtos, logo, se o documento do arquivo não possuir campos e números destinados a uma 'Chave de Acesso' (identificador de 'DANFE') ou a um 'Nosso Número' (identificador de 'Boleto'), ele será correspondente a um 'Outro documento';
        4. Um 'Comprovante de pagamento' usualmente contém um texto como 'Comprovante de pagamento' ou 'Comprovante de transferência' que identifica o documento claramente;
        5. Prefira valores explícitos ao invés de valores inferidos. Caso algum dado requerido pelo 'schema' do 'output_config' não esteja claro ou simlplesmente não exista, apenas retorne 'NA' para o seu respectivo campo.""",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image" if media_type.startswith("image") else "document",
                        "source": {
                            "type": "base64",
                            "data": file_data,
                            "media_type": media_type,
                        },
                    },
                ],
            },
        ],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": LoteDeDocumentos.model_json_schema()
                },
            },
    )

    await file.seek(0)
    
    dados_estruturados_de_documentos = ""
    if isinstance(message.content, list):
        for bloco in message.content:
            if getattr(bloco, "type", "") == "text":
                dados_estruturados_de_documentos = bloco.text
                break
    else:
        dados_estruturados_de_documentos = message.content
    
    #provedor.force_flush()
    
    return json.loads(repair_json(dados_estruturados_de_documentos))