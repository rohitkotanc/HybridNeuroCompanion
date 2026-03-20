from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

app = FastAPI(
    title="Hybrid Neuro Companion API",
    version="0.1.0",
    description=(
        "Clinician-support prototype with strict separation between vital-driven alerts "
        "and doctor-controlled patient-message summarization."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(router, prefix="/api")


@app.get("/")
def root() -> dict:
    return {
        "name": "Hybrid Neuro Companion API",
        "warning": "This prototype is decision-support software and not a substitute for licensed medical judgment.",
        "docs": "/docs",
    }
