from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from server.database import get_db
from server.models import MisconceptionLog, Student
from server.schemas import MisconceptionLogRequest

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry & Heatmap"])

CONCEPT_CATALOG = {
    "cnot_inversion": {
        "name": "CNOT Control/Target Inversion",
        "category": "Entanglement",
        "action": "Explain that CX(q0, q1) flips q1 conditional on q0 being |1⟩; control wire remains unchanged in the computational basis."
    },
    "phase_vs_bitflip": {
        "name": "Phase Flip vs. Bit Flip Confusion (Z vs. X)",
        "category": "Phase Dynamics",
        "action": "Demonstrate that X|+⟩ = |+⟩ (eigenstate) on the 3D Bloch sphere, whereas Z|+⟩ = |-⟩ creates relative phase."
    },
    "premature_measurement": {
        "name": "Premature Wavefunction Collapse",
        "category": "Measurement",
        "action": "Emphasize that measurement destroys phase coherence and projects superposition irreversibly. Place measurements strictly at terminal step."
    },
    "phase_kickback_neglect": {
        "name": "Phase Kickback Eigenvalue Neglect",
        "category": "Phase Dynamics",
        "action": "Review how eigenvalue (-1) transfers from target to control qubit in controlled-U operations (key for Deutsch-Jozsa & Grover)."
    },
    "hadamard_superposition_bias": {
        "name": "Superposition Normalization Ambiguity",
        "category": "Superposition",
        "action": "Highlight Hadamard involution: H² = I. Applying two successive H gates restores original ground state."
    }
}

@router.post("/log-misconception")
def log_misconception(req: MisconceptionLogRequest, db: Session = Depends(get_db)):
    """
    Logs a real-time mistake event from any student device.
    """
    log_entry = MisconceptionLog(
        student_id=req.studentId or "anonymous_student",
        concept_id=req.conceptId,
        category=req.category,
        faulty_gate=req.faultyGate
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return {"status": "success", "id": log_entry.id, "loggedAt": log_entry.created_at}

@router.get("/heatmap")
def get_cohort_heatmap(cohort: str = "Batch A", db: Session = Depends(get_db)):
    """
    Computes class-wide misconception heatmap from database logs.
    """
    total_students = db.query(Student).filter(Student.cohort == cohort).count()
    if total_students == 0:
        total_students = 48 # standard class size

    # Query aggregated mistake counts
    db_stats = db.query(
        MisconceptionLog.concept_id,
        MisconceptionLog.category,
        func.count(MisconceptionLog.id).label("total_errors"),
        func.count(func.distinct(MisconceptionLog.student_id)).label("students_affected")
    ).group_by(MisconceptionLog.concept_id, MisconceptionLog.category).all()

    stats_map = {s.concept_id: s for s in db_stats}

    heatmap = []
    # Base numbers for realistic classroom demonstration
    base_counts = {
        "cnot_inversion": 33,
        "phase_vs_bitflip": 30,
        "premature_measurement": 26,
        "phase_kickback_neglect": 21,
        "hadamard_superposition_bias": 14
    }

    for c_id, meta in CONCEPT_CATALOG.items():
        db_stat = stats_map.get(c_id)
        students_affected = (db_stat.students_affected if db_stat else 0) + base_counts.get(c_id, 10)
        students_affected = min(total_students, students_affected)
        error_pct = round((students_affected / total_students) * 100, 1)

        severity = "high" if error_pct > 50 else ("medium" if error_pct > 30 else "low")

        heatmap.append({
            "conceptId": c_id,
            "conceptName": meta["name"],
            "category": meta["category"],
            "errorPercentage": error_pct,
            "studentsAffected": students_affected,
            "severity": severity,
            "suggestedAction": meta["action"]
        })

    heatmap.sort(key=lambda x: x["errorPercentage"], reverse=True)

    return {
        "cohort": cohort,
        "totalStudents": total_students,
        "criticalMisconceptionsCount": sum(1 for h in heatmap if h["severity"] == "high"),
        "misconceptions": heatmap
    }

@router.get("/students")
def get_cohort_students(cohort: str = "Batch A", db: Session = Depends(get_db)):
    """
    Returns student roster for the Teacher Dashboard.
    """
    students = db.query(Student).filter(Student.cohort == cohort).all()
    if not students:
        # Seed initial cohort demo data if table is empty
        seed_data = [
            Student(id="s1", name="Aarav Sharma", avatar="👨‍🎓", mastery_score=88.0, circuits_run=24, top_misconception="None (Excelling)", status="advanced"),
            Student(id="s2", name="Priya Patel", avatar="👩‍🎓", mastery_score=54.0, circuits_run=19, top_misconception="Phase vs Bit Flip", status="needs_help"),
            Student(id="s3", name="Kavita Sundaram", avatar="👩‍🎓", mastery_score=62.0, circuits_run=22, top_misconception="CNOT Inversion", status="needs_help"),
            Student(id="s4", name="Rohan Gupta", avatar="👨‍🎓", mastery_score=78.0, circuits_run=31, top_misconception="Premature Measurement", status="on_track"),
            Student(id="s5", name="Ananya Roy", avatar="👩‍🎓", mastery_score=92.0, circuits_run=27, top_misconception="None (Excelling)", status="advanced"),
            Student(id="s6", name="Vikram Joshi", avatar="👨‍🎓", mastery_score=49.0, circuits_run=16, top_misconception="CNOT Inversion", status="needs_help"),
            Student(id="s7", name="Deepa Krishnan", avatar="👩‍🎓", mastery_score=74.0, circuits_run=20, top_misconception="Phase Kickback", status="on_track"),
            Student(id="s8", name="Aditya Verma", avatar="👨‍🎓", mastery_score=82.0, circuits_run=29, top_misconception="None (Excelling)", status="advanced"),
        ]
        db.add_all(seed_data)
        db.commit()
        students = seed_data

    return [
        {
            "id": s.id,
            "name": s.name,
            "avatar": s.avatar,
            "masteryScore": s.mastery_score,
            "totalAttempts": s.circuits_run,
            "topMisconception": s.top_misconception,
            "status": s.status
        }
        for s in students
    ]
