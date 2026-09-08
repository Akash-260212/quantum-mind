from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.database import engine, Base
from server.routers import qiskit_runner, mentor, telemetry, circuits

# Create SQLite database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Quantum Mind Backend Engine",
    description="Deterministic Qiskit execution, class misconception heatmap telemetry, and multilingual Gemini AI mentor.",
    version="1.0.0"
)

# Allow requests from Vite frontend (http://localhost:5173) and any classroom host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(qiskit_runner.router)
app.include_router(mentor.router)
app.include_router(telemetry.router)
app.include_router(circuits.router)

@app.get("/")
def root():
    return {
        "message": "Quantum Mind Backend Engine Active",
        "version": "1.0.0",
        "docsUrl": "/docs",
        "features": [
            "IBM Qiskit 2.5 Circuit Runner (/api/quantum/run-qiskit)",
            "Multilingual AI Mentor (/api/mentor/chat)",
            "Class Misconception Heatmap Telemetry (/api/telemetry/heatmap)",
            "Persistent Circuit Sharing (/api/circuits/save)"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "engine": "IBM Qiskit + Gemini AI + SQLite Telemetry"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="127.0.0.1", port=8000, reload=True)
