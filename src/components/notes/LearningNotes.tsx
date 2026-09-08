import React, { useState } from 'react';
import { sounds } from '../../utils/audio';
import {
  BookOpen,
  Sparkles,
  Layers,
  Compass,
  Zap,
  Activity,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export const LearningNotes: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('qubit');

  const topics = [
    { id: 'qubit', title: '1. What is a Qubit?', icon: '⚛️' },
    { id: 'superposition', title: '2. Superposition & Interference', icon: '🌀' },
    { id: 'entanglement', title: '3. Quantum Entanglement', icon: '🔗' },
    { id: 'measurement', title: '4. Measurement & Collapse', icon: '📏' },
    { id: 'gates', title: '5. Quantum Gates Matrix Guide', icon: '🎛️' }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full py-2">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0f62fe]" />
            <span className="text-xs uppercase tracking-widest text-[#0f62fe] font-mono font-bold">
              Visual Quantum Curriculum
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Quantum Computing Notes & Visual Guides</h1>
          <p className="text-xs text-slate-600 mt-1">
            Intuitive diagrams and explanations breaking down quantum mechanics without confusing jargon.
          </p>
        </div>

        {/* Topic Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => { sounds.playClick(); setActiveSection(t.id); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === t.id
                  ? 'bg-white text-[#0f62fe] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TOPIC 1: WHAT IS A QUBIT? */}
      {activeSection === 'qubit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Visual Diagram Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-[#0f62fe] font-mono uppercase">Concept Diagram</span>
              <h2 className="text-lg font-bold text-slate-900 mt-1 mb-4">Classical Bit vs. Quantum Qubit</h2>

              {/* SVG Comparison Diagram */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* Classical Bit */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-400 bg-white flex items-center justify-center font-mono font-bold text-2xl text-slate-700 shadow-sm">
                    0 or 1
                  </div>
                  <span className="font-bold text-slate-800 text-xs">Classical Bit</span>
                  <span className="text-[11px] text-slate-500 max-w-[130px]">
                    Binary switch: Must be definitively 0 or 1 at any moment.
                  </span>
                </div>

                <div className="text-slate-300 font-bold text-xl hidden sm:block">VS</div>

                {/* Quantum Qubit */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-24 h-24 rounded-full border-4 border-[#0f62fe] bg-blue-50/50 flex flex-col items-center justify-center font-mono font-bold text-xs text-[#0f62fe] shadow-sm relative">
                    <span className="text-slate-900">|0⟩ (North)</span>
                    <div className="w-12 h-0.5 bg-[#0f62fe] my-1" />
                    <span className="text-slate-900">|1⟩ (South)</span>
                    <span className="absolute text-[9px] bg-blue-600 text-white px-1 rounded-full -bottom-2 font-mono">
                      |ψ⟩ = α|0⟩ + β|1⟩
                    </span>
                  </div>
                  <span className="font-bold text-[#0f62fe] text-xs">Quantum Qubit</span>
                  <span className="text-[11px] text-slate-500 max-w-[140px]">
                    Superposition: Any point on the continuous 3D Bloch sphere.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-slate-700">
              💡 <strong>Key Intuition:</strong> While 2 classical bits can hold only 1 of 4 values (00, 01, 10, or 11) at a time, 2 qubits can represent all 4 combinations simultaneously!
            </div>
          </div>

          {/* Explanation Notes */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">Understanding Quantum Superposition</h3>
            <p>
              In classical computing, the fundamental unit of information is the <strong>bit</strong>, physically implemented as a voltage state in a transistor (high = 1, low = 0).
            </p>
            <p>
              A <strong>quantum bit (qubit)</strong> is a two-level quantum mechanical system (such as the spin of an electron or energy levels in a superconducting circuit).
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-center font-bold">
              |ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1
            </div>

            <ul className="flex flex-col gap-2 list-disc pl-4 text-slate-600">
              <li><strong>α and β</strong> are complex numbers representing probability amplitudes.</li>
              <li><strong>|α|²</strong> is the exact probability of measuring the state as 0.</li>
              <li><strong>|β|²</strong> is the exact probability of measuring the state as 1.</li>
              <li>Before measurement, the qubit exists in a genuine physical superposition of both states simultaneously.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TOPIC 2: SUPERPOSITION & INTERFERENCE */}
      {activeSection === 'superposition' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Wave Interference Diagram Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-[#0f62fe] font-mono uppercase">Concept Diagram</span>
              <h2 className="text-lg font-bold text-slate-900 mt-1 mb-4">Quantum Interference (Waves)</h2>

              {/* Interference Waves Visual */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
                {/* Constructive */}
                <div className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-emerald-800 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Constructive Interference
                    </span>
                    <span className="text-[11px] text-slate-500">Waves in-phase (+ and +) add together</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600">Amplitudes Double (↑ P)</span>
                </div>

                {/* Destructive */}
                <div className="p-3 bg-white border border-rose-200 rounded-lg flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-rose-800 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Destructive Interference
                    </span>
                    <span className="text-[11px] text-slate-500">Waves out-of-phase (+ and -) cancel out</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-rose-600">Amplitudes Cancel (0% P)</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-slate-700">
              💡 <strong>Why Quantum Speedup Works:</strong> Quantum algorithms (like Grover's and Shor's) do not simply test every answer. They engineer destructive interference to cancel wrong answers and constructive interference to amplify the correct answer!
            </div>
          </div>

          {/* Explanation Notes */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">How Hadamard (H) Creates Superposition</h3>
            <p>
              The <strong>Hadamard operator (H)</strong> is the gateway to quantum computation. It rotates the computational basis vectors into equal superposition states:
            </p>

            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <strong>H|0⟩ = |+⟩</strong>
                <span className="block text-[11px] text-slate-500 mt-0.5">(|0⟩ + |1⟩)/√2</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <strong>H|1⟩ = |-⟩</strong>
                <span className="block text-[11px] text-slate-500 mt-0.5">(|0⟩ - |1⟩)/√2</span>
              </div>
            </div>

            <p>
              Notice the minus sign in <code>|-⟩</code>! This relative phase does not change the 50% probability of measurement, but it determines whether future gates will produce constructive or destructive interference.
            </p>
          </div>
        </div>
      )}

      {/* TOPIC 3: ENTANGLEMENT */}
      {activeSection === 'entanglement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Entanglement Diagram */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-[#0f62fe] font-mono uppercase">Concept Diagram</span>
              <h2 className="text-lg font-bold text-slate-900 mt-1 mb-4">Bell State Entanglement Link</h2>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center justify-around w-full">
                  <div className="p-3 bg-white border-2 border-[#002d9c] rounded-xl text-center shadow-xs">
                    <span className="text-xs font-mono font-bold text-blue-900 block">Qubit 0 (Alice)</span>
                    <span className="text-sm font-bold text-[#0f62fe]">|q₀⟩</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-4">
                    <span className="text-[10px] font-mono text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full mb-1">
                      EPR Entangled Link
                    </span>
                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded" />
                    <span className="text-[10px] text-slate-400 mt-1">Instantaneous Correlation</span>
                  </div>

                  <div className="p-3 bg-white border-2 border-[#002d9c] rounded-xl text-center shadow-xs">
                    <span className="text-xs font-mono font-bold text-blue-900 block">Qubit 1 (Bob)</span>
                    <span className="text-sm font-bold text-[#0f62fe]">|q₁⟩</span>
                  </div>
                </div>

                <div className="font-mono text-xs font-bold text-slate-800 bg-white p-2 rounded border border-slate-200 text-center w-full">
                  |Φ⁺⟩ = (|00⟩ + |11⟩) / √2
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-slate-700">
              💡 <strong>Einstein's "Spooky Action":</strong> If Alice measures her qubit and gets <strong>0</strong>, Bob's qubit collapses to <strong>0</strong> immediately. If Alice gets <strong>1</strong>, Bob gets <strong>1</strong> with 100% certainty, even if separated by light years!
            </div>
          </div>

          {/* Explanation Notes */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">How to Create Entanglement in Composer</h3>
            <p>
              Entanglement is generated using a 2-qubit entangling gate (such as Controlled-NOT / CNOT) preceded by a Hadamard gate.
            </p>

            <div className="flex flex-col gap-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span>1. Initial Ground State:</span>
                <span className="font-mono font-bold">|00⟩</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span>2. Apply Hadamard on q[0]:</span>
                <span className="font-mono font-bold">1/√2 (|0⟩ + |1⟩) ⊗ |0⟩</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span>3. Apply CNOT (control: 0, target: 1):</span>
                <span className="font-mono font-bold text-[#0f62fe]">1/√2 (|00⟩ + |11⟩)</span>
              </div>
            </div>

            <p>
              In this state, neither qubit has a definite state of its own. You can only describe the system as a single unified entangled wavefunction!
            </p>
          </div>
        </div>
      )}

      {/* TOPIC 4: MEASUREMENT & BORN RULE */}
      {activeSection === 'measurement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Collapse Diagram */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-[#0f62fe] font-mono uppercase">Concept Diagram</span>
              <h2 className="text-lg font-bold text-slate-900 mt-1 mb-4">Wavefunction Collapse (Born Rule)</h2>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col items-center gap-4">
                <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-center font-mono font-bold text-xs text-[#0f62fe]">
                  Superposition State: |ψ⟩ = 1/√2 |0⟩ + 1/√2 |1⟩
                </div>

                <div className="text-slate-400 font-mono text-xs flex flex-col items-center">
                  <span>↓ Measurement (M) ↓</span>
                  <span className="text-[10px] text-slate-400">Random irreversible projection</span>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-xs">
                    <span className="text-lg font-bold text-slate-900 block font-mono">0</span>
                    <span className="text-xs text-slate-500 font-semibold">50% Probability</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-xs">
                    <span className="text-lg font-bold text-slate-900 block font-mono">1</span>
                    <span className="text-xs text-slate-500 font-semibold">50% Probability</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-slate-700">
              ⚠️ <strong>Critical Rule:</strong> In quantum mechanics, measurement permanently destroys phase coherence and superposition. Once measured, the state cannot return to its previous superposition.
            </div>
          </div>

          {/* Explanation Notes */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">The Born Rule Explained</h3>
            <p>
              Formulated by physicist Max Born in 1926, the Born rule links the abstract mathematical amplitudes of quantum mechanics with real-world physical experimental measurements.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-center font-bold">
              P(x) = |\langle x|\psi\rangle|^2 = |\alpha_x|^2
            </div>

            <p>
              When a quantum processor runs an algorithm, it performs 1,024 or 4,096 repeated "shots" (runs). The resulting bar histogram matches this exact probability distribution.
            </p>
          </div>
        </div>
      )}

      {/* TOPIC 5: GATES CHEAT SHEET */}
      {activeSection === 'gates' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-5 animate-fadeIn">
          <div>
            <span className="text-xs font-bold text-[#0f62fe] font-mono uppercase">Quick Reference</span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Quantum Gates & Unitary Matrices</h2>
            <p className="text-xs text-slate-600 mt-0.5">Every quantum gate must be a reversible unitary matrix where U†U = I.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gate Cards */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#007d79] text-white">Hadamard</span>
                <span className="text-[10px] font-mono text-slate-500">Superposition</span>
              </div>
              <p className="text-[11px] text-slate-600">Rotates statevector into equal 50/50 superposition.</p>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-center">
                1/√2 [[1, 1], [1, -1]]
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#da1e28] text-white">NOT (X)</span>
                <span className="text-[10px] font-mono text-slate-500">Bit-Flip</span>
              </div>
              <p className="text-[11px] text-slate-600">Inverts |0⟩ ↔ |1⟩. 180° rotation around X-axis.</p>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-center">
                [[0, 1], [1, 0]]
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#0f62fe] text-white">Phase (Z)</span>
                <span className="text-[10px] font-mono text-slate-500">Phase-Flip</span>
              </div>
              <p className="text-[11px] text-slate-600">Flips sign of |1⟩ to -|1⟩. Inverts |+⟩ ↔ |-⟩.</p>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-center">
                [[1, 0], [0, -1]]
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#6929c4] text-white">S-Phase</span>
                <span className="text-[10px] font-mono text-slate-500">Quarter-Turn</span>
              </div>
              <p className="text-[11px] text-slate-600">Applies 90° (π/2) relative phase to |1⟩. SS = Z.</p>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-center">
                [[1, 0], [0, i]]
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#002d9c] text-white">CNOT</span>
                <span className="text-[10px] font-mono text-slate-500">Entangling</span>
              </div>
              <p className="text-[11px] text-slate-600">Flips target qubit if control qubit is in state |1⟩.</p>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-center">
                [[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#0072c3] text-white">SWAP</span>
                <span className="text-[10px] font-mono text-slate-500">2-Qubit</span>
              </div>
              <p className="text-[11px] text-slate-600">Exchanges quantum state: |a, b⟩ → |b, a⟩.</p>
              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-center">
                [[1,0,0,0], [0,0,1,0], [0,1,0,0], [0,0,0,1]]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
