import React, { useState } from 'react';
import { PRESET_ALGORITHMS } from '../../quantum/ast';
import { sounds } from '../../utils/audio';
import {
  Plus,
  Minus,
  Trash2,
  Play,
  Volume2,
  VolumeX,
  BrainCircuit,
  SkipForward,
  SkipBack,
  HelpCircle,
  Sparkles,
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
  onClearCircuit,
  onLoadPreset,
  currentStepIndex,
  maxStepIndex,
  onStepChange,
  onRunSimulation,
  onOpenPredictModal,
  soundEnabled,
  onToggleSound,
  onShareCircuit
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-xs">
        {/* Left Group: Dimensions & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Qubits Counter */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 gap-1">
            <span className="font-mono text-slate-700 font-medium">Qubits: {numQubits}</span>
            <div className="flex items-center ml-1 border-l border-slate-300 pl-1">
              <button
                onClick={() => { sounds.playClick(); onRemoveQubit(); }}
                disabled={numQubits <= 1}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Remove wire"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => { sounds.playClick(); onAddQubit(); }}
                disabled={numQubits >= 5}
                className="p-1 rounded hover:bg-slate-200 text-[#0f62fe] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Add wire"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Steps Counter */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 gap-1">
            <span className="font-mono text-slate-700 font-medium">Steps: {numSteps}</span>
            <div className="flex items-center ml-1 border-l border-slate-300 pl-1">
              <button
                onClick={() => { sounds.playClick(); onRemoveStep(); }}
                disabled={numSteps <= 3}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Remove step column"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => { sounds.playClick(); onAddStep(); }}
                disabled={numSteps >= 10}
                className="p-1 rounded hover:bg-slate-200 text-[#0f62fe] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Add step column"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Reset / Clear */}
          <button
            onClick={() => { sounds.playAlert(); onClearCircuit(); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Clear all gates"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Algorithm Presets */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  sounds.playSuccess();
                  onLoadPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs focus:outline-none focus:border-[#0f62fe] cursor-pointer font-medium"
            >
              <option value="" disabled>Load Algorithm Preset...</option>
              {PRESET_ALGORITHMS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Guide toggle button */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              showGuide ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showGuide ? 'Hide Guide' : 'How it Works'}</span>
          </button>
        </div>

        {/* Right Group: Simulation, Step Scrubber, Active Recall */}
        <div className="flex items-center gap-2">
          {/* Step Scrubber */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs gap-1">
            <button
              onClick={() => { sounds.playClick(); onStepChange(Math.max(0, currentStepIndex - 1)); }}
              disabled={currentStepIndex <= 0}
              className="p-1 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-30 cursor-pointer"
              title="Previous Step"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <span className="font-mono px-2 text-[#0f62fe] font-bold">
              t = {currentStepIndex}/{maxStepIndex}
            </span>
            <button
              onClick={() => { sounds.playClick(); onStepChange(Math.min(maxStepIndex, currentStepIndex + 1)); }}
              disabled={currentStepIndex >= maxStepIndex}
              className="p-1 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-30 cursor-pointer"
              title="Next Step"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </div>

          {/* Share Circuit Link */}
          {onShareCircuit && (
            <button
              onClick={onShareCircuit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f62fe] border border-blue-200 font-semibold transition-colors cursor-pointer"
              title="Copy shareable circuit link for judges or peers"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Circuit</span>
            </button>
          )}

          {/* Active Recall Predict */}
          <button
            onClick={() => { sounds.playClick(); onOpenPredictModal(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold transition-colors cursor-pointer"
            title="Predict state amplitudes before simulation"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
            <span>Predict State</span>
          </button>

          {/* Run Simulation */}
          <button
            onClick={() => { sounds.playSimulate(); onRunSimulation(); }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Simulate</span>
          </button>

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

      {/* Beginner Step-by-Step Educational Guide Banner */}
      {showGuide && (
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-slate-700 leading-relaxed shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
            <span className="flex items-center gap-1.5 text-[#0f62fe]">
              <Sparkles className="w-4 h-4" /> Quick Beginner Guide: How to Build & Simulate Quantum Circuits
            </span>
            <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
            <div className="p-2.5 bg-white rounded-lg border border-blue-100">
              <span className="font-bold text-[#0f62fe] block mb-1">1. Pick an Operator</span>
              Click a gate from the palette (e.g. <strong>H</strong> for superposition or <strong>X</strong> for bit-flip).
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-blue-100">
              <span className="font-bold text-[#0f62fe] block mb-1">2. Place on Wire</span>
              Click any dotted slot on wire <code>q[0]</code> or <code>q[1]</code>. The gate will lock into place.
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-blue-100">
              <span className="font-bold text-[#0f62fe] block mb-1">3. Click Gate to Edit</span>
              Clicking any placed gate opens its <strong>Gate Inspector</strong>, where you can modify angles, change control wires, or delete it.
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-blue-100">
              <span className="font-bold text-[#0f62fe] block mb-1">4. Step & Observe</span>
              Use the <strong>t = step</strong> scrubber arrows to watch the statevector transform step-by-step in real time!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
