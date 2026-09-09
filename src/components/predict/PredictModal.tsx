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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Active Recall Checkpoint
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Forecast Quantum State</h2>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Before inspecting the simulated vector, predict the measurement probabilities for this circuit state.
        </p>

        {!evaluated ? (
          <>
            {/* Basis States Sliders */}
            <div className="flex flex-col gap-3 py-1 max-h-56 overflow-y-auto pr-1">
              {Array.from({ length: dim }).map((_, i) => {
                const bitstring = i.toString(2).padStart(numQubits, '0');
                const val = predictions[i] || 0;
                return (
                  <div key={bitstring} className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-mono font-semibold">
                      <span className="text-[#0f62fe] font-bold">|{bitstring}⟩</span>
                      <span className="text-slate-800">{val}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleSliderChange(i, parseInt(e.target.value))}
                      className="accent-[#0f62fe] cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            {/* Normalization & Entanglement Options */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={handleNormalize}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer border border-slate-200"
              >
                Normalize to 100%
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={predictedEntangled}
                  onChange={(e) => setPredictedEntangled(e.target.checked)}
                  className="rounded text-[#0f62fe] accent-[#0f62fe]"
                />
                <span className="font-medium">Is Entangled State</span>
              </label>
            </div>

            {/* Submit Prediction */}
            <button
              onClick={handleEvaluate}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span>Submit Prediction & Check Accuracy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          /* Evaluation Results View */
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Score Banner */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${
              score >= 80
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <Trophy className={`w-7 h-7 ${score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-mono font-bold">Accuracy Score</span>
                  <span className="text-2xl font-bold font-mono">{score}%</span>
                </div>
                <p className="text-xs mt-1 leading-snug">{feedback}</p>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              <span className="text-xs text-slate-600 font-semibold">Prediction vs. Quantum Reality:</span>
              {Array.from({ length: dim }).map((_, i) => {
                const bitstring = i.toString(2).padStart(numQubits, '0');
                const predProb = Math.round((predictions[i] || 0));
                const actProb = Math.round((actualState.probabilities[i] || 0) * 100);
                const isMatch = Math.abs(predProb - actProb) <= 15;

                return (
                  <div key={bitstring} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
                    <span className="text-[#0f62fe] font-bold">|{bitstring}⟩</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500">Predicted: {predProb}%</span>
                      <span className="text-slate-900 font-bold">Actual: {actProb}%</span>
                      {isMatch ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close & Continue */}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#0f62fe] hover:bg-[#0353e9] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Continue to Circuit Studio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
