from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from datetime import datetime
from server.database import Base

class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cohort = Column(String, default="Batch A")
    avatar = Column(String, default="👨‍🎓")
    mastery_score = Column(Float, default=70.0)
    circuits_run = Column(Integer, default=0)
    top_misconception = Column(String, default="None")
    status = Column(String, default="on_track") # 'needs_help', 'on_track', 'advanced'

class MisconceptionLog(Base):
    __tablename__ = "misconception_logs"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    student_id = Column(String, default="anonymous_student", index=True)
    concept_id = Column(String, nullable=False, index=True) # e.g. 'cnot_inversion'
    category = Column(String, nullable=False)               # e.g. 'Entanglement'
    faulty_gate = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SharedCircuit(Base):
    __tablename__ = "shared_circuits"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, default="Quantum Circuit")
    num_qubits = Column(Integer, default=2)
    num_steps = Column(Integer, default=6)
    circuit_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
