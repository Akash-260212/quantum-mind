import React from 'react';
import { LearnerProfile } from '../../quantum/types';
import { sounds } from '../../utils/audio';
import {
  Trophy,
  Flame,
  Award,
  TrendingUp,
  Brain,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  X,
  Target
} from 'lucide-react';

interface LearnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LearnerProfile;
  onNavigateToChallenge: (challengeId: string) => void;
}

export const LearnerProfileModal: React.FC<LearnerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onNavigateToChallenge
}) => {
  if (!isOpen) return null;

  const accuracyRate = profile.predictionsMade > 0
    ? Math.round((profile.accuratePredictions / profile.predictionsMade) * 100)
    : 0;

  const misconceptionsList = [
    {
      id: 'phase_confusion',
      title: 'Phase vs. Bit-Flip Duality',
      description: 'Tendency to use X gate instead of Z gate to flip relative phase in Hadamard superposition basis |+⟩ ↔ |-⟩.',
      count: profile.misconceptions['phase'] || 1,
      challengeId: 'phase-flip-mystery',
      challengeName: 'Challenge 3: The Phase Flip Puzzle'
    },
    {
      id: 'premature_collapse',
      title: 'Premature Measurement Collapse',
      description: 'Placing measurement gates midway through quantum interference loops, destroying quantum coherence.',
      count: profile.misconceptions['measurement'] || 1,
      challengeId: 'superposition-collapse',
      challengeName: 'Challenge 2: Wavefunction Collapse'
    },
    {
      id: 'entanglement_ordering',
      title: 'Entanglement Inversion',
      description: 'Confusing control and target wires on 2-qubit CNOT operations, leading to separable classical states.',
      count: profile.misconceptions['entanglement'] || 0,
      challengeId: 'broken-bell',
      challengeName: 'Challenge 1: The Inverted Entangler'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0a0f26] border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,245,212,0.15)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/30">
            Ψ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">Quantum Learner Telemetry</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                Level {profile.level} Explorer
              </span>
            </div>
            <p className="text-xs text-slate-400">Quantum Mind Longitudinal Cognitive Model & ICAP Framework</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1 font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Total XP
            </span>
            <span className="text-xl font-black font-display text-white">{profile.xp} XP</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1 font-semibold">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Daily Streak
            </span>
            <span className="text-xl font-black font-display text-orange-400">{profile.streak} Days</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1 font-semibold">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Prediction Accuracy
            </span>
            <span className="text-xl font-black font-display text-cyan-300">{accuracyRate}%</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1 font-semibold">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Puzzles Solved
            </span>
            <span className="text-xl font-black font-display text-emerald-400">
              {profile.completedPuzzles.length} / 4
            </span>
          </div>
        </div>

        {/* Cognitive Skill Mastery Radar / Progress Bars */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Quantum Conceptual Masteries
          </h3>

          <div className="flex flex-col gap-2.5">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Superposition & Unitary Rotations</span>
                <span className="font-mono text-cyan-300 font-bold">{profile.masteryScores.superposition}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${profile.masteryScores.superposition}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Non-Local Entanglement (Bell States & GHZ)</span>
                <span className="font-mono text-purple-300 font-bold">{profile.masteryScores.entanglement}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${profile.masteryScores.entanglement}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Phase Logic & Interference Dynamics</span>
                <span className="font-mono text-blue-300 font-bold">{profile.masteryScores.phaseDynamics}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${profile.masteryScores.phaseDynamics}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Measurement Axioms & Wavefunction Collapse</span>
                <span className="font-mono text-amber-300 font-bold">{profile.masteryScores.measurement}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${profile.masteryScores.measurement}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Longitudinal Misconception Tracker & Remedial Micro-tasks */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Longitudinal Misconception Diagnostics
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Cross-session Telemetry</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {misconceptionsList.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{m.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {m.count} Detected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{m.description}</p>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onNavigateToChallenge(m.challengeId);
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold text-xs hover:scale-105 transition-all cursor-pointer"
                >
                  <span>Remedial Puzzle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
