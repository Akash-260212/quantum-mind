import { Complex } from './complex';
import { GateInfo, GateType } from './types';

const SQRT1_2 = Math.SQRT1_2;

export const GATE_REGISTRY: Record<GateType, GateInfo> = {
  H: {
    type: 'H',
    name: 'Hadamard',
    symbol: 'Hadamard',
    category: 'superposition',
    description: 'Creates equal superposition: turns definite states |0⟩ or |1⟩ into an equal 50/50 probability mixture (|0⟩±|1⟩)/√2.',
    matrixLatex: '1/√2 [[1, 1], [1, -1]]',
    numQubits: 1,
    color: 'bg-[#007d79] text-white border-[#005d5d]',
    borderColor: 'border-[#005d5d]',
    glowColor: 'rgba(0, 125, 121, 0.2)'
  },
  X: {
    type: 'X',
    name: 'Pauli-X (NOT)',
    symbol: 'NOT (X)',
    category: 'pauli',
    description: 'Quantum bit-flip: inverts |0⟩ to |1⟩ and |1⟩ to |0⟩. Rotates the statevector by 180° around the X-axis.',
    matrixLatex: '[[0, 1], [1, 0]]',
    numQubits: 1,
    color: 'bg-[#da1e28] text-white border-[#ba1b23]',
    borderColor: 'border-[#ba1b23]',
    glowColor: 'rgba(218, 30, 40, 0.2)'
  },
  Y: {
    type: 'Y',
    name: 'Pauli-Y',
    symbol: 'Pauli-Y',
    category: 'pauli',
    description: 'Combined bit and phase flip: maps |0⟩ → i|1⟩ and |1⟩ → -i|0⟩. Rotates 180° around the Y-axis.',
    matrixLatex: '[[0, -i], [i, 0]]',
    numQubits: 1,
    color: 'bg-[#8a3ffc] text-white border-[#6929c4]',
    borderColor: 'border-[#6929c4]',
    glowColor: 'rgba(138, 63, 252, 0.2)'
  },
  Z: {
    type: 'Z',
    name: 'Pauli-Z',
    symbol: 'Phase (Z)',
    category: 'pauli',
    description: 'Phase-flip: leaves |0⟩ untouched and multiplies |1⟩ by -1. Inverts the relative phase |+⟩ ↔ |-⟩.',
    matrixLatex: '[[1, 0], [0, -1]]',
    numQubits: 1,
    color: 'bg-[#0f62fe] text-white border-[#0043ce]',
    borderColor: 'border-[#0043ce]',
    glowColor: 'rgba(15, 98, 254, 0.2)'
  },
  S: {
    type: 'S',
    name: 'Phase Gate (S)',
    symbol: 'S-Phase',
    category: 'phase',
    description: 'Quarter-turn phase shift: applies a 90° (π/2) relative phase to |1⟩. Two S gates equal a Z gate (SS = Z).',
    matrixLatex: '[[1, 0], [0, i]]',
    numQubits: 1,
    color: 'bg-[#6929c4] text-white border-[#491d8b]',
    borderColor: 'border-[#491d8b]',
    glowColor: 'rgba(105, 41, 196, 0.2)'
  },
  T: {
    type: 'T',
    name: 'T-Gate (π/8)',
    symbol: 'T-Gate',
    category: 'phase',
    description: 'Eighth-turn phase shift: applies a 45° (π/4) phase to |1⟩. Essential for universal quantum fault tolerance.',
    matrixLatex: '[[1, 0], [0, e^(iπ/4)]]',
    numQubits: 1,
    color: 'bg-[#491d8b] text-white border-[#31135e]',
    borderColor: 'border-[#31135e]',
    glowColor: 'rgba(73, 29, 139, 0.2)'
  },
  RX: {
    type: 'RX',
    name: 'Rotation-X',
    symbol: 'Rot-X',
    category: 'rotation',
    description: 'Rotates the single-qubit statevector around the X-axis by a tunable angle θ.',
    matrixLatex: '[[cos(θ/2), -i sin(θ/2)], [-i sin(θ/2), cos(θ/2)]]',
    numQubits: 1,
    hasAngleParam: true,
    color: 'bg-[#198038] text-white border-[#0e6027]',
    borderColor: 'border-[#0e6027]',
    glowColor: 'rgba(25, 128, 56, 0.2)'
  },
  RY: {
    type: 'RY',
    name: 'Rotation-Y',
    symbol: 'Rot-Y',
    category: 'rotation',
    description: 'Rotates around the Y-axis by angle θ, adjusting the relative probability weights without imaginary phase.',
    matrixLatex: '[[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]',
    numQubits: 1,
    hasAngleParam: true,
    color: 'bg-[#0e6027] text-white border-[#044317]',
    borderColor: 'border-[#044317]',
    glowColor: 'rgba(14, 96, 39, 0.2)'
  },
  RZ: {
    type: 'RZ',
    name: 'Rotation-Z',
    symbol: 'Rot-Z',
    category: 'rotation',
    description: 'Rotates around the Z-axis by angle θ, tuning the quantum phase angle in the complex plane.',
    matrixLatex: '[[e^(-iθ/2), 0], [0, e^(iθ/2)]]',
    numQubits: 1,
    hasAngleParam: true,
    color: 'bg-[#0043ce] text-white border-[#002d9c]',
    borderColor: 'border-[#002d9c]',
    glowColor: 'rgba(0, 67, 206, 0.2)'
  },
  CNOT: {
    type: 'CNOT',
    name: 'Controlled-NOT (CX)',
    symbol: 'CNOT',
    category: 'entanglement',
    description: 'Flips target qubit if control qubit is |1⟩. Foundational 2-qubit entangler used to generate Bell states.',
    matrixLatex: '[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]',
    numQubits: 2,
    color: 'bg-[#002d9c] text-white border-[#001d6c]',
    borderColor: 'border-[#001d6c]',
    glowColor: 'rgba(0, 45, 156, 0.2)'
  },
  CZ: {
    type: 'CZ',
    name: 'Controlled-Z',
    symbol: 'CZ',
    category: 'entanglement',
    description: 'Inverts target phase (-1) only when both control and target qubits are in state |1⟩.',
    matrixLatex: 'diag(1, 1, 1, -1)',
    numQubits: 2,
    color: 'bg-[#0f62fe] text-white border-[#0043ce]',
    borderColor: 'border-[#0043ce]',
    glowColor: 'rgba(15, 98, 254, 0.2)'
  },
  SWAP: {
    type: 'SWAP',
    name: 'Swap Gate',
    symbol: 'SWAP',
    category: 'entanglement',
    description: 'Exchanges the full quantum state between two qubits: |a, b⟩ → |b, a⟩.',
    matrixLatex: '[[1,0,0,0], [0,0,1,0], [0,1,0,0], [0,0,0,1]]',
    numQubits: 2,
    color: 'bg-[#0072c3] text-white border-[#00539a]',
    borderColor: 'border-[#00539a]',
    glowColor: 'rgba(0, 114, 195, 0.2)'
  },
  M: {
    type: 'M',
    name: 'Measurement',
    symbol: 'Measure',
    category: 'measurement',
    description: 'Collapses the quantum superposition into a classical bit 0 or 1 with probability equal to amplitude squared |α|².',
    matrixLatex: 'P_0 = |0⟩⟨0|, P_1 = |1⟩⟨1|',
    numQubits: 1,
    color: 'bg-[#475569] text-white border-[#334155]',
    borderColor: 'border-[#334155]',
    glowColor: 'rgba(71, 85, 105, 0.2)'
  }
};

export function getSingleQubitGateMatrix(type: GateType, angle: number = Math.PI / 2): [Complex, Complex, Complex, Complex] {
  switch (type) {
    case 'H':
      return [
        new Complex(SQRT1_2, 0), new Complex(SQRT1_2, 0),
        new Complex(SQRT1_2, 0), new Complex(-SQRT1_2, 0)
      ];
    case 'X':
      return [
        Complex.ZERO, Complex.ONE,
        Complex.ONE, Complex.ZERO
      ];
    case 'Y':
      return [
        Complex.ZERO, new Complex(0, -1),
        new Complex(0, 1), Complex.ZERO
      ];
    case 'Z':
      return [
        Complex.ONE, Complex.ZERO,
        Complex.ZERO, new Complex(-1, 0)
      ];
    case 'S':
      return [
        Complex.ONE, Complex.ZERO,
        Complex.ZERO, new Complex(0, 1)
      ];
    case 'T':
      return [
        Complex.ONE, Complex.ZERO,
        Complex.ZERO, new Complex(SQRT1_2, SQRT1_2)
      ];
    case 'RX': {
      const half = angle / 2;
      return [
        new Complex(Math.cos(half), 0), new Complex(0, -Math.sin(half)),
        new Complex(0, -Math.sin(half)), new Complex(Math.cos(half), 0)
      ];
    }
    case 'RY': {
      const half = angle / 2;
      return [
        new Complex(Math.cos(half), 0), new Complex(-Math.sin(half), 0),
        new Complex(Math.sin(half), 0), new Complex(Math.cos(half), 0)
      ];
    }
    case 'RZ': {
      const half = angle / 2;
      return [
        new Complex(Math.cos(-half), Math.sin(-half)), Complex.ZERO,
        Complex.ZERO, new Complex(Math.cos(half), Math.sin(half))
      ];
    }
    default:
      return [
        Complex.ONE, Complex.ZERO,
        Complex.ZERO, Complex.ONE
      ];
  }
}
