import React from 'react';
import { PRESET_ALGORITHMS } from '../../quantum/ast';
import { sounds } from '../../utils/audio';
import {
  Plus,
  Minus,
  Volume2,
  VolumeX,
  BrainCircuit,
  Share2
} from 'lucide-react';

interface CircuitToolbarProps {
  numQubits: number;
  onAddQubit: () => void;
  onRemoveQubit: () => void;
  numSteps: number;
  onAddStep: () => void;
  onRemoveStep: () => void;
  onClearCircuit: () => void;
  onLoadPreset: (presetId: string) => void;
  currentStepIndex: number;
  maxStepIndex: number;
  onStepChange: (step: number) => void;
  onRunSimulation: () => void;
  onOpenPredictModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onShareCircuit?: () => void;
}

export const CircuitToolbar: React.FC<CircuitToolbarProps> = ({
  numQubits,
  onAddQubit,
  onRemoveQubit,
  numSteps,
  onAddStep,
  onRemoveStep,
  onLoadPreset,
  onOpenPredictModal,
  soundEnabled,
  onToggleSound,
  onShareCircuit
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Clean Modular Control Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        {/* Left Groups: Dedicated separate boxes for Qubits, Steps, Presets */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Box 1: Qubits Wire Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] uppercase font-mono font-bold text-slate-500">Qubits:</span>
            <span className="font-mono text-slate-900 font-bold text-xs px-1.5 py-0.5 bg-white rounded border border-slate-200">
              q[{numQubits}]
            </span>
            <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1">
              <button
                onClick={() => { sounds.playClick(); onRemoveQubit(); }}
                disabled={numQubits <= 1}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Remove wire"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => { sounds.playClick(); onAddQubit(); }}
                disabled={numQubits >= 5}
                className="p-1 rounded hover:bg-slate-200 text-[#0f62fe] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Add wire"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Box 2: Steps Columns Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] uppercase font-mono font-bold text-slate-500">Steps:</span>
            <span className="font-mono text-slate-900 font-bold text-xs px-1.5 py-0.5 bg-white rounded border border-slate-200">
              {numSteps}
            </span>
            <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1">
              <button
                onClick={() => { sounds.playClick(); onRemoveStep(); }}
                disabled={numSteps <= 3}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Remove step column"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => { sounds.playClick(); onAddStep(); }}
                disabled={numSteps >= 10}
                className="p-1 rounded hover:bg-slate-200 text-[#0f62fe] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Add step column"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Box 3: Algorithm Presets */}
          <div className="flex items-center px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  sounds.playSuccess();
                  onLoadPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs focus:outline-none focus:border-[#0f62fe] cursor-pointer font-medium"
            >
              <option value="" disabled>Load Algorithm Preset...</option>
              {PRESET_ALGORITHMS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Groups */}
        <div className="flex items-center gap-2">
          {/* Box 4: Predict State (Dedicated Highlight Box) */}
          <button
            onClick={() => { sounds.playClick(); onOpenPredictModal(); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Active Recall: Forecast state before inspecting results"
          >
            <BrainCircuit className="w-4 h-4 fill-white/20" />
            <span>Predict State</span>
          </button>

          {/* Share Circuit */}
          {onShareCircuit && (
            <button
              onClick={onShareCircuit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f62fe] border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Copy shareable circuit link for judges or peers"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}

          {/* Continuous Real-time Status */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-semibold"
            title="Simulates automatically on every gate placement"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-Simulated</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#0f62fe]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
