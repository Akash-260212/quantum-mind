import React, { useState } from 'react';
import { CircuitGate } from '../../quantum/types';
import { generateCirqCode, generateOpenQASM, generateQiskitCode } from '../../quantum/ast';
import { sounds } from '../../utils/audio';
import { Code2, Copy, Check, Download, FileCode, Terminal } from 'lucide-react';

interface CodeSyncPanelProps {
  numQubits: number;
  gates: CircuitGate[];
}

export const CodeSyncPanel: React.FC<CodeSyncPanelProps> = ({ numQubits, gates }) => {
  const [activeSdk, setActiveSdk] = useState<'qiskit' | 'cirq' | 'qasm'>('qiskit');
  const [copied, setCopied] = useState<boolean>(false);

  const getCode = () => {
    switch (activeSdk) {
      case 'qiskit':
        return generateQiskitCode(numQubits, gates);
      case 'cirq':
        return generateCirqCode(numQubits, gates);
      case 'qasm':
        return generateOpenQASM(numQubits, gates);
    }
  };

  const codeText = getCode();

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sounds.playSuccess();
    const ext = activeSdk === 'qasm' ? 'qasm' : 'py';
    const filename = `quantum_circuit_${activeSdk}.${ext}`;
    const blob = new Blob([codeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#121726] border border-[#1f293d] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1f293d]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Quantum Code Export</h3>
            <p className="text-[11px] text-slate-400">Live synchronized export for IBM Qiskit, Google Cirq, and OpenQASM 3.0</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161c2e] hover:bg-[#212738] border border-[#27314a] text-xs text-slate-200 transition-colors cursor-pointer"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f62fe] hover:bg-[#0353e9] text-xs text-white transition-colors cursor-pointer"
            title="Download Script"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .{activeSdk === 'qasm' ? 'qasm' : 'py'}</span>
          </button>
        </div>
      </div>

      {/* SDK Tabs */}
      <div className="flex items-center gap-2 py-3">
        <button
          onClick={() => { sounds.playClick(); setActiveSdk('qiskit'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeSdk === 'qiskit'
              ? 'bg-[#0f62fe] text-white'
              : 'bg-[#161c2e] border border-[#27314a] text-slate-300 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>IBM Qiskit 1.0 (Python)</span>
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveSdk('qasm'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeSdk === 'qasm'
              ? 'bg-[#0f62fe] text-white'
              : 'bg-[#161c2e] border border-[#27314a] text-slate-300 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>OpenQASM 3.0</span>
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveSdk('cirq'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeSdk === 'cirq'
              ? 'bg-[#0f62fe] text-white'
              : 'bg-[#161c2e] border border-[#27314a] text-slate-300 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Google Cirq (Python)</span>
        </button>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 relative rounded-lg overflow-hidden bg-[#0b0f19] border border-[#1f293d] p-4">
        <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-auto max-h-[460px]">
          <code>{codeText}</code>
        </pre>
      </div>

      {/* Footer Info */}
      <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between font-mono">
        <span>Production compatible with IBM Quantum Qiskit Runtime and Aer Simulator.</span>
        <span>Total Operations: {gates.length}</span>
      </div>
    </div>
  );
};
