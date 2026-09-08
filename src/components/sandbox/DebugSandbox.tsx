import React, { useState } from 'react';
import { DEBUG_CHALLENGES } from '../../quantum/ast';
import { DebugChallenge, CircuitGate } from '../../quantum/types';
import { QuantumSimulator } from '../../quantum/simulator';
import {
  getLocalStudentMisconceptions,
  getAdaptiveRecommendation,
  recordLocalMisconception
} from '../../quantum/telemetry';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Award,
  ArrowRight,
  BookOpen,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';
import { CircuitCanvas } from '../canvas/CircuitCanvas';
import { GatePalette } from '../canvas/GatePalette';

interface DebugSandboxProps {
  onChallengeCompleted: (challengeId: string, xpEarned: number) => void;
  completedChallenges: string[];
}

export const DebugSandbox: React.FC<DebugSandboxProps> = ({
  onChallengeCompleted,
  completedChallenges
}) => {
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);
  const challenge: DebugChallenge = DEBUG_CHALLENGES[activeChallengeIndex];

  // Working circuit state initialized from challenge faulty circuit
  const [gates, setGates] = useState<CircuitGate[]>(() => {
    return challenge.faultyCircuit.gates.map((g, idx) => ({
      ...g,
      id: `sandbox_${idx}_${Date.now()}`
    }));
  });

  const [selectedGateType, setSelectedGateType] = useState<any>(null);
  const [selectedAngle, setSelectedAngle] = useState<number>(Math.PI / 2);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [testResult, setTestResult] = useState<{ passed: boolean; message: string; actualState: string } | null>(null);

  // Student misconception telemetry for adaptive queue
  const [misconceptions, setMisconceptions] = useState<Record<string, number>>(() => getLocalStudentMisconceptions());

  // Compute real-time personalized adaptive recommendation
  const recommendation = getAdaptiveRecommendation(misconceptions, completedChallenges);

  const handleSelectChallenge = (index: number) => {
    sounds.playClick();
    setActiveChallengeIndex(index);
    const targetChallenge = DEBUG_CHALLENGES[index];
    setGates(targetChallenge.faultyCircuit.gates.map((g, idx) => ({
      ...g,
      id: `sandbox_${idx}_${Date.now()}`
    })));
    setRevealedHints(0);
    setTestResult(null);
  };

  const handleLoadRecommended = () => {
    const idx = DEBUG_CHALLENGES.findIndex(c => c.id === recommendation.challengeId);
    if (idx !== -1) {
      handleSelectChallenge(idx);
    }
  };

  const handleResetChallenge = () => {
    sounds.playAlert();
    setGates(challenge.faultyCircuit.gates.map((g, idx) => ({
      ...g,
      id: `sandbox_${idx}_${Date.now()}`
    })));
    setTestResult(null);
  };

  const handleVerify = () => {
    const simulator = new QuantumSimulator();
    const result = simulator.simulate(challenge.faultyCircuit.numQubits, 6, gates);
    const finalState = result.finalState;

    let passed = false;
    let message = '';

    if (challenge.id === 'broken-bell') {
      const p00 = finalState.probabilities[0] || 0;
      const p11 = finalState.probabilities[3] || 0;
      if (Math.abs(p00 - 0.5) < 0.05 && Math.abs(p11 - 0.5) < 0.05) {
        passed = true;
        message = 'Success! You repaired the entanglement circuit and generated the canonical Bell state |Φ⁺⟩!';
      } else {
        message = `Circuit output is ${finalState.diracRepresentation}. Expected equal 50% superposition between |00⟩ and |11⟩.`;
        recordLocalMisconception('entanglement');
      }
    } else if (challenge.id === 'superposition-collapse') {
      const hasMeasure = gates.some(g => g.type === 'M');
      const allFour = finalState.probabilities.slice(0, 4).every(p => Math.abs(p - 0.25) < 0.05);
      if (!hasMeasure && allFour) {
        passed = true;
        message = 'Success! You eliminated premature measurement collapse and preserved the uniform 2-qubit superposition!';
      } else {
        message = hasMeasure
          ? 'Failed: Intermediate measurement is still collapsing the wavefunction prematurely!'
          : `Probabilities do not match uniform 25% distribution. Current output: ${finalState.diracRepresentation}`;
        recordLocalMisconception('measurement');
      }
    } else if (challenge.id === 'phase-flip-mystery') {
      const amp0 = finalState.statevector[0];
      const amp1 = finalState.statevector[1];
      if (amp0 && amp1 && Math.abs(amp0.re - Math.SQRT1_2) < 0.05 && Math.abs(amp1.re - (-Math.SQRT1_2)) < 0.05) {
        passed = true;
        message = 'Success! You correctly applied the phase flip operator to transition from |+⟩ into |-⟩!';
      } else {
        message = `Current output is ${finalState.diracRepresentation}. Note: Z|+⟩ = |-⟩, whereas X|+⟩ = |+⟩!`;
        recordLocalMisconception('phase');
      }
    } else if (challenge.id === 'ghz-broken-chain') {
      const p000 = finalState.probabilities[0] || 0;
      const p111 = finalState.probabilities[7] || 0;
      if (Math.abs(p000 - 0.5) < 0.05 && Math.abs(p111 - 0.5) < 0.05) {
        passed = true;
        message = 'Success! You cascaded the CNOT entangling wires to create the tripartite GHZ state!';
      } else {
        message = `Current output: ${finalState.diracRepresentation}. Expected |000⟩ and |111⟩ with 50% each.`;
        recordLocalMisconception('entanglement');
      }
    } else if (challenge.id === 'deutsch-kickback') {
      // Look for X then H on qubit 1 before CNOT
      const hasXonQ1 = gates.some(g => g.type === 'X' && g.qubit === 1 && g.step <= 1);
      const hasHonQ1 = gates.some(g => g.type === 'H' && g.qubit === 1);
      const hasCnot = gates.some(g => g.type === 'CNOT' && g.controlQubit === 0 && g.qubit === 1);
      if (hasXonQ1 && hasHonQ1 && hasCnot) {
        passed = true;
        message = 'Success! You initialized the ancilla in |-⟩ = (|0⟩ - |1⟩)/√2 and successfully kicked back the negative eigenvalue!';
      } else {
        message = 'Target ancilla not in |-⟩ state. Apply Pauli-X then Hadamard on qubit 1 before the CNOT to trigger phase kickback.';
        recordLocalMisconception('phase');
        import('../../services/api').then(({ logMisconceptionToBackend }) => {
          logMisconceptionToBackend({
            student_id: 'active_session_student',
            concept_id: 'phase_kickback',
            category: 'Phase Misunderstanding',
            faulty_gate: 'H',
            step_context: 'debug_challenge_phase_kickback'
          });
        }).catch(() => {});
      }
    } else if (challenge.id === 'bitflip-basis') {
      const p10 = finalState.probabilities[2] || 0;
      if (p10 > 0.95) {
        passed = true;
        message = 'Success! You inverted wire q0 and created the pure basis vector |10⟩!';
      } else {
        message = `Current state is ${finalState.diracRepresentation}. Expected pure |10⟩.`;
        recordLocalMisconception('superposition');
        import('../../services/api').then(({ logMisconceptionToBackend }) => {
          logMisconceptionToBackend({
            student_id: 'active_session_student',
            concept_id: 'computational_basis',
            category: 'Superposition & Basis State',
            faulty_gate: 'X',
            step_context: 'debug_challenge_bitflip'
          });
        }).catch(() => {});
      }
    }

    setMisconceptions(getLocalStudentMisconceptions());

    if (passed) {
      sounds.playSuccess();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onChallengeCompleted(challenge.id, 100);
    } else {
      sounds.playAlert();
    }

    setTestResult({
      passed,
      message,
      actualState: finalState.diracRepresentation
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full py-2">
      {/* 🎯 CORE FEATURE: Difficulty-Adaptive Queue Recommendation Banner */}
      <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0f62fe] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#0f62fe] font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Difficulty-Adaptive Recommendation Queue
              </span>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full border ${
                recommendation.urgency === 'high'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {recommendation.urgency === 'high' ? 'High Remediation Priority' : 'Next Recommended'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {recommendation.challengeTitle} ({recommendation.difficulty})
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        </div>

        {recommendation.challengeId !== challenge.id && (
          <button
            onClick={handleLoadRecommended}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f62fe] hover:bg-[#0353e9] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <span>Start Adaptive Challenge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Challenge Navigation Tabs with Adaptive Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DEBUG_CHALLENGES.map((ch, idx) => {
          const isDone = completedChallenges.includes(ch.id);
          const isCurrent = activeChallengeIndex === idx;
          const isRecommended = ch.id === recommendation.challengeId;

          return (
            <button
              key={ch.id}
              onClick={() => handleSelectChallenge(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer relative ${
                isCurrent
                  ? 'bg-[#0f62fe] border-[#0f62fe] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>{ch.title}</span>

              {isRecommended && !isDone && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-bold animate-pulse">
                  Recommended
                </span>
              )}

              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {ch.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* Challenge Briefing Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs">
            <span className="text-[#0f62fe] font-bold">{challenge.category}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{challenge.difficulty} Practice</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{challenge.title}</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">{challenge.story}</p>
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs">
            <span className="font-bold text-[#0f62fe] font-mono">Objective: </span>
            <span className="text-slate-800">{challenge.objective}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleVerify}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f62fe] hover:bg-[#0353e9] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Verify Solution</span>
          </button>
          <button
            onClick={handleResetChallenge}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Challenge</span>
          </button>
        </div>
      </div>

      {/* Verification Result Feedback */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs animate-fadeIn ${
            testResult.passed
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {testResult.passed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <h4 className="font-bold mb-1">
              {testResult.passed ? 'Challenge Solved!' : 'Verification Incomplete'}
            </h4>
            <p className="leading-relaxed">{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Operations Palette */}
      <GatePalette
        selectedGateType={selectedGateType}
        onSelectGateType={setSelectedGateType}
        selectedAngle={selectedAngle}
        onAngleChange={setSelectedAngle}
        hoveredGateInfo={null}
        setHoveredGateInfo={() => {}}
      />

      {/* Interactive Circuit Canvas for debugging */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <CircuitCanvas
          numQubits={challenge.faultyCircuit.numQubits}
          numSteps={6}
          gates={gates}
          selectedGateType={selectedGateType}
          selectedAngle={selectedAngle}
          onAddGate={(newGate) => {
            setGates(prev => [...prev.filter(g => !(g.qubit === newGate.qubit && g.step === newGate.step)), newGate]);
          }}
          onRemoveGate={(gateId) => {
            setGates(prev => prev.filter(g => g.id !== gateId));
          }}
          onUpdateGate={(updatedGate) => {
            setGates(prev => prev.map(g => g.id === updatedGate.id ? updatedGate : g));
          }}
          currentStepIndex={6}
          onSelectStep={() => {}}
        />
      </div>

      {/* Hints & Solution Guidance Drawer */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Progressive Diagnostic Hints ({revealedHints}/{challenge.hints.length})
            </h3>
          </div>

          {revealedHints < challenge.hints.length && (
            <button
              onClick={() => {
                sounds.playClick();
                setRevealedHints(prev => prev + 1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-medium transition-colors cursor-pointer"
            >
              Reveal Hint {revealedHints + 1}
            </button>
          )}
        </div>

        {revealedHints > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            {challenge.hints.slice(0, revealedHints).map((hint, i) => (
              <div key={i} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <span className="font-bold font-mono text-amber-700 shrink-0">#{i + 1}</span>
                <span className="leading-relaxed">{hint}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
