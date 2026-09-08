import { Complex } from './complex';
import { getSingleQubitGateMatrix } from './gates';
import { BlochCoords, CircuitGate, QuantumState, SimulationResult } from './types';

export class QuantumSimulator {
  private numQubits: number;

  constructor(numQubits: number = 3) {
    this.numQubits = numQubits;
  }

  setNumQubits(num: number) {
    this.numQubits = Math.max(1, Math.min(6, num));
  }

  /**
   * Run step-by-step simulation over a list of gates organized by time steps
   */
  simulate(numQubits: number, numSteps: number, gates: CircuitGate[]): SimulationResult {
    const dim = 1 << numQubits;
    
    // Initial state |0...0>
    let statevector: Complex[] = new Array(dim).fill(Complex.ZERO);
    statevector[0] = Complex.ONE;

    const stepStates: QuantumState[] = [];

    // Record initial step 0 state
    stepStates.push(this.extractState(statevector, numQubits, 0));

    // Sort gates by step
    for (let step = 0; step < numSteps; step++) {
      const stepGates = gates.filter(g => g.step === step);
      
      for (const gate of stepGates) {
        statevector = this.applyGate(statevector, numQubits, gate);
      }

      stepStates.push(this.extractState(statevector, numQubits, step + 1));
    }

    const finalState = stepStates[stepStates.length - 1];
    const measurementShots = this.sampleShots(finalState.probabilities, numQubits, 1024);

    return {
      stepStates,
      finalState,
      measurementShots,
      totalShots: 1024
    };
  }

  /**
   * Apply an individual gate to the statevector
   */
  private applyGate(state: Complex[], numQubits: number, gate: CircuitGate): Complex[] {
    const nextState = [...state];
    const dim = 1 << numQubits;

    if (gate.type === 'M') {
      // Measurement is represented as probability distribution in statevector,
      // actual collapse happens in shot sampling or prediction comparisons
      return nextState;
    }

    if (gate.type === 'CNOT') {
      const control = gate.controlQubit ?? 0;
      const target = gate.qubit;
      const controlBitMask = 1 << (numQubits - 1 - control);
      const targetBitMask = 1 << (numQubits - 1 - target);

      for (let i = 0; i < dim; i++) {
        // If control bit is 1 and target bit is 0, swap with the state where target bit is 1
        if ((i & controlBitMask) !== 0 && (i & targetBitMask) === 0) {
          const partner = i | targetBitMask;
          const temp = nextState[i];
          nextState[i] = nextState[partner];
          nextState[partner] = temp;
        }
      }
      return nextState;
    }

    if (gate.type === 'CZ') {
      const control = gate.controlQubit ?? 0;
      const target = gate.qubit;
      const controlBitMask = 1 << (numQubits - 1 - control);
      const targetBitMask = 1 << (numQubits - 1 - target);

      for (let i = 0; i < dim; i++) {
        if ((i & controlBitMask) !== 0 && (i & targetBitMask) !== 0) {
          nextState[i] = nextState[i].scale(-1);
        }
      }
      return nextState;
    }

    if (gate.type === 'SWAP') {
      const q1 = gate.qubit;
      const q2 = gate.targetQubit ?? (q1 + 1);
      const mask1 = 1 << (numQubits - 1 - q1);
      const mask2 = 1 << (numQubits - 1 - q2);

      for (let i = 0; i < dim; i++) {
        const bit1 = (i & mask1) !== 0;
        const bit2 = (i & mask2) !== 0;
        if (bit1 && !bit2) {
          const partner = (i ^ mask1) | mask2;
          const temp = nextState[i];
          nextState[i] = nextState[partner];
          nextState[partner] = temp;
        }
      }
      return nextState;
    }

    // Single-qubit unitary transformation
    const targetQubit = gate.qubit;
    const targetBitMask = 1 << (numQubits - 1 - targetQubit);
    const [u00, u01, u10, u11] = getSingleQubitGateMatrix(gate.type, gate.angle);

    for (let i = 0; i < dim; i++) {
      if ((i & targetBitMask) === 0) {
        const i0 = i;
        const i1 = i | targetBitMask;
        const psi0 = state[i0];
        const psi1 = state[i1];

        // psi0' = u00*psi0 + u01*psi1
        // psi1' = u10*psi0 + u11*psi1
        nextState[i0] = u00.mul(psi0).add(u01.mul(psi1));
        nextState[i1] = u10.mul(psi0).add(u11.mul(psi1));
      }
    }

    return nextState;
  }

  /**
   * Extract statevector, probabilities, Bloch coordinates, and Dirac notation
   */
  private extractState(statevector: Complex[], numQubits: number, stepIndex: number): QuantumState {
    const dim = 1 << numQubits;
    const probabilities = statevector.map(c => c.magnitudeSquared());

    // Single-qubit Bloch coordinates via partial trace density matrix
    const blochCoords: Record<number, BlochCoords> = {};
    for (let q = 0; q < numQubits; q++) {
      blochCoords[q] = this.computeBlochCoords(statevector, numQubits, q);
    }

    // Check entanglement (if any single-qubit Bloch vector magnitude < 0.95 and multiple non-zero basis states)
    let isEntangled = false;
    if (numQubits > 1) {
      for (let q = 0; q < numQubits; q++) {
        if (!blochCoords[q].pure) {
          isEntangled = true;
          break;
        }
      }
    }

    const diracRepresentation = this.generateDiracNotation(statevector, numQubits);

    return {
      statevector,
      probabilities,
      blochCoords,
      diracRepresentation,
      isEntangled,
      stepIndex
    };
  }

  /**
   * Calculate reduced density matrix and Bloch vector for qubit q
   */
  private computeBlochCoords(statevector: Complex[], numQubits: number, targetQubit: number): BlochCoords {
    const dim = 1 << numQubits;
    const mask = 1 << (numQubits - 1 - targetQubit);

    let rho00 = 0;
    let rho11 = 0;
    let rho01_re = 0;
    let rho01_im = 0;

    for (let i = 0; i < dim; i++) {
      if ((i & mask) === 0) {
        const j = i | mask;
        const psi0 = statevector[i];
        const psi1 = statevector[j];

        rho00 += psi0.magnitudeSquared();
        rho11 += psi1.magnitudeSquared();

        // psi0 * psi1^*
        const term = psi0.mul(psi1.conj());
        rho01_re += term.re;
        rho01_im += term.im;
      }
    }

    // Bloch vector components:
    // X = 2 * Re(rho01)
    // Y = -2 * Im(rho01) [or 2*Im depending on Pauli definition: sigma_y = [[0, -i], [i, 0]] => Tr(rho*sigma_y) = 2*Im(rho10) = -2*Im(rho01)]
    // Z = rho00 - rho11
    let x = 2 * rho01_re;
    let y = 2 * rho01_im;
    let z = rho00 - rho11;

    // Numerical cleanup
    if (Math.abs(x) < 1e-5) x = 0;
    if (Math.abs(y) < 1e-5) y = 0;
    if (Math.abs(z) < 1e-5) z = 0;

    const r = Math.sqrt(x * x + y * y + z * z);
    const pure = r >= 0.98;

    // Normalizing for sphere projection
    const normX = r > 0.001 ? x / r : 0;
    const normY = r > 0.001 ? y / r : 0;
    const normZ = r > 0.001 ? z / r : 1;

    const theta = Math.acos(Math.max(-1, Math.min(1, normZ)));
    let phi = Math.atan2(normY, normX);
    if (phi < 0) phi += 2 * Math.PI;

    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      z: Number(z.toFixed(3)),
      theta,
      phi,
      pure
    };
  }

  /**
   * Generates Dirac bra-ket string: e.g. "0.707|00⟩ + 0.707|11⟩"
   */
  private generateDiracNotation(statevector: Complex[], numQubits: number): string {
    const terms: string[] = [];
    const dim = 1 << numQubits;

    for (let i = 0; i < dim; i++) {
      const magSq = statevector[i].magnitudeSquared();
      if (magSq > 0.0001) {
        const bin = i.toString(2).padStart(numQubits, '0');
        const amp = statevector[i];
        const formattedAmp = this.formatAmplitude(amp);
        terms.push(`${formattedAmp}|${bin}⟩`);
      }
    }

    return terms.length > 0 ? terms.join(' + ').replace(/\+\s*-/g, '- ') : '|0...0⟩';
  }

  private formatAmplitude(amp: Complex): string {
    // Check known quantum amplitudes
    const mag = amp.magnitude();
    const isClose = (val: number, target: number) => Math.abs(val - target) < 0.015;

    if (isClose(mag, 1)) {
      if (isClose(amp.re, 1)) return '';
      if (isClose(amp.re, -1)) return '-';
      if (isClose(amp.im, 1)) return 'i ';
      if (isClose(amp.im, -1)) return '-i ';
    }
    if (isClose(mag, Math.SQRT1_2)) {
      if (isClose(amp.re, Math.SQRT1_2)) return '1/√2 ';
      if (isClose(amp.re, -Math.SQRT1_2)) return '-1/√2 ';
      if (isClose(amp.im, Math.SQRT1_2)) return 'i/√2 ';
      if (isClose(amp.im, -Math.SQRT1_2)) return '-i/√2 ';
    }
    if (isClose(mag, 0.5)) {
      if (isClose(amp.re, 0.5)) return '1/2 ';
      if (isClose(amp.re, -0.5)) return '-1/2 ';
    }

    return `${amp.format(2)} `;
  }

  /**
   * Sample measurement shots from probability distribution
   */
  private sampleShots(probabilities: number[], numQubits: number, shots: number): Record<string, number> {
    const counts: Record<string, number> = {};
    const dim = 1 << numQubits;

    // Cumulative distribution
    const cdf: number[] = new Array(dim);
    let cum = 0;
    for (let i = 0; i < dim; i++) {
      cum += probabilities[i];
      cdf[i] = cum;
    }

    for (let s = 0; s < shots; s++) {
      const r = Math.random();
      let outcome = 0;
      for (let i = 0; i < dim; i++) {
        if (r <= cdf[i]) {
          outcome = i;
          break;
        }
      }
      const bitstring = outcome.toString(2).padStart(numQubits, '0');
      counts[bitstring] = (counts[bitstring] || 0) + 1;
    }

    return counts;
  }
}
