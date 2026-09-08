from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class GateItem(BaseModel):
    id: Optional[str] = None
    type: str # 'H', 'X', 'Y', 'Z', 'S', 'T', 'RX', 'RY', 'RZ', 'CNOT', 'CZ', 'SWAP', 'M'
    step: int
    qubit: int
    controlQubit: Optional[int] = None
    targetQubit: Optional[int] = None
    angle: Optional[float] = None

class CircuitSimulationRequest(BaseModel):
    numQubits: int
    numSteps: Optional[int] = 6
    gates: List[GateItem]
    shots: Optional[int] = 1024

class MisconceptionLogRequest(BaseModel):
    studentId: Optional[str] = "anonymous_student"
    conceptId: str
    category: str
    faultyGate: Optional[str] = None

class SaveCircuitRequest(BaseModel):
    title: Optional[str] = "Shared Circuit"
    numQubits: int
    numSteps: int
    gates: List[Dict[str, Any]]

class MentorChatRequest(BaseModel):
    question: str
    language: Optional[str] = "en" # 'en', 'hi', 'ta', 'te', 'bn'
    circuitContext: Optional[Dict[str, Any]] = None
