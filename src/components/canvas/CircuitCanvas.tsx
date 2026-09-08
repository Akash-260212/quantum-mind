import React, { useState } from 'react';
import { CircuitGate, GateType } from '../../quantum/types';
import { GATE_REGISTRY } from '../../quantum/gates';
import { sounds } from '../../utils/audio';
import { X, Check, Sliders, Trash2, Info, ArrowUpDown } from 'lucide-react';

interface CircuitCanvasProps {
  numQubits: number;
  numSteps: number;
  gates: CircuitGate[];
  selectedGateType: GateType | null;
  selectedAngle: number;
  onAddGate: (gate: CircuitGate) => void;
  onRemoveGate: (gateId: string) => void;
  onUpdateGate: (gate: CircuitGate) => void;
  currentStepIndex: number;
  onSelectStep: (step: number) => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  numQubits,
  numSteps,
  gates,
  selectedGateType,
  selectedAngle,
  onAddGate,
  onRemoveGate,
  onUpdateGate,
  currentStepIndex,
  onSelectStep
}) => {
  const [inspectingGate, setInspectingGate] = useState<CircuitGate | null>(null);

  const handleCellClick = (qubit: number, step: number) => {
    // Check if a gate already exists in this cell
    const existingGate = gates.find(g => g.qubit === qubit && g.step === step);
    if (existingGate) {
      sounds.playClick();
      setInspectingGate(existingGate);
      return;
    }

    // Check if cell is occupied by a multi-qubit control wire
    const multiGate = gates.find(g => g.step === step && (g.controlQubit === qubit || g.targetQubit === qubit));
    if (multiGate) {
      sounds.playClick();
      setInspectingGate(multiGate);
      return;
    }

    // If a gate is selected from the palette, place it!
    if (selectedGateType) {
      sounds.playGatePlace();
      const newGate: CircuitGate = {
        id: `gate_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        type: selectedGateType,
        qubit,
        step,
        angle: GATE_REGISTRY[selectedGateType]?.hasAngleParam ? selectedAngle : undefined,
        controlQubit: selectedGateType === 'CNOT' || selectedGateType === 'CZ'
          ? (qubit === 0 ? 1 : 0)
          : undefined,
        targetQubit: selectedGateType === 'SWAP'
          ? (qubit === 0 ? 1 : 0)
          : undefined
      };
      onAddGate(newGate);
      setInspectingGate(newGate);
    }
  };

  return (
    <div className="relative flex flex-col bg-white border border-slate-200 rounded-xl p-6 shadow-sm select-none overflow-x-auto">
      {/* Step Header Timeline */}
      <div className="flex items-center min-w-max pl-24 pr-8 pb-3 border-b border-slate-200">
        {Array.from({ length: numSteps }).map((_, stepIdx) => (
          <div
            key={stepIdx}
            onClick={() => { sounds.playClick(); onSelectStep(stepIdx + 1); }}
            className={`w-20 text-center cursor-pointer transition-colors ${
              currentStepIndex === stepIdx + 1
                ? 'text-[#0f62fe] font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className="text-xs font-mono">
              Step {stepIdx}
            </div>
            <div
              className={`h-1 rounded-full mx-auto mt-1 transition-all ${
                currentStepIndex === stepIdx + 1 ? 'w-8 bg-[#0f62fe]' : 'w-2 bg-slate-200'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Circuit Grid */}
      <div className="relative flex flex-col gap-8 pt-6 min-w-max pb-3">
        {/* Step Scrubber Vertical Beam */}
        {currentStepIndex > 0 && currentStepIndex <= numSteps && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none transition-all duration-200 z-0"
            style={{
              left: `${96 + (currentStepIndex - 1) * 80 + 40 - 22}px`,
              width: '44px'
            }}
          >
            <div className="w-full h-full bg-blue-50 border-x-2 border-blue-400 rounded-sm" />
          </div>
        )}

        {/* Multi-qubit connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {gates.map((g) => {
            if (g.controlQubit !== undefined && (g.type === 'CNOT' || g.type === 'CZ')) {
              const startY = 24 + g.controlQubit * (48 + 32) + 24;
              const endY = 24 + g.qubit * (48 + 32) + 24;
              const x = 96 + g.step * 80 + 40;
              return (
                <g key={`wire_${g.id}`}>
                  <line
                    x1={x}
                    y1={startY}
                    x2={x}
                    y2={endY}
                    stroke="#002d9c"
                    strokeWidth="3"
                  />
                  {/* Control dot */}
                  <circle
                    cx={x}
                    cy={startY}
                    r="6"
                    fill="#002d9c"
                  />
                </g>
              );
            }
            if (g.targetQubit !== undefined && g.type === 'SWAP') {
              const startY = 24 + g.qubit * (48 + 32) + 24;
              const endY = 24 + g.targetQubit * (48 + 32) + 24;
              const x = 96 + g.step * 80 + 40;
              return (
                <g key={`swap_${g.id}`}>
                  <line
                    x1={x}
                    y1={startY}
                    x2={x}
                    y2={endY}
                    stroke="#0072c3"
                    strokeWidth="2.5"
                  />
                  <line x1={x - 5} y1={startY - 5} x2={x + 5} y2={startY + 5} stroke="#0072c3" strokeWidth="2.5" />
                  <line x1={x - 5} y1={startY + 5} x2={x + 5} y2={startY - 5} stroke="#0072c3" strokeWidth="2.5" />
                  <line x1={x - 5} y1={endY - 5} x2={x + 5} y2={endY + 5} stroke="#0072c3" strokeWidth="2.5" />
                  <line x1={x - 5} y1={endY + 5} x2={x + 5} y2={endY - 5} stroke="#0072c3" strokeWidth="2.5" />
                </g>
              );
            }
            return null;
          })}
        </svg>

        {/* Qubit Horizontal Wires */}
        {Array.from({ length: numQubits }).map((_, qubitIdx) => (
          <div key={qubitIdx} className="flex items-center h-12 relative z-10">
            {/* Qubit Wire Label */}
            <div className="w-24 pr-4 flex items-center justify-between font-mono">
              <div className="flex items-center px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-xs">
                q[{qubitIdx}]
              </div>
              <span className="text-xs font-semibold text-slate-400">|0⟩</span>
            </div>

            {/* Wire Line and Gate Slots */}
            <div className="relative flex items-center flex-1">
              {/* Copper-Slate Horizontal Wire */}
              <div className="absolute left-0 right-0 h-[2px] bg-slate-300 -z-10" />

              {/* Slot Cells */}
              <div className="flex items-center">
                {Array.from({ length: numSteps }).map((_, stepIdx) => {
                  const gate = gates.find(g => g.qubit === qubitIdx && g.step === stepIdx);
                  const isControl = gates.some(g => g.controlQubit === qubitIdx && g.step === stepIdx);
                  const isSwapTarget = gates.some(g => g.targetQubit === qubitIdx && g.step === stepIdx && g.type === 'SWAP');
                  const isInspected = inspectingGate?.id === gate?.id;

                  return (
                    <div
                      key={stepIdx}
                      onClick={() => handleCellClick(qubitIdx, stepIdx)}
                      className="w-20 h-12 flex items-center justify-center relative group cursor-pointer"
                    >
                      {/* Empty Slot Placeholder */}
                      {!gate && !isControl && !isSwapTarget && (
                        <div className={`w-9 h-9 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${
                          selectedGateType
                            ? 'border-blue-400 bg-blue-50/80 scale-105'
                            : 'border-transparent group-hover:border-slate-300 group-hover:bg-slate-50'
                        }`}>
                          {selectedGateType ? (
                            <span className="text-xs font-mono font-bold text-[#0f62fe]">
                              {GATE_REGISTRY[selectedGateType]?.symbol}
                            </span>
                          ) : (
                            <span className="text-slate-300 group-hover:text-slate-500 font-bold text-sm">+</span>
                          )}
                        </div>
                      )}

                      {/* Render Placed Gate */}
                      {gate && (
                        <div
                          className={`relative z-20 min-w-[46px] max-w-[66px] px-1.5 h-10 rounded-lg flex flex-col items-center justify-center font-mono font-bold text-[10px] border shadow-xs transition-transform hover:scale-105 select-none ${
                            isInspected ? 'ring-2 ring-[#0f62fe] ring-offset-2 scale-105' : ''
                          } ${
                            gate.type === 'CNOT'
                              ? 'bg-[#002d9c] text-white border-[#001d6c]'
                              : gate.type === 'CZ'
                              ? 'bg-[#0f62fe] text-white border-[#0043ce]'
                              : gate.type === 'SWAP'
                              ? 'bg-[#0072c3] text-white border-[#00539a]'
                              : GATE_REGISTRY[gate.type]?.color || 'bg-blue-600 text-white border-blue-700'
                          }`}
                          title={`${GATE_REGISTRY[gate.type]?.name || gate.type} (Click to inspect / edit)`}
                        >
                          {gate.type === 'CNOT' ? (
                            <span className="text-[11px] font-bold leading-none flex items-center gap-0.5">
                              <span className="text-sm">⊕</span>
                              <span>CNOT</span>
                            </span>
                          ) : gate.type === 'SWAP' ? (
                            <span className="text-[11px] font-bold leading-none flex items-center gap-0.5">
                              <span className="text-sm">✕</span>
                              <span>SWAP</span>
                            </span>
                          ) : (
                            <span className="leading-tight text-center tracking-tight truncate max-w-[58px]">
                              {GATE_REGISTRY[gate.type]?.symbol || gate.type}
                            </span>
                          )}

                          {gate.angle !== undefined && (
                            <span className="text-[8px] opacity-90 leading-none mt-0.5">
                              {(gate.angle / Math.PI).toFixed(1)}π
                            </span>
                          )}

                          {/* Quick Delete 'x' on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playAlert();
                              onRemoveGate(gate.id);
                              if (inspectingGate?.id === gate.id) setInspectingGate(null);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm"
                            title="Delete this gate"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {/* Control Wire Dot Placeholder */}
                      {isControl && !gate && (
                        <div className="w-4 h-4 rounded-full bg-[#002d9c] shadow-xs" />
                      )}

                      {/* SWAP Partner */}
                      {isSwapTarget && !gate && (
                        <div className="w-7 h-7 rounded bg-blue-50 border-2 border-[#0072c3] flex items-center justify-center text-xs font-mono font-bold text-[#0072c3]">
                          ✕
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IN-PLACE ACTIVE GATE INSPECTOR & EDITOR CARD */}
      {inspectingGate && (
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-300 text-xs flex flex-col gap-3 animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs ${GATE_REGISTRY[inspectingGate.type]?.color || 'bg-blue-600 text-white'}`}>
                {inspectingGate.type}
              </span>
              <div>
                <span className="font-bold text-slate-900 text-sm">
                  {GATE_REGISTRY[inspectingGate.type]?.name} Operator
                </span>
                <span className="text-slate-500 font-mono text-[11px] ml-2">
                  Placed on Wire q[{inspectingGate.qubit}], Step {inspectingGate.step}
                </span>
              </div>
            </div>

            <button
              onClick={() => setInspectingGate(null)}
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Explanation of what this gate does */}
          <div className="text-slate-600 leading-relaxed text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>What it does: </strong>
            {GATE_REGISTRY[inspectingGate.type]?.description}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* If rotation gate: show interactive angle slider */}
            {GATE_REGISTRY[inspectingGate.type]?.hasAngleParam && (
              <div className="flex items-center gap-3 flex-1">
                <span className="font-semibold text-slate-700 font-mono">Adjust Angle θ:</span>
                <input
                  type="range"
                  min="0"
                  max={2 * Math.PI}
                  step="0.05"
                  value={inspectingGate.angle || Math.PI / 2}
                  onChange={(e) => {
                    const newAngle = parseFloat(e.target.value);
                    const updated = { ...inspectingGate, angle: newAngle };
                    setInspectingGate(updated);
                    onUpdateGate(updated);
                  }}
                  className="flex-1 accent-[#0f62fe] cursor-pointer"
                />
                <span className="font-mono text-[#0f62fe] font-bold">
                  {((inspectingGate.angle || Math.PI / 2) / Math.PI).toFixed(2)}π rad
                </span>
              </div>
            )}

            {/* If 2-qubit gate: show control wire selector */}
            {(inspectingGate.type === 'CNOT' || inspectingGate.type === 'CZ' || inspectingGate.type === 'SWAP') && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Select Control Wire:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: numQubits }).map((_, q) => {
                    if (q === inspectingGate.qubit) return null;
                    const isSelected = inspectingGate.controlQubit === q || inspectingGate.targetQubit === q;
                    return (
                      <button
                        key={q}
                        onClick={() => {
                          sounds.playClick();
                          const updated = {
                            ...inspectingGate,
                            controlQubit: inspectingGate.type !== 'SWAP' ? q : undefined,
                            targetQubit: inspectingGate.type === 'SWAP' ? q : undefined
                          };
                          setInspectingGate(updated);
                          onUpdateGate(updated);
                        }}
                        className={`px-2.5 py-1 rounded font-mono text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#0f62fe] text-white font-bold'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        q[{q}]
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delete button */}
            <button
              onClick={() => {
                sounds.playAlert();
                onRemoveGate(inspectingGate.id);
                setInspectingGate(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium text-xs transition-colors cursor-pointer ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Gate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
