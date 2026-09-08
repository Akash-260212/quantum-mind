import { Complex } from './complex';

export type GateType = 
  | 'H' 
  | 'X' 
  | 'Y' 
  | 'Z' 
  | 'S' 
  | 'T' 
  | 'RX' 
  | 'RY' 
  | 'RZ' 
  | 'CNOT' 
  | 'CZ' 
  | 'SWAP' 
  | 'M';

export interface GateInfo {
  type: GateType;
  name: string;
  symbol: string;
  category: 'superposition' | 'pauli' | 'phase' | 'rotation' | 'entanglement' | 'measurement';
  description: string;
  matrixLatex: string;
  numQubits: number;
  color: string;
  borderColor: string;
  glowColor: string;
  hasAngleParam?: boolean;
}

export interface CircuitGate {
  id: string;
  type: GateType;
  step: number;
  qubit: number; // Primary target wire
  controlQubit?: number; // For CNOT, CZ
  targetQubit?: number; // For SWAP
  angle?: number; // For RX, RY, RZ in radians
}

export interface BlochCoords {
  x: number;
  y: number;
  z: number;
  theta: number; // polar angle [0, PI]
  phi: number;   // azimuth angle [0, 2*PI]
  pure: boolean; // whether single qubit is in pure or mixed (entangled) state
}

export interface QuantumState {
  statevector: Complex[];
  probabilities: number[];
  blochCoords: Record<number, BlochCoords>;
  diracRepresentation: string;
  isEntangled: boolean;
  stepIndex: number;
}

export interface SimulationResult {
  stepStates: QuantumState[];
  finalState: QuantumState;
  measurementShots: Record<string, number>;
  totalShots: number;
}

export interface MisconceptionMetric {
  id: string;
  title: string;
  description: string;
  category: 'phase' | 'entanglement' | 'superposition' | 'measurement';
  errorCount: number;
  lastEncountered?: string;
  remedialChallengeId?: string;
}

export interface LearnerProfile {
  xp: number;
  level: number;
  streak: number;
  completedPuzzles: string[];
  predictionsMade: number;
  accuratePredictions: number;
  misconceptions: Record<string, number>;
  masteryScores: {
    superposition: number;
    entanglement: number;
    phaseDynamics: number;
    measurement: number;
  };
}

export interface DebugChallenge {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  story: string;
  objective: string;
  faultyCircuit: {
    numQubits: number;
    gates: Array<Omit<CircuitGate, 'id'>>;
  };
  expectedOutput: {
    targetState: string; // e.g., (|00> + |11>) / sqrt(2)
    expectedProbabilities?: Record<string, number>;
    description: string;
  };
  hints: string[];
  solutionExplanation: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export interface CohortStudentStats {
  id: string;
  name: string;
  avatar: string;
  masteryScore: number;
  totalAttempts: number;
  topMisconception: string;
  status: 'needs_help' | 'on_track' | 'advanced';
}

export interface CohortMisconceptionItem {
  conceptId: string;
  conceptName: string;
  category: 'Phase Dynamics' | 'Entanglement' | 'Superposition' | 'Measurement' | 'Multi-Qubit';
  errorPercentage: number;
  studentsAffected: number;
  severity: 'low' | 'medium' | 'high';
  frequentWrongGate: string;
  suggestedAction: string;
}

export interface CohortAnalytics {
  cohortName: string;
  totalStudents: number;
  averageAccuracy: number;
  criticalMisconceptionsCount: number;
  misconceptions: CohortMisconceptionItem[];
  students: CohortStudentStats[];
}

export interface AdaptiveChallengeRecommendation {
  challengeId: string;
  challengeTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  reason: string;
  relatedMisconception: string;
  urgency: 'high' | 'medium' | 'low';
}
