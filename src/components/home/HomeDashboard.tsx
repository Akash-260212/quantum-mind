import React from 'react';
import { sounds } from '../../utils/audio';
import {
  Layers,
  Compass,
  Bot,
  Wrench,
  ArrowRight,
  Sparkles,
  BookOpen,
  Cpu,
  GraduationCap
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (tab: 'composer' | 'bloch' | 'notes' | 'mentor' | 'challenges' | 'instructor') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-6">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-2xl p-8 bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-50 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#0f62fe]" />
              <span className="text-xs uppercase tracking-widest text-[#0f62fe] font-mono font-bold">
                Adaptive Quantum Learning Platform
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3 font-sans">
              Welcome to Quantum Mind
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              An interactive visual learning ecosystem. Build quantum circuits with drag-and-drop gates, explore 3D Bloch sphere vector rotations, study visual diagrams, and consult an intelligent AI mentor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => { sounds.playClick(); onNavigate('composer'); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0f62fe] hover:bg-[#0353e9] text-white font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              <span>Start in Composer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspaces Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#0f62fe]" />
          Choose a Learning Mode
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Circuit Composer */}
          <div
            onClick={() => { sounds.playClick(); onNavigate('composer'); }}
            className="group ibm-panel p-6 ibm-panel-hover cursor-pointer flex flex-col justify-between min-h-[210px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0f62fe] flex items-center justify-center mb-4 group-hover:bg-[#0f62fe] group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-[#0f62fe] transition-colors">
                Circuit Composer
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build circuits with named quantum gates, click any placed gate to edit angles or control wires, and inspect statevectors step-by-step.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#0f62fe] font-semibold pt-4">
              <span>Open Composer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Interactive Bloch Sphere */}
          <div
            onClick={() => { sounds.playClick(); onNavigate('bloch'); }}
            className="group ibm-panel p-6 ibm-panel-hover cursor-pointer flex flex-col justify-between min-h-[210px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#007d79] flex items-center justify-center mb-4 group-hover:bg-[#007d79] group-hover:text-white transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-[#007d79] transition-colors">
                Interactive 3D Bloch Sphere
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directly rotate statevectors by clicking pole buttons (|0⟩, |1⟩, |+⟩, |-⟩) or dragging angles θ and φ to see coordinates update live.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#007d79] font-semibold pt-4">
              <span>Explore Bloch Sphere</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Learning Notes & Diagrams */}
          <div
            onClick={() => { sounds.playClick(); onNavigate('notes'); }}
            className="group ibm-panel p-6 ibm-panel-hover cursor-pointer flex flex-col justify-between min-h-[210px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-emerald-600 transition-colors">
                Visual Learning Notes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear conceptual notes with diagrams explaining qubits, wave interference, Bell state entanglement, and gate matrices in simple language.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold pt-4">
              <span>Read Notes & Diagrams</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Deep AI Quantum Mentor */}
          <div
            onClick={() => { sounds.playClick(); onNavigate('mentor'); }}
            className="group ibm-panel p-6 ibm-panel-hover cursor-pointer flex flex-col justify-between min-h-[210px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-[#8a3ffc] flex items-center justify-center mb-4 group-hover:bg-[#8a3ffc] group-hover:text-white transition-colors">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-[#8a3ffc] transition-colors">
                AI Quantum Mentor
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Organized quantum assistant covering foundational physics, gate transformations, Shor's and Grover's algorithms, and hardware architectures.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#8a3ffc] font-semibold pt-4">
              <span>Ask Quantum Mentor</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Guided Algorithm Challenges */}
          <div
            onClick={() => { sounds.playClick(); onNavigate('challenges'); }}
            className="group ibm-panel p-6 ibm-panel-hover cursor-pointer flex flex-col justify-between min-h-[210px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-amber-600 transition-colors">
                Guided Challenges
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hands-on reverse learning: inspect intentionally faulted quantum circuits, follow progressive pedagogical hints, and repair the quantum state.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold pt-4">
              <span>Solve Challenges</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Teacher & Faculty Analytics */}
          <div
            onClick={() => { sounds.playClick(); onNavigate('instructor'); }}
            className="group ibm-panel p-6 ibm-panel-hover cursor-pointer flex flex-col justify-between min-h-[210px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-4 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Faculty Analytics
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                  Classroom
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aggregate class-wide misconception heatmap, cohort mistake distributions, and actionable pedagogical teaching tips for educators.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-700 font-semibold pt-4">
              <span>Open Faculty View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
