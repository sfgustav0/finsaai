from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apis.rotas.documentos import router as roteador_documentos

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roteador_documentos, prefix="/api")