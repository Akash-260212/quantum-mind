import React, { useState } from 'react';
import { QuantumState } from '../../quantum/types';
import { sounds } from '../../utils/audio';
import { BarChart3, Binary, RefreshCw, Activity, Share2 } from 'lucide-react';

interface StateVisualizerProps {
  currentState: QuantumState;
  measurementShots: Record<string, number>;
  totalShots: number;
  numQubits: number;
  onResampleShots: () => void;
}

export const StateVisualizer: React.FC<StateVisualizerProps> = ({
  currentState,
  measurementShots,
  totalShots,
  numQubits,
  onResampleShots
}) => {
  const [activeTab, setActiveTab] = useState<'probabilities' | 'shots'>('probabilities');

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0f62fe]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Quantum State Vector</h3>
            <p className="text-[11px] text-slate-500">Step {currentState.stepIndex} Evolution</p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('probabilities'); }}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'probabilities'
                ? 'bg-[#0f62fe] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Statevector
          </button>
          <button
            onClick={() => { sounds.playClick(); setActiveTab('shots'); }}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeTab === 'shots'
                ? 'bg-[#0f62fe] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1,024 Shots
          </button>
        </div>
      </div>

      {/* Dirac Notation Display */}
      <div className="my-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0f62fe] font-mono">|ψ⟩ =</span>
          <span className="text-xs font-mono text-slate-900 font-bold tracking-wide">
            {currentState.diracRepresentation}
          </span>
        </div>
        {currentState.isEntangled && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 shrink-0 font-bold">
            Entangled
          </span>
        )}
      </div>

      {/* Tab 1: Statevector Probabilities */}
      {activeTab === 'probabilities' && (
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
          {currentState.probabilities.map((prob, idx) => {
            const bitstring = idx.toString(2).padStart(numQubits, '0');
            const amp = currentState.statevector[idx];
            const phase = amp.phase();
            const phaseDegrees = ((phase * 180) / Math.PI + 360) % 360;
            const percent = (prob * 100).toFixed(1);

            return (
              <div
                key={bitstring}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center gap-3"
              >
                {/* Basis ket */}
                <div className="w-12 text-center font-mono font-bold text-xs text-[#0f62fe] bg-white py-1 rounded border border-slate-200 shadow-xs">
                  |{bitstring}⟩
                </div>

                {/* Bar */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600 font-medium">Amplitude: {amp.format(2)}</span>
                    <span className="font-bold text-slate-900">{percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-[#0f62fe] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, prob * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Phase Clock */}
                <div
                  className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center relative bg-white shadow-xs"
                  title={`Phase: ${phaseDegrees.toFixed(0)}°`}
                >
                  <div
                    className="absolute w-2.5 h-[1.5px] bg-[#0f62fe] origin-left"
                    style={{ transform: `rotate(${phaseDegrees}deg)` }}
                  />
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 1,024 Shots Histogram */}
      {activeTab === 'shots' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-600 font-medium">
            <span>Simulated QPU Execution: 1,024 Measurement Shots</span>
            <button
              onClick={() => { sounds.playClick(); onResampleShots(); }}
              className="flex items-center gap-1 text-[#0f62fe] hover:text-[#0043ce] text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resample
            </button>
          </div>

          <div className="flex items-end justify-around gap-2 h-44 py-3 px-4 bg-slate-50 rounded-lg border border-slate-200">
            {Object.entries(measurementShots).map(([bitstring, count]) => {
              const heightPercent = ((count / totalShots) * 100).toFixed(0);
              return (
                <div key={bitstring} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-mono text-[#0f62fe] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </span>
                  <div className="w-full max-w-[40px] bg-slate-200 rounded-t overflow-hidden flex items-end">
                    <div
                      className="w-full bg-[#0f62fe] rounded-t transition-all duration-300"
                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-1">
                    |{bitstring}⟩
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">
                    {((count / totalShots) * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-[11px] text-slate-500 text-center font-mono">
            Born Rule: Probability P(x) = |⟨x|ψ⟩|²
          </div>
        </div>
      )}
    </div>
  );
};
