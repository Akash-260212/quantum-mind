import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import SharedCircuit
from server.schemas import SaveCircuitRequest

router = APIRouter(prefix="/api/circuits", tags=["Circuit Sharing"])

def generate_short_id(length=6):
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@router.post("/save")
def save_circuit(req: SaveCircuitRequest, db: Session = Depends(get_db)):
    """
    Persists a circuit configuration to database and returns a short ID.
    """
    short_id = generate_short_id()
    while db.query(SharedCircuit).filter(SharedCircuit.id == short_id).first():
        short_id = generate_short_id()

    record = SharedCircuit(
        id=short_id,
        title=req.title or "Quantum Circuit",
        num_qubits=req.numQubits,
        num_steps=req.numSteps,
        circuit_json=req.gates
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "circuitId": record.id,
        "title": record.title,
        "shareUrl": f"/#circuit_id={record.id}"
    }

@router.get("/{circuit_id}")
def get_circuit(circuit_id: str, db: Session = Depends(get_db)):
    """
    Retrieves a shared circuit by short ID.
    """
    circuit = db.query(SharedCircuit).filter(SharedCircuit.id == circuit_id).first()
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")

    return {
        "id": circuit.id,
        "title": circuit.title,
        "numQubits": circuit.num_qubits,
        "numSteps": circuit.num_steps,
        "gates": circuit.circuit_json,
        "createdAt": circuit.created_at
    }
