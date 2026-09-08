import { CircuitGate, DebugChallenge } from './types';

/**
 * Generates IBM Qiskit 1.0+ Python code from circuit
 */
export function generateQiskitCode(numQubits: number, gates: CircuitGate[]): string {
  const sortedGates = [...gates].sort((a, b) => a.step - b.step);
  const lines: string[] = [
    '# Generated with Quantum Composer - IBM Qiskit SDK',
    'from qiskit import QuantumCircuit, transpile',
    'from qiskit_aer import AerSimulator',
    'import numpy as np',
    '',
    `# Initialize Quantum Circuit with ${numQubits} qubits`,
    `qc = QuantumCircuit(${numQubits}, ${numQubits})`,
    ''
  ];

  for (const gate of sortedGates) {
    const q = gate.qubit;
    switch (gate.type) {
      case 'H':
        lines.push(`qc.h(${q})`);
        break;
      case 'X':
        lines.push(`qc.x(${q})`);
        break;
      case 'Y':
        lines.push(`qc.y(${q})`);
        break;
      case 'Z':
        lines.push(`qc.z(${q})`);
        break;
      case 'S':
        lines.push(`qc.s(${q})`);
        break;
      case 'T':
        lines.push(`qc.t(${q})`);
        break;
      case 'RX':
        lines.push(`qc.rx(${gate.angle ? gate.angle.toFixed(4) : 'np.pi/2'}, ${q})`);
        break;
      case 'RY':
        lines.push(`qc.ry(${gate.angle ? gate.angle.toFixed(4) : 'np.pi/2'}, ${q})`);
        break;
      case 'RZ':
        lines.push(`qc.rz(${gate.angle ? gate.angle.toFixed(4) : 'np.pi/2'}, ${q})`);
        break;
      case 'CNOT':
        lines.push(`qc.cx(${gate.controlQubit ?? 0}, ${q})`);
        break;
      case 'CZ':
        lines.push(`qc.cz(${gate.controlQubit ?? 0}, ${q})`);
        break;
      case 'SWAP':
        lines.push(`qc.swap(${q}, ${gate.targetQubit ?? (q + 1)})`);
        break;
      case 'M':
        lines.push(`qc.measure(${q}, ${q})`);
        break;
    }
  }

  lines.push('');
  lines.push('# Simulate circuit with Qiskit Aer');
  lines.push('simulator = AerSimulator()');
  lines.push('compiled_circuit = transpile(qc, simulator)');
  lines.push('job = simulator.run(compiled_circuit, shots=1024)');
  lines.push('result = job.result()');
  lines.push('counts = result.get_counts()');
  lines.push('print("Measurement Results:", counts)');

  return lines.join('\n');
}

/**
 * Generates Google Cirq Python code
 */
export function generateCirqCode(numQubits: number, gates: CircuitGate[]): string {
  const sortedGates = [...gates].sort((a, b) => a.step - b.step);
  const lines: string[] = [
    '# Generated with Quantum Composer - Google Cirq SDK',
    'import cirq',
    'import numpy as np',
    '',
    `# Create qubits`,
    `qubits = [cirq.LineQubit(i) for i in range(${numQubits})]`,
    'circuit = cirq.Circuit()',
    ''
  ];

  for (const gate of sortedGates) {
    const q = gate.qubit;
    switch (gate.type) {
      case 'H':
        lines.push(`circuit.append(cirq.H(qubits[${q}]))`);
        break;
      case 'X':
        lines.push(`circuit.append(cirq.X(qubits[${q}]))`);
        break;
      case 'Y':
        lines.push(`circuit.append(cirq.Y(qubits[${q}]))`);
        break;
      case 'Z':
        lines.push(`circuit.append(cirq.Z(qubits[${q}]))`);
        break;
      case 'S':
        lines.push(`circuit.append(cirq.S(qubits[${q}]))`);
        break;
      case 'T':
        lines.push(`circuit.append(cirq.T(qubits[${q}]))`);
        break;
      case 'RX':
        lines.push(`circuit.append(cirq.rx(${gate.angle ? gate.angle.toFixed(4) : 'np.pi/2'})(qubits[${q}]))`);
        break;
      case 'RY':
        lines.push(`circuit.append(cirq.ry(${gate.angle ? gate.angle.toFixed(4) : 'np.pi/2'})(qubits[${q}]))`);
        break;
      case 'RZ':
        lines.push(`circuit.append(cirq.rz(${gate.angle ? gate.angle.toFixed(4) : 'np.pi/2'})(qubits[${q}]))`);
        break;
      case 'CNOT':
        lines.push(`circuit.append(cirq.CNOT(qubits[${gate.controlQubit ?? 0}], qubits[${q}]))`);
        break;
      case 'CZ':
        lines.push(`circuit.append(cirq.CZ(qubits[${gate.controlQubit ?? 0}], qubits[${q}]))`);
        break;
      case 'SWAP':
        lines.push(`circuit.append(cirq.SWAP(qubits[${q}], qubits[${gate.targetQubit ?? (q + 1)}]))`);
        break;
      case 'M':
        lines.push(`circuit.append(cirq.measure(qubits[${q}], key='m${q}'))`);
        break;
    }
  }

  lines.push('');
  lines.push('# Simulate on Cirq Simulator');
  lines.push('sim = cirq.Simulator()');
  lines.push('result = sim.run(circuit, repetitions=1024)');
  lines.push('print("Cirq Circuit Execution Result:")');
  lines.push('print(result)');

  return lines.join('\n');
}

/**
 * Generates OpenQASM 3.0 code
 */
export function generateOpenQASM(numQubits: number, gates: CircuitGate[]): string {
  const sortedGates = [...gates].sort((a, b) => a.step - b.step);
  const lines: string[] = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    '',
    `qubit[${numQubits}] q;`,
    `bit[${numQubits}] c;`,
    ''
  ];

  for (const gate of sortedGates) {
    const q = gate.qubit;
    switch (gate.type) {
      case 'H':
        lines.push(`h q[${q}];`);
        break;
      case 'X':
        lines.push(`x q[${q}];`);
        break;
      case 'Y':
        lines.push(`y q[${q}];`);
        break;
      case 'Z':
        lines.push(`z q[${q}];`);
        break;
      case 'S':
        lines.push(`s q[${q}];`);
        break;
      case 'T':
        lines.push(`t q[${q}];`);
        break;
      case 'RX':
        lines.push(`rx(${gate.angle ? gate.angle.toFixed(4) : 'pi/2'}) q[${q}];`);
        break;
      case 'RY':
        lines.push(`ry(${gate.angle ? gate.angle.toFixed(4) : 'pi/2'}) q[${q}];`);
        break;
      case 'RZ':
        lines.push(`rz(${gate.angle ? gate.angle.toFixed(4) : 'pi/2'}) q[${q}];`);
        break;
      case 'CNOT':
        lines.push(`cx q[${gate.controlQubit ?? 0}], q[${q}];`);
        break;
      case 'CZ':
        lines.push(`cz q[${gate.controlQubit ?? 0}], q[${q}];`);
        break;
      case 'SWAP':
        lines.push(`swap q[${q}], q[${gate.targetQubit ?? (q + 1)}];`);
        break;
      case 'M':
        lines.push(`c[${q}] = measure q[${q}];`);
        break;
    }
  }

  return lines.join('\n');
}

/**
 * Pre-built Educational Algorithm Presets
 */
export const PRESET_ALGORITHMS = [
  {
    id: 'bell-state',
    title: 'Bell State (|Φ⁺⟩)',
    description: 'Creates maximally entangled Einstein-Podolsky-Rosen (EPR) state: (|00⟩ + |11⟩)/√2.',
    numQubits: 2,
    numSteps: 4,
    gates: [
      { id: 'b1', type: 'H', step: 0, qubit: 0 },
      { id: 'b2', type: 'CNOT', step: 1, qubit: 1, controlQubit: 0 }
    ] as CircuitGate[]
  },
  {
    id: 'ghz-state',
    title: 'GHZ 3-Qubit Entanglement',
    description: 'Greenberger–Horne–Zeilinger state: (|000⟩ + |111⟩)/√2 demonstrating non-local tripartite entanglement.',
    numQubits: 3,
    numSteps: 5,
    gates: [
      { id: 'g1', type: 'H', step: 0, qubit: 0 },
      { id: 'g2', type: 'CNOT', step: 1, qubit: 1, controlQubit: 0 },
      { id: 'g3', type: 'CNOT', step: 2, qubit: 2, controlQubit: 1 }
    ] as CircuitGate[]
  },
  {
    id: 'superdense-coding',
    title: 'Superdense Coding',
    description: 'Transmits 2 classical bits (here "11") using only 1 transmitted entangled qubit.',
    numQubits: 2,
    numSteps: 6,
    gates: [
      { id: 's1', type: 'H', step: 0, qubit: 0 },
      { id: 's2', type: 'CNOT', step: 1, qubit: 1, controlQubit: 0 },
      // Alice encodes message "11": applies Z then X
      { id: 's3', type: 'Z', step: 2, qubit: 0 },
      { id: 's4', type: 'X', step: 3, qubit: 0 },
      // Bob decodes with CNOT and H
      { id: 's5', type: 'CNOT', step: 4, qubit: 1, controlQubit: 0 },
      { id: 's6', type: 'H', step: 5, qubit: 0 }
    ] as CircuitGate[]
  },
  {
    id: 'deutsch-algorithm',
    title: 'Deutsch’s Algorithm (Oracle Test)',
    description: 'Determines whether a 1-bit boolean function f(x) is constant or balanced in a single quantum evaluation.',
    numQubits: 2,
    numSteps: 6,
    gates: [
      { id: 'd1', type: 'X', step: 0, qubit: 1 },
      { id: 'd2', type: 'H', step: 1, qubit: 0 },
      { id: 'd3', type: 'H', step: 1, qubit: 1 },
      // Oracle: Balanced function f(x) = x (CNOT)
      { id: 'd4', type: 'CNOT', step: 2, qubit: 1, controlQubit: 0 },
      { id: 'd5', type: 'H', step: 3, qubit: 0 }
    ] as CircuitGate[]
  },
  {
    id: 'quantum-teleportation',
    title: 'Quantum Teleportation Protocol',
    description: 'Teleports an unknown quantum state |ψ⟩ from Alice (q0) to Bob (q2) via an entangled EPR link (q1, q2).',
    numQubits: 3,
    numSteps: 6,
    gates: [
      // State preparation on q0 (e.g. Rx)
      { id: 't1', type: 'H', step: 0, qubit: 0 },
      // Shared Bell pair between q1 and q2
      { id: 't2', type: 'H', step: 0, qubit: 1 },
      { id: 't3', type: 'CNOT', step: 1, qubit: 2, controlQubit: 1 },
      // Alice Bell measurement on q0, q1
      { id: 't4', type: 'CNOT', step: 2, qubit: 1, controlQubit: 0 },
      { id: 't5', type: 'H', step: 3, qubit: 0 }
    ] as CircuitGate[]
  }
];

/**
 * Pre-built Circuit Debugging Sandbox Challenges
 */
export const DEBUG_CHALLENGES: DebugChallenge[] = [
  {
    id: 'broken-bell',
    title: 'Challenge 1: The Inverted Entangler',
    difficulty: 'Beginner',
    category: 'Entanglement Mechanics',
    story: 'Your teammate intended to generate the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2, but the circuit output produces unexpected classical correlation!',
    objective: 'Inspect the faulty circuit and repair it so that the state evolves into a true Bell state (|00⟩ + |11⟩)/√2.',
    faultyCircuit: {
      numQubits: 2,
      gates: [
        { type: 'X', step: 0, qubit: 0 },
        { type: 'H', step: 0, qubit: 1 },
        { type: 'CNOT', step: 1, qubit: 0, controlQubit: 1 }
      ]
    },
    expectedOutput: {
      targetState: '0.707|00⟩ + 0.707|11⟩',
      expectedProbabilities: { '00': 0.5, '11': 0.5 },
      description: 'Equal 50% chance of |00⟩ and |11⟩, with zero probability of |01⟩ or |10⟩.'
    },
    hints: [
      'Bell state generation requires an initial Hadamard gate on wire q0 and a CNOT with control on q0 and target on q1.',
      'Check if there is an unnecessary Pauli-X gate biasing qubit 0.'
    ],
    solutionExplanation: 'By removing the extraneous X gate and placing the Hadamard gate on q0 followed by CX(control=0, target=1), the initial state |00⟩ undergoes |00⟩ → (|0⟩+|1⟩)|0⟩/√2 → (|00⟩+|11⟩)/√2.'
  },
  {
    id: 'superposition-collapse',
    title: 'Challenge 2: Premature Wavefunction Collapse',
    difficulty: 'Intermediate',
    category: 'Measurement Axioms',
    story: 'The circuit was designed to create an equal superposition across 2 qubits (|++⟩ = (|00⟩+|01⟩+|10⟩+|11⟩)/2), but someone placed a measurement gate midway, collapsing the quantum coherence!',
    objective: 'Remove or reposition the measurement so that all 4 basis states (|00⟩, |01⟩, |10⟩, |11⟩) have an exact 25% probability.',
    faultyCircuit: {
      numQubits: 2,
      gates: [
        { type: 'H', step: 0, qubit: 0 },
        { type: 'M', step: 1, qubit: 0 },
        { type: 'H', step: 2, qubit: 1 }
      ]
    },
    expectedOutput: {
      targetState: '0.5|00⟩ + 0.5|01⟩ + 0.5|10⟩ + 0.5|11⟩',
      expectedProbabilities: { '00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25 },
      description: 'Equal 25% probability across all four computational basis states.'
    },
    hints: [
      'Measurement irreversibly collapses the superposition of qubit 0 before the algorithm concludes.',
      'Both qubits need Hadamard gates without mid-circuit measurement.'
    ],
    solutionExplanation: 'In quantum algorithms, premature measurement destroys quantum phase and coherence. Removing the intermediate M gate preserves the 2-qubit uniform superposition.'
  },
  {
    id: 'phase-flip-mystery',
    title: 'Challenge 3: The Phase Flip Puzzle',
    difficulty: 'Intermediate',
    category: 'Phase Dynamics',
    story: 'We need to transform the state |+⟩ into |-⟩ on qubit 0. The current circuit erroneously applies an X gate instead of the proper phase operator.',
    objective: 'Transform qubit 0 from |0⟩ into |-⟩ = (|0⟩ - |1⟩)/√2.',
    faultyCircuit: {
      numQubits: 1,
      gates: [
        { type: 'H', step: 0, qubit: 0 },
        { type: 'X', step: 1, qubit: 0 }
      ]
    },
    expectedOutput: {
      targetState: '0.707|0⟩ - 0.707|1⟩',
      description: 'Qubit 0 is in the |-⟩ state pointing towards -X on the Bloch Sphere.'
    },
    hints: [
      'Applying X to |+⟩ leaves |+⟩ unchanged because |+⟩ is an eigenstate of the Pauli-X operator (X|+⟩ = |+⟩)!',
      'To switch relative phase between amplitudes, you need a Pauli-Z gate.'
    ],
    solutionExplanation: 'Learners commonly confuse bit-flips with phase-flips. Since X|+⟩ = |+⟩, applying X has zero effect! Applying Z to |+⟩ = (|0⟩+|1⟩)/√2 results in (|0⟩-|1⟩)/√2 = |-⟩.'
  },
  {
    id: 'ghz-broken-chain',
    title: 'Challenge 4: Fractured GHZ Entanglement',
    difficulty: 'Advanced',
    category: 'Multi-qubit Entanglement',
    story: 'We want to construct a 3-qubit GHZ state (|000⟩ + |111⟩)/√2, but qubit 2 remains unentangled due to a misplaced control wire.',
    objective: 'Chain the entanglement so that measuring qubit 0 guarantees all 3 qubits collapse to the same value (000 or 111 with 50% each).',
    faultyCircuit: {
      numQubits: 3,
      gates: [
        { type: 'H', step: 0, qubit: 0 },
        { type: 'CNOT', step: 1, qubit: 1, controlQubit: 0 },
        { type: 'H', step: 2, qubit: 2 }
      ]
    },
    expectedOutput: {
      targetState: '0.707|000⟩ + 0.707|111⟩',
      expectedProbabilities: { '000': 0.5, '111': 0.5 },
      description: 'GHZ state where 000 and 111 each have 50% probability, and no other states occur.'
    },
    hints: [
      'Applying a standalone Hadamard on qubit 2 creates a separable superposition instead of entangling it with the pair.',
      'Use a CNOT gate controlled by qubit 1 (or qubit 0) targeting qubit 2.'
    ],
    solutionExplanation: 'To extend entanglement from 2 qubits to 3, cascade CNOT gates: H(q0), CX(0→1), and CX(1→2).'
  },
  {
    id: 'deutsch-kickback',
    title: 'Challenge 5: Phase Kickback Oracle',
    difficulty: 'Advanced',
    category: 'Oracle Mechanics',
    story: 'In the Deutsch algorithm, the ancilla qubit must be in state |-⟩ = (|0⟩ - |1⟩)/√2 so that evaluating f(x) kicks the negative eigenvalue (-1)^f(x) back onto the query qubit.',
    objective: 'Prepare qubit 1 in the |-⟩ state before the CNOT oracle so that the (-1) phase kicks back into qubit 0.',
    faultyCircuit: {
      numQubits: 2,
      gates: [
        { type: 'H', step: 0, qubit: 0 },
        { type: 'H', step: 0, qubit: 1 },
        { type: 'CNOT', step: 1, qubit: 1, controlQubit: 0 },
        { type: 'H', step: 2, qubit: 0 }
      ]
    },
    expectedOutput: {
      targetState: '|1-⟩ or |-1⟩ correlation',
      description: 'Qubit 0 measured as 1 with 100% certainty (demonstrating balanced function oracle kickback).'
    },
    hints: [
      'Applying H to |0⟩ yields |+⟩, which has eigenvalue (+1). To get eigenvalue (-1), you need |-⟩!',
      'Apply an X gate before the H gate on qubit 1 to prepare |1⟩ → |-⟩.'
    ],
    solutionExplanation: 'Phase kickback requires the target qubit to be an eigenstate of the conditional operator with eigenvalue -1. Since X|-⟩ = -|-⟩, applying X then H initializes qubit 1 as |-⟩, transferring the phase to qubit 0.'
  },
  {
    id: 'bitflip-basis',
    title: 'Challenge 6: Computational Basis Inverter',
    difficulty: 'Beginner',
    category: 'Basic Gates',
    story: 'We want to prepare the 2-qubit state |10⟩ from the initial ground state |00⟩, but the circuit currently inverts the wrong qubit wire.',
    objective: 'Apply the Pauli-X gate strictly to wire q0 so that the output is 100% |10⟩.',
    faultyCircuit: {
      numQubits: 2,
      gates: [
        { type: 'X', step: 0, qubit: 1 }
      ]
    },
    expectedOutput: {
      targetState: '|10⟩ (100% probability on index 2)',
      description: 'Wire q0 is |1⟩ and wire q1 is |0⟩.'
    },
    hints: [
      'In little-endian / standard Dirac order, |10⟩ means qubit 0 is 1 and qubit 1 is 0.',
      'Move the Pauli-X gate from wire q1 to wire q0.'
    ],
    solutionExplanation: 'The Pauli-X operator acts as a quantum bit-flip, mapping |0⟩ → |1⟩. Placing it on wire q0 prepares the targeted basis vector |10⟩.'
  }
];
