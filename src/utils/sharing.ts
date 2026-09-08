import { CircuitGate, GateType } from '../quantum/types';

interface SerializedCircuitPayload {
  q: number; // numQubits
  s: number; // numSteps
  g: Array<{
    t: GateType;
    s: number;
    q: number;
    c?: number;
    tg?: number;
    a?: number;
  }>;
}

/**
 * Encodes the current circuit canvas into a shareable URL hash
 */
export function encodeCircuitToHash(
  numQubits: number,
  numSteps: number,
  gates: CircuitGate[]
): string {
  const payload: SerializedCircuitPayload = {
    q: numQubits,
    s: numSteps,
    g: gates.map(gate => ({
      t: gate.type,
      s: gate.step,
      q: gate.qubit,
      ...(gate.controlQubit !== undefined ? { c: gate.controlQubit } : {}),
      ...(gate.targetQubit !== undefined ? { tg: gate.targetQubit } : {}),
      ...(gate.angle !== undefined ? { a: Number(gate.angle.toFixed(3)) } : {})
    }))
  };

  try {
    const jsonStr = JSON.stringify(payload);
    // URL-safe base64
    const base64 = btoa(encodeURIComponent(jsonStr));
    return `circuit=${base64}`;
  } catch (err) {
    console.error('Failed to encode circuit to hash:', err);
    return '';
  }
}

/**
 * Decodes a circuit payload from the URL hash
 */
export function decodeCircuitFromHash(
  hashString?: string
): { numQubits: number; numSteps: number; gates: CircuitGate[] } | null {
  const hash = hashString || (typeof window !== 'undefined' ? window.location.hash : '');
  if (!hash || !hash.includes('circuit=')) return null;

  try {
    const match = hash.match(/circuit=([^&]+)/);
    if (!match || !match[1]) return null;

    const base64 = match[1];
    const jsonStr = decodeURIComponent(atob(base64));
    const payload: SerializedCircuitPayload = JSON.parse(jsonStr);

    if (!payload || typeof payload.q !== 'number' || !Array.isArray(payload.g)) {
      return null;
    }

    const gates: CircuitGate[] = payload.g.map((item, idx) => ({
      id: `shared_${idx}_${Date.now()}`,
      type: item.t,
      step: item.s,
      qubit: item.q,
      controlQubit: item.c,
      targetQubit: item.tg,
      angle: item.a
    }));

    return {
      numQubits: Math.min(5, Math.max(1, payload.q)),
      numSteps: Math.min(10, Math.max(3, payload.s || 6)),
      gates
    };
  } catch (err) {
    console.warn('Unable to decode shared circuit from URL hash:', err);
    return null;
  }
}

/**
 * Copies the shareable circuit link directly to the clipboard
 */
export async function copyShareableLink(
  numQubits: number,
  numSteps: number,
  gates: CircuitGate[]
): Promise<string> {
  const hashQuery = encodeCircuitToHash(numQubits, numSteps, gates);
  const fullUrl = `${window.location.origin}${window.location.pathname}#${hashQuery}`;

  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(fullUrl);
  } else {
    // Fallback prompt
    prompt('Copy this shareable circuit link:', fullUrl);
  }

  return fullUrl;
}
