import React from 'react';
import { GATE_REGISTRY } from '../../quantum/gates';
import { GateType, GateInfo } from '../../quantum/types';
import { sounds } from '../../utils/audio';
import { Sliders, HelpCircle, X, MousePointerClick } from 'lucide-react';

interface GatePaletteProps {
  selectedGateType: GateType | null;
  onSelectGateType: (gate: GateType | null) => void;
  selectedAngle: number;
  onAngleChange: (angle: number) => void;
  hoveredGateInfo: GateInfo | null;
  setHoveredGateInfo: (info: GateInfo | null) => void;
}

export const GatePalette: React.FC<GatePaletteProps> = ({
  selectedGateType,
  onSelectGateType,
  selectedAngle,
  onAngleChange,
  hoveredGateInfo,
  setHoveredGateInfo
}) => {
  const handleGateClick = (gateType: GateType) => {
    sounds.playClick();
    onSelectGateType(selectedGateType === gateType ? null : gateType);
  };

  const gateGroups = [
    {
      title: 'Superposition & Pauli',
      gates: ['H', 'X', 'Y', 'Z'] as GateType[]
    },
    {
      title: 'Phase Logic',
      gates: ['S', 'T'] as GateType[]
    },
    {
      title: 'Parametric Rotations',
      gates: ['RX', 'RY', 'RZ'] as GateType[]
    },
    {
      title: 'Multi-Qubit Entanglers',
      gates: ['CNOT', 'CZ', 'SWAP'] as GateType[]
    },
    {
      title: 'Measurement',
      gates: ['M'] as GateType[]
    }
  ];

  return (
    <div className="flex flex-col gap-3.5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      {/* Header with clear onboarding prompt */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-50 text-[#0f62fe]">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Step 1: Choose a Quantum Gate
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any gate below, then click any slot on the wire grid to place it.
            </p>
          </div>
        </div>

        {selectedGateType && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Active: {GATE_REGISTRY[selectedGateType]?.name}
            </span>
            <button
              onClick={() => onSelectGateType(null)}
              className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Grouped Gates Bar */}
      <div className="flex flex-wrap items-start gap-4 pt-1">
        {gateGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-500 font-semibold font-mono uppercase tracking-wide">
              {group.title}
            </span>
            <div className="flex items-center gap-1.5">
              {group.gates.map((type) => {
                const gate = GATE_REGISTRY[type];
                const isSelected = selectedGateType === type;

                return (
                  <button
                    key={type}
                    onClick={() => handleGateClick(type)}
                    onMouseEnter={() => setHoveredGateInfo(gate)}
                    onMouseLeave={() => setHoveredGateInfo(null)}
                    className={`h-10 min-w-[42px] px-2.5 rounded-lg flex items-center justify-center font-mono font-bold text-xs border shadow-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#0f62fe] ring-offset-2 scale-105 shadow-md brightness-110'
                        : `${gate.color} hover:brightness-110 hover:-translate-y-0.5`
                    }`}
                    title={`${gate.name}: ${gate.description}`}
                  >
                    {gate.symbol}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rotation Angle Parameter Slider */}
      {selectedGateType && GATE_REGISTRY[selectedGateType]?.hasAngleParam && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs mt-1">
          <span className="text-slate-700 font-mono font-semibold flex items-center gap-1.5 shrink-0">
            <Sliders className="w-3.5 h-3.5 text-[#0f62fe]" />
            Rotation Angle θ:
          </span>
          <input
            type="range"
            min="0"
            max={2 * Math.PI}
            step="0.05"
            value={selectedAngle}
            onChange={(e) => onAngleChange(parseFloat(e.target.value))}
            className="flex-1 accent-[#0f62fe] cursor-pointer"
          />
          <span className="font-mono text-[#0f62fe] font-bold w-24 text-right">
            {(selectedAngle / Math.PI).toFixed(2)}π rad ({(selectedAngle * (180 / Math.PI)).toFixed(0)}°)
          </span>
        </div>
      )}

      {/* Informative Tooltip Bar */}
      {hoveredGateInfo && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-slate-800">
          <HelpCircle className="w-4 h-4 text-[#0f62fe] shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between font-mono font-bold text-slate-900 mb-0.5">
              <span className="text-[#0f62fe]">{hoveredGateInfo.name} ({hoveredGateInfo.symbol})</span>
              <span className="text-[11px] text-slate-600 font-mono bg-white px-2 py-0.5 rounded border border-blue-200">
                Matrix: {hoveredGateInfo.matrixLatex}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">{hoveredGateInfo.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
