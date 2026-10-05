from dotenv import load_dotenv
from typesafe_sdk import AsyncTypeSafeClient, Choice

load_dotenv()

async def classificar_categoria_de_gasto(dados_estruturados_do_danfe: dict):
    async with AsyncTypeSafeClient() as client:
    
        response = await client.system_one(
            state=dados_estruturados_do_danfe,
            questions={
                "categoria de gasto": Choice(
                    instructions="Tendo em vista o campo 'dados do produto', qual é a categoria de gasto deste DANFE?",
                    criteria={"Açougue": None, "Bebidas": None, "Embalagens e Descartáveis": None, "Hortifrúti": None, "Laticínios e Frios": None, "Outros": None, "Padaria": None}
                )
            }
        )
        
        return(response.choices["categoria de gasto"].choice)