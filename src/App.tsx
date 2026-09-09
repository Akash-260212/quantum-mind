import React, { useState, useMemo, useEffect } from 'react';
import { CircuitGate, GateType, GateInfo, SimulationResult } from './quantum/types';
import { QuantumSimulator } from './quantum/simulator';
import { GATE_REGISTRY } from './quantum/gates';
import { PRESET_ALGORITHMS } from './quantum/ast';
import { sounds } from './utils/audio';

// Components
import { HomeDashboard } from './components/home/HomeDashboard';
import { CircuitCanvas } from './components/canvas/CircuitCanvas';
import { GatePalette } from './components/canvas/GatePalette';
import { CircuitToolbar } from './components/canvas/CircuitToolbar';
import { BlochSphere3D } from './components/bloch/BlochSphere3D';
import { StateVisualizer } from './components/simulation/StateVisualizer';
import { AiMentorPanel } from './components/mentor/AiMentorPanel';
import { LearningNotes } from './components/notes/LearningNotes';
import { InstructorDashboard } from './components/instructor/InstructorDashboard';
import { PredictModal } from './components/predict/PredictModal';
import { DebugSandbox } from './components/sandbox/DebugSandbox';
import { copyShareableLink, decodeCircuitFromHash } from './utils/sharing';

// Icons
import {
  Home,
  Layers,
  Compass,
  Bot,
  Wrench,
  BookOpen,
  GraduationCap,
  Volume2,
  VolumeX,
  BrainCircuit,
  ArrowRight,
  Info,
  Sparkles,
  ChevronDown,
  Activity,
  Atom,
  Share2,
  Wifi
} from 'lucide-react';

export function App() {
  // Navigation: Starts on 'home' screen by default!
  const [activeTab, setActiveTab] = useState<'home' | 'composer' | 'bloch' | 'notes' | 'mentor' | 'challenges' | 'instructor'>('home');
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Circuit Dimensions & State
  const [numQubits, setNumQubits] = useState<number>(2);
  const [numSteps, setNumSteps] = useState<number>(6);
  const [gates, setGates] = useState<CircuitGate[]>([
    { id: 'g0', type: 'H', step: 0, qubit: 0 },
    { id: 'g1', type: 'CNOT', step: 1, qubit: 1, controlQubit: 0 }
  ]);

  // Gate selection for canvas placement
  const [selectedGateType, setSelectedGateType] = useState<GateType | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<number>(Math.PI / 2);
  const [hoveredGateInfo, setHoveredGateInfo] = useState<GateInfo | null>(null);

  // Collapsible algorithm presets section in Composer
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);

  // Time-step simulation scrubber
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(2);
  const [selectedBlochQubit, setSelectedBlochQubit] = useState<number>(0);

  // Sound & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPredictModalOpen, setIsPredictModalOpen] = useState<boolean>(false);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>(['broken-bell']);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [backendEngineName, setBackendEngineName] = useState<string>('Client Simulation');

  // Quantum Simulation Engine instance
  const simulator = useMemo(() => new QuantumSimulator(), []);

  // Run simulation whenever circuit gates or dimensions change
  const [simulationResult, setSimulationResult] = useState<SimulationResult>(() => {
    return simulator.simulate(numQubits, numSteps, gates);
  });

  const runSimulation = () => {
    const res = simulator.simulate(numQubits, numSteps, gates);
    setSimulationResult(res);
  };

  useEffect(() => {
    runSimulation();
  }, [numQubits, numSteps, gates]);

  // Periodic Backend Health Check
  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      try {
        const { checkBackendHealth } = await import('./services/api');
        const status = await checkBackendHealth();
        if (mounted) {
          setBackendOnline(status.online);
          if (status.online) {
            setBackendEngineName('IBM Qiskit 2.5');
          } else {
            setBackendEngineName('Client Engine');
          }
        }
      } catch {
        if (mounted) setBackendOnline(false);
      }
    };
    probe();
    const interval = setInterval(probe, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Decode shared circuit from URL hash on mount
  useEffect(() => {
    const decoded = decodeCircuitFromHash();
    if (decoded) {
      setNumQubits(decoded.numQubits);
      setNumSteps(decoded.numSteps);
      setGates(decoded.gates);
      setCurrentStepIndex(decoded.gates.length);
      setActiveTab('composer');
      setShareToast('Shared Quantum Circuit Loaded from Link!');
      setTimeout(() => setShareToast(null), 4000);
    }
  }, []);

  const handleShareCircuit = async () => {
    sounds.playSuccess();
    try {
      const { saveCircuitToCloud } = await import('./services/api');
      await saveCircuitToCloud({
        title: 'User Circuit',
        num_qubits: numQubits,
        circuit_data: { numQubits, numSteps, gates }
      });
    } catch {
      // Offline fallback still works seamlessly via URL hash
    }
    await copyShareableLink(numQubits, numSteps, gates);
    setShareToast('Shareable Circuit Link Copied to Clipboard!');
    setTimeout(() => setShareToast(null), 3500);
  };

  // Current state at scrubber step
  const currentState = simulationResult.stepStates[currentStepIndex] || simulationResult.finalState;

  // Active step gate explanation
  const stepGate = currentStepIndex > 0 ? gates.find(g => g.step === currentStepIndex - 1) : null;

  // Gate Add/Remove/Update handlers
  const handleAddGate = (newGate: CircuitGate) => {
    setGates(prev => [...prev.filter(g => !(g.qubit === newGate.qubit && g.step === newGate.step)), newGate]);
  };

  const handleRemoveGate = (gateId: string) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
  };

  const handleUpdateGate = (updatedGate: CircuitGate) => {
    setGates(prev => prev.map(g => g.id === updatedGate.id ? updatedGate : g));
  };

  const handleClearCircuit = () => {
    setGates([]);
    setCurrentStepIndex(0);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_ALGORITHMS.find(p => p.id === presetId);
    if (!preset) return;
    setNumQubits(preset.numQubits);
    setNumSteps(preset.numSteps);
    setGates(preset.gates);
    setCurrentStepIndex(preset.gates.length);
  };

  const handleResampleShots = () => {
    runSimulation();
  };

  const handleChallengeCompleted = (challengeId: string) => {
    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges(prev => [...prev, challengeId]);
    }
  };

  const handleToggleSound = () => {
    const state = sounds.toggleSound();
    setSoundEnabled(state);
  };

  const handleApplyGateDirectFromBloch = (gateType: 'H' | 'X' | 'Y' | 'Z' | 'S' | 'RESET') => {
    sounds.playClick();
    if (gateType === 'RESET') {
      setGates(prev => prev.filter(g => g.qubit !== selectedBlochQubit && g.controlQubit !== selectedBlochQubit));
      return;
    }
    const existingStepsOnQubit = gates
      .filter(g => g.qubit === selectedBlochQubit || g.controlQubit === selectedBlochQubit)
      .map(g => g.step);

    let nextStep = 0;
    while (existingStepsOnQubit.includes(nextStep) && nextStep < numSteps) {
      nextStep++;
    }
    if (nextStep >= numSteps) {
      setNumSteps(prev => Math.min(10, prev + 1));
    }
    const newGate: CircuitGate = {
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: gateType,
      step: nextStep,
      qubit: selectedBlochQubit
    };
    handleAddGate(newGate);
    setCurrentStepIndex(nextStep + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 quantum-grid-bg">
      {/* Top Navigation Bar - Clean Light IBM Theme */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 lg:px-8 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Brand Logo */}
          <div
            onClick={() => { sounds.playClick(); setActiveTab('home'); }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0f62fe] text-white flex items-center justify-center font-mono font-bold text-base shadow-sm">
              Ψ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                  Quantum Mind
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Studio
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('home'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white text-[#0f62fe] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setActiveTab('composer'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'composer'
                  ? 'bg-white text-[#0f62fe] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Composer</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setActiveTab('bloch'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'bloch'
                  ? 'bg-white text-[#0f62fe] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Bloch Sphere</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setActiveTab('notes'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-white text-[#0f62fe] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learning Notes</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setActiveTab('mentor'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'mentor'
                  ? 'bg-white text-[#0f62fe] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Mentor</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setActiveTab('challenges'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'challenges'
                  ? 'bg-white text-[#0f62fe] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Challenges</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); setActiveTab('instructor'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'instructor'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Teacher Misconception Heatmap & Cohort Telemetry"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>Faculty Analytics</span>
              <span className="text-[9px] font-mono px-1 rounded bg-purple-100 text-purple-800 font-bold">New</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Share Circuit Link */}
            <button
              onClick={handleShareCircuit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f62fe] border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Copy shareable circuit link for judges or peers"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Dynamic Backend Engine / Offline Status Badge */}
            <div
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold ${
                backendOnline
                  ? 'bg-blue-50 border-blue-200 text-[#0f62fe]'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
              title={backendOnline ? 'FastAPI + IBM Qiskit 2.5 Connected' : 'Deterministic client simulation running (zero latency)'}
            >
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{backendOnline ? 'IBM Qiskit 2.5 Active' : 'Offline WASM Ready'}</span>
            </div>

            <button
              onClick={() => { sounds.playClick(); setIsPredictModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Active Recall: Forecast state before simulation"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Active Recall</span>
            </button>

            <button
              onClick={handleToggleSound}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#0f62fe]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around mt-2 pt-2 border-t border-slate-200 text-xs">
          <button onClick={() => setActiveTab('home')} className={`p-1 font-semibold ${activeTab === 'home' ? 'text-[#0f62fe]' : 'text-slate-600'}`}>Home</button>
          <button onClick={() => setActiveTab('composer')} className={`p-1 font-semibold ${activeTab === 'composer' ? 'text-[#0f62fe]' : 'text-slate-600'}`}>Composer</button>
          <button onClick={() => setActiveTab('bloch')} className={`p-1 font-semibold ${activeTab === 'bloch' ? 'text-[#0f62fe]' : 'text-slate-600'}`}>Bloch</button>
          <button onClick={() => setActiveTab('notes')} className={`p-1 font-semibold ${activeTab === 'notes' ? 'text-[#0f62fe]' : 'text-slate-600'}`}>Notes</button>
          <button onClick={() => setActiveTab('mentor')} className={`p-1 font-semibold ${activeTab === 'mentor' ? 'text-[#0f62fe]' : 'text-slate-600'}`}>AI Mentor</button>
          <button onClick={() => setActiveTab('challenges')} className={`p-1 font-semibold ${activeTab === 'challenges' ? 'text-[#0f62fe]' : 'text-slate-600'}`}>Challenges</button>
          <button onClick={() => setActiveTab('instructor')} className={`p-1 font-semibold ${activeTab === 'instructor' ? 'text-purple-600' : 'text-slate-600'}`}>Faculty</button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col max-w-7xl mx-auto w-full">
        {/* VIEW 1: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <HomeDashboard
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* VIEW 2: CIRCUIT COMPOSER */}
        {activeTab === 'composer' && (
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <CircuitToolbar
              numQubits={numQubits}
              onAddQubit={() => setNumQubits(prev => Math.min(5, prev + 1))}
              onRemoveQubit={() => setNumQubits(prev => Math.max(1, prev - 1))}
              numSteps={numSteps}
              onAddStep={() => setNumSteps(prev => Math.min(10, prev + 1))}
              onRemoveStep={() => setNumSteps(prev => Math.max(3, prev - 1))}
              onClearCircuit={handleClearCircuit}
              onLoadPreset={handleLoadPreset}
              currentStepIndex={currentStepIndex}
              maxStepIndex={numSteps}
              onStepChange={setCurrentStepIndex}
              onRunSimulation={runSimulation}
              onOpenPredictModal={() => setIsPredictModalOpen(true)}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onShareCircuit={handleShareCircuit}
            />

            {/* CLEAN STATEVECTOR & PHASE BANNER (IBM Style) */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-500 font-bold text-[11px] uppercase">Statevector |ψ⟩:</span>
                <span className="font-mono font-bold text-[#0f62fe] text-xs bg-white px-2 py-0.5 rounded border border-blue-200">
                  {currentState.diracRepresentation}
                </span>
                {stepGate && (
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    (via {GATE_REGISTRY[stepGate.type]?.name || stepGate.type} on q[{stepGate.qubit}])
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className={`px-2 py-0.5 rounded font-semibold ${
                  currentState.isEntangled 
                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {currentState.isEntangled ? 'Entangled State' : 'Separable (Pure)'}
                </span>
              </div>
            </div>

            {/* Operations Palette */}
            <GatePalette
              selectedGateType={selectedGateType}
              onSelectGateType={setSelectedGateType}
              selectedAngle={selectedAngle}
              onAngleChange={setSelectedAngle}
              hoveredGateInfo={hoveredGateInfo}
              setHoveredGateInfo={setHoveredGateInfo}
            />

            {/* Visual Circuit Canvas with In-place Inspector */}
            <CircuitCanvas
              numQubits={numQubits}
              numSteps={numSteps}
              gates={gates}
              selectedGateType={selectedGateType}
              selectedAngle={selectedAngle}
              onAddGate={handleAddGate}
              onRemoveGate={handleRemoveGate}
              onUpdateGate={handleUpdateGate}
              currentStepIndex={currentStepIndex}
              onSelectStep={setCurrentStepIndex}
            />

            {/* Bottom 2-Column Split: State Probabilities & Pure State Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[380px] mt-1">
              <div className="h-[400px]">
                <StateVisualizer
                  currentState={currentState}
                  measurementShots={simulationResult.measurementShots}
                  totalShots={simulationResult.totalShots}
                  numQubits={numQubits}
                  onResampleShots={handleResampleShots}
                />
              </div>

              {/* State Vector & Dirac Analytics Panel */}
              <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <div className="flex items-center gap-2">
                      <Atom className="w-5 h-5 text-[#0f62fe]" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Live State Analysis</h3>
                        <p className="text-[11px] text-slate-500">Step {currentStepIndex} Quantum State Profile</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                      currentState.isEntangled
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {currentState.isEntangled ? '⚡ Entangled' : 'Separable'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Dirac Notation |ψ⟩
                      </span>
                      <div className="font-mono text-base font-bold text-[#0f62fe] mt-1 truncate">
                        {currentState.diracRepresentation}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">State Purity</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {currentState.isEntangled ? 'Mixed Subsystem' : '1.00 (Pure)'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">Active Wires</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">{numQubits} Qubits ({Math.pow(2, numQubits)} Dim)</span>
                      </div>
                    </div>

                    {/* Per-Qubit Bloch Polar Coordinates Summary */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Qubit Bloch Projections ⟨Z⟩
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {Array.from({ length: numQubits }).map((_, qIdx) => {
                          const c = currentState.blochCoords[qIdx] || { x: 0, y: 0, z: 1 };
                          return (
                            <div key={qIdx} className="p-2 rounded bg-slate-50 border border-slate-200 text-center font-mono">
                              <span className="text-[10px] text-slate-400 block">q[{qIdx}]</span>
                              <span className="text-xs font-bold text-slate-800">
                                Z: {c.z >= 0 ? `+${c.z.toFixed(2)}` : c.z.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-slate-700 mt-4 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#0f62fe] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Learner Tip:</strong> The amplitude coefficient squared gives the exact probability of finding the circuit in that computational basis state upon projective measurement.
                  </p>
                </div>
              </div>
            </div>

            {/* Collapsible Algorithm Presets Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs mt-2">
              <button
                onClick={() => { sounds.playClick(); setIsPresetsOpen(prev => !prev); }}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#0f62fe] border border-blue-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Foundational Algorithm Presets
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        {PRESET_ALGORITHMS.length} Available
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Click to explore and load foundational quantum circuits directly into your active composer.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f62fe] px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 group-hover:bg-blue-100 transition-colors">
                  <span>{isPresetsOpen ? 'Hide Presets' : 'Explore Presets'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPresetsOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isPresetsOpen && (
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {PRESET_ALGORITHMS.map(preset => (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/40 hover:border-blue-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-xs text-slate-900">{preset.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                            {preset.numQubits} Qubits
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">{preset.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          sounds.playSuccess();
                          handleLoadPreset(preset.id);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#0f62fe] text-slate-700 hover:text-white border border-slate-300 hover:border-[#0f62fe] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Load Circuit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: INTERACTIVE 3D BLOCH SPHERE */}
        {activeTab === 'bloch' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 min-h-[580px]">
              <BlochSphere3D
                blochCoordsRecord={currentState.blochCoords}
                numQubits={numQubits}
                selectedQubit={selectedBlochQubit}
                onSelectQubit={setSelectedBlochQubit}
                onAddQubit={() => setNumQubits(prev => Math.min(5, prev + 1))}
                onRemoveQubit={() => {
                  setNumQubits(prev => {
                    const next = Math.max(1, prev - 1);
                    if (selectedBlochQubit >= next) {
                      setSelectedBlochQubit(next - 1);
                    }
                    return next;
                  });
                }}
                onApplyGateDirect={handleApplyGateDirectFromBloch}
              />
            </div>
            <div className="flex flex-col gap-4">
              <StateVisualizer
                currentState={currentState}
                measurementShots={simulationResult.measurementShots}
                totalShots={simulationResult.totalShots}
                numQubits={numQubits}
                onResampleShots={handleResampleShots}
              />
            </div>
          </div>
        )}

        {/* VIEW 4: VISUAL LEARNING NOTES */}
        {activeTab === 'notes' && (
          <LearningNotes />
        )}

        {/* VIEW 5: DEEP AI QUANTUM MENTOR */}
        {activeTab === 'mentor' && (
          <div className="max-w-4xl mx-auto w-full min-h-[580px]">
            <AiMentorPanel
              currentStepIndex={currentStepIndex}
              gates={gates}
              currentState={currentState}
              numQubits={numQubits}
            />
          </div>
        )}

        {/* VIEW 6: GUIDED ALGORITHM CHALLENGES */}
        {activeTab === 'challenges' && (
          <DebugSandbox
            onChallengeCompleted={handleChallengeCompleted}
            completedChallenges={completedChallenges}
          />
        )}

        {/* VIEW 7: TEACHER & INSTRUCTOR DASHBOARD */}
        {activeTab === 'instructor' && (
          <InstructorDashboard />
        )}
      </main>

      {/* Floating Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Quantum Mind</span>
            <span>• Interactive Quantum Algorithm Learning Platform</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Deterministic In-Browser Quantum State Engine
          </div>
        </div>
      </footer>

      {/* Active Recall Predict Modal */}
      <PredictModal
        isOpen={isPredictModalOpen}
        onClose={() => setIsPredictModalOpen(false)}
        actualState={simulationResult.finalState}
        numQubits={numQubits}
        onPredictionEvaluated={() => {}}
      />
    </div>
  );
}

export default App;
