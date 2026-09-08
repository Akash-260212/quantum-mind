import math
from fastapi import APIRouter, HTTPException
from server.schemas import CircuitSimulationRequest
from qiskit import QuantumCircuit, qasm2
from qiskit.quantum_info import Statevector

router = APIRouter(prefix="/api/quantum", tags=["Quantum Engine"])

@router.post("/run-qiskit")
def run_qiskit_simulation(req: CircuitSimulationRequest):
    """
    Executes a circuit on the IBM Qiskit engine.
    Constructs a Qiskit QuantumCircuit from frontend JSON,
    computes statevector, measurement probability distribution, and OpenQASM 2.0.
    """
    try:
        num_qubits = max(1, min(req.numQubits, 5))
        qc = QuantumCircuit(num_qubits)

        # Sort gates by chronological time step
        sorted_gates = sorted(req.gates, key=lambda g: g.step)

        for g in sorted_gates:
            q = g.qubit
            if q >= num_qubits:
                continue

            gate_type = g.type.upper()

            if gate_type == 'H':
                qc.h(q)
            elif gate_type == 'X':
                qc.x(q)
            elif gate_type == 'Y':
                qc.y(q)
            elif gate_type == 'Z':
                qc.z(q)
            elif gate_type == 'S':
                qc.s(q)
            elif gate_type == 'T':
                qc.t(q)
            elif gate_type == 'RX':
                angle = g.angle if g.angle is not None else math.pi / 2
                qc.rx(angle, q)
            elif gate_type == 'RY':
                angle = g.angle if g.angle is not None else math.pi / 2
                qc.ry(angle, q)
            elif gate_type == 'RZ':
                angle = g.angle if g.angle is not None else math.pi / 2
                qc.rz(angle, q)
            elif gate_type == 'CNOT' and g.controlQubit is not None:
                if g.controlQubit < num_qubits and g.controlQubit != q:
                    qc.cx(g.controlQubit, q)
            elif gate_type == 'CZ' and g.controlQubit is not None:
                if g.controlQubit < num_qubits and g.controlQubit != q:
                    qc.cz(g.controlQubit, q)
            elif gate_type == 'SWAP' and g.targetQubit is not None:
                if g.targetQubit < num_qubits and g.targetQubit != q:
                    qc.swap(q, g.targetQubit)

        # Compute exact statevector via Qiskit Statevector primitive
        state = Statevector.from_instruction(qc)
        state_data = state.data # Complex array of 2^n length

        # Probabilities & Dirac representation
        num_states = 1 << num_qubits
        probabilities = [float(abs(val)**2) for val in state_data]

        dirac_terms = []
        for i in range(num_states):
            prob = probabilities[i]
            if prob > 0.001:
                amp = state_data[i]
                binary_label = format(i, f'0{num_qubits}b')
                # Format amplitude
                if abs(amp.imag) < 0.01:
                    dirac_terms.append(f"{amp.real:+.2f}|{binary_label}⟩")
                else:
                    dirac_terms.append(f"({amp.real:.2f}{amp.imag:+.2f}i)|{binary_label}⟩")

        dirac_representation = " ".join(dirac_terms) if dirac_terms else "|0...0⟩"

        # Measurement sampling (1,024 shots)
        shots = req.shots or 1024
        sampled_counts = state.sample_counts(shots=shots)
        clean_counts = {str(k): int(v) for k, v in sampled_counts.items()}

        # OpenQASM export
        try:
            qasm_output = qasm2.dumps(qc)
        except Exception:
            qasm_output = "// OpenQASM 2.0 not available for this configuration"

        return {
            "status": "success",
            "engine": "IBM Qiskit 2.5 (Native Python Backend)",
            "numQubits": num_qubits,
            "depth": int(qc.depth()),
            "totalGates": len(sorted_gates),
            "diracRepresentation": dirac_representation,
            "probabilities": probabilities,
            "measurementCounts": clean_counts,
            "qasm": qasm_output
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Qiskit execution error: {str(e)}")
