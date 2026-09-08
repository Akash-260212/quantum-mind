/**
 * API Service connecting Quantum Mind UI to the Python FastAPI Backend.
 * Features automatic transparent fallback to local browser simulation / telemetry if backend is offline.
 */

// Support configurable production backend URL via environment variable or default to localhost
const BACKEND_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${BACKEND_ROOT}/api`;

export interface QiskitSimResult {
  num_qubits: number;
  circuit_depth: number;
  openqasm: string;
  probabilities: number[];
  statevector_dirac: string;
  measurement_counts: Record<string, number>;
  execution_engine: string;
}

export interface BackendStatus {
  online: boolean;
  engine: string;
  qiskit_version?: string;
  gemini_available?: boolean;
}

export interface MisconceptionHeatmapData {
  cohort_size: number;
  total_mistakes: number;
  active_alerts: string[];
  gate_misconceptions: Array<{
    name: string;
    mistakes: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  concept_misconceptions: Array<{
    concept: string;
    mistakes: number;
    rate: string;
  }>;
}

/** Check if Python backend is alive */
export async function checkBackendHealth(): Promise<BackendStatus> {
  try {
    const res = await fetch(`${BACKEND_ROOT}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        engine: data.engine || 'IBM Qiskit 2.5 + FastAPI',
        qiskit_version: data.qiskit_version,
        gemini_available: data.gemini_available,
      };
    }
  } catch {
    // Backend is offline or unreachable
  }
  return { online: false, engine: 'Client-Side WASM / JS' };
}

/** Run circuit on IBM Qiskit backend */
export async function runQiskitCircuit(numQubits: number, numSteps: number, gates: any[]): Promise<QiskitSimResult | null> {
  try {
    const formattedGates = gates.map(g => ({
      id: g.id,
      type: g.type,
      step: g.step,
      qubit: g.qubit,
      controlQubit: g.controlQubit,
      targetQubit: g.targetQubit,
      angle: g.angle,
    }));

    const res = await fetch(`${API_BASE_URL}/quantum/run-qiskit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numQubits,
        numSteps,
        gates: formattedGates,
        shots: 1024,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[QuantumMind API] Qiskit runner unreachable, using client simulation fallback:', err);
  }
  return null;
}

/** Send student misconception telemetry event to backend */
export async function logMisconceptionToBackend(event: {
  student_id: string;
  concept_id: string;
  category: string;
  faulty_gate?: string;
  step_context?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/telemetry/log-misconception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: event.student_id,
        conceptId: event.concept_id,
        category: event.category,
        faultyGate: event.faulty_gate,
      }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch cohort-wide misconception heatmap */
export async function fetchCohortHeatmap(): Promise<MisconceptionHeatmapData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/telemetry/heatmap`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[QuantumMind API] Heatmap endpoint unreachable, using local telemetry fallback.');
  }
  return null;
}

/** Ask AI Mentor (Gemini with multilingual regional support) */
export async function askMentorBackend(params: {
  question: string;
  language: string;
  student_level?: string;
  circuit_context?: string;
  current_concept?: string;
}): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/mentor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: params.question,
        language: params.language,
        circuitContext: params.circuit_context ? { summary: params.circuit_context } : null,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      return data.reply;
    }
  } catch (err) {
    console.warn('[QuantumMind API] AI Mentor backend unreachable, using embedded pedagogical response.');
  }
  return null;
}

/** Save circuit to cloud */
export async function saveCircuitToCloud(data: {
  title: string;
  description?: string;
  num_qubits: number;
  num_steps?: number;
  circuit_data: any;
}): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/circuits/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        numQubits: data.num_qubits,
        numSteps: data.num_steps || 6,
        gates: data.circuit_data?.gates || [],
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const resData = await res.json();
      return resData.circuitId;
    }
  } catch (err) {
    console.warn('[QuantumMind API] Cloud circuit persistence unreachable.');
  }
  return null;
}

/** Load circuit by short ID */
export async function loadCircuitFromCloud(circuitId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/circuits/${circuitId}`, {
      method: 'GET',
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    return null;
  }
}
