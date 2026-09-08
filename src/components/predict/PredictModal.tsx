import React, { useState } from 'react';
import { QuantumState } from '../../quantum/types';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';

interface PredictModalProps {
  isOpen: boolean;
  onClose: () => void;
  actualState: QuantumState;
  numQubits: number;
  onPredictionEvaluated: (score: number, misconceptionKey?: string) => void;
}

export const PredictModal: React.FC<PredictModalProps> = ({
  isOpen,
  onClose,
  actualState,
  numQubits,
  onPredictionEvaluated
}) => {
  const dim = 1 << numQubits;
  const [predictions, setPredictions] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    for (let i = 0; i < dim; i++) init[i] = i === 0 ? 100 : 0;
    return init;
  });

  const [predictedEntangled, setPredictedEntangled] = useState<boolean>(false);
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');

  if (!isOpen) return null;

  const handleSliderChange = (idx: number, val: number) => {
    setPredictions(prev => ({
      ...prev,
      [idx]: val
    }));
  };

  const handleNormalize = () => {
    sounds.playClick();
    const sum = Object.values(predictions).reduce((a, b) => a + b, 0);
    if (sum === 0) return;
    const normalized: Record<number, number> = {};
    for (let i = 0; i < dim; i++) {
      normalized[i] = Math.round((predictions[i] / sum) * 100);
    }
    setPredictions(normalized);
  };

  const handleEvaluate = () => {
    const sum = Object.values(predictions).reduce((a, b) => a + b, 0) || 1;
    let totalError = 0;

    for (let i = 0; i < dim; i++) {
      const predProb = (predictions[i] || 0) / sum;
      const actualProb = actualState.probabilities[i] || 0;
      totalError += Math.abs(predProb - actualProb);
    }

    // Entanglement penalty/bonus
    const entanglementCorrect = predictedEntangled === actualState.isEntangled;
    if (!entanglementCorrect) {
      totalError += 0.3;
    }

    const calculatedScore = Math.max(0, Math.min(100, Math.round((1 - totalError / 2) * 100)));
    setScore(calculatedScore);
    setEvaluated(true);

    let misconceptionKey: string | undefined;

    if (calculatedScore >= 85) {
      sounds.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setFeedback('Brilliant foresight! Your quantum intuition matches the simulated statevector with high precision.');
    } else {
      sounds.playAlert();
      if (!entanglementCorrect && actualState.isEntangled) {
        misconceptionKey = 'entanglement';
        setFeedback('Misconception Detected: You anticipated separable states, but the circuit produced non-local Bell entanglement.');
      } else if (actualState.probabilities.some(p => p > 0.4 && p < 0.6)) {
        misconceptionKey = 'superposition';
        setFeedback('Misconception Detected: Superposition amplitudes were miscalculated. Remember that Hadamard gates distribute equal 50% probability.');
      } else {
        misconceptionKey = 'phase';
        setFeedback('Review Gate Dynamics: Pay close attention to phase signs and control-wire activation conditions.');
      }
    }

    onPredictionEvaluated(calculatedScore, misconceptionKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#121726] border border-[#1f293d] rounded-xl p-6 shadow-2xl flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#161c2e] hover:bg-[#212738] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Active Recall Checkpoint
            </span>
            <h2 className="text-base font-semibold text-white">Predict-Then-Compare</h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Active recall strengthens quantum conceptual understanding. Forecast the probability distribution before running the simulation.
        </p>

        {!evaluated ? (
          <>
            {/* Basis States Sliders */}
            <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Forecasted Probabilities (%):</span>
                <button
                  onClick={handleNormalize}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] underline"
                >
                  Auto-balance to 100%
                </button>
              </div>

              {Array.from({ length: dim }).map((_, i) => {
                const bitstring = i.toString(2).padStart(numQubits, '0');
                const val = predictions[i] || 0;
                return (
                  <div key={bitstring} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="font-mono text-cyan-300 font-bold text-xs w-12 text-center bg-cyan-950/40 py-1 rounded">
                      |{bitstring}⟩
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleSliderChange(i, parseInt(e.target.value))}
                      className="flex-1 accent-amber-400 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-white font-bold w-10 text-right">
                      {val}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Entanglement Prediction Switch */}
            {numQubits > 1 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                <span className="text-slate-300 font-medium">Will this circuit result in quantum entanglement?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { sounds.playClick(); setPredictedEntangled(false); }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      !predictedEntangled ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Separable
                  </button>
                  <button
                    onClick={() => { sounds.playClick(); setPredictedEntangled(true); }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      predictedEntangled ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Entangled
                  </button>
                </div>
              </div>
            )}

            {/* Submit Prediction */}
            <button
              onClick={handleEvaluate}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-bold font-display text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Prediction & Reveal Quantum State</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          /* Evaluation Results View */
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Score Banner */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
              score >= 80
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
            }`}>
              <div className="p-3 rounded-xl bg-black/40">
                <Trophy className={`w-8 h-8 ${score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-mono font-bold">Accuracy Score</span>
                  <span className="text-2xl font-black font-display">{score}%</span>
                </div>
                <p className="text-xs mt-1 leading-snug">{feedback}</p>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              <span className="text-xs text-slate-400 font-semibold">Prediction vs. Quantum Reality:</span>
              {Array.from({ length: dim }).map((_, i) => {
                const bitstring = i.toString(2).padStart(numQubits, '0');
                const predProb = Math.round((predictions[i] || 0));
                const actProb = Math.round((actualState.probabilities[i] || 0) * 100);
                const isMatch = Math.abs(predProb - actProb) <= 15;

                return (
                  <div key={bitstring} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs font-mono">
                    <span className="text-cyan-300 font-bold">|{bitstring}⟩</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Predicted: {predProb}%</span>
                      <span className="text-white font-bold">Actual: {actProb}%</span>
                      {isMatch ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close & Continue */}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all"
            >
              Continue to Circuit Studio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
