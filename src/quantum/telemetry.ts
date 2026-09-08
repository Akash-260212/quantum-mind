import {
  CohortAnalytics,
  LanguageOption,
  AdaptiveChallengeRecommendation
} from './types';
import { DEBUG_CHALLENGES } from './ast';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🇮🇳' }
];

/**
 * Class-wide aggregated cohort data for the Teacher / Instructor Dashboard
 */
export const COHORT_TELEMETRY_DATA: CohortAnalytics = {
  cohortName: 'Quantum Computing 101 — Semester Batch A (48 Students)',
  totalStudents: 48,
  averageAccuracy: 71.4,
  criticalMisconceptionsCount: 3,
  misconceptions: [
    {
      conceptId: 'cnot_inversion',
      conceptName: 'CNOT Control/Target Inversion',
      category: 'Entanglement',
      errorPercentage: 68.2,
      studentsAffected: 33,
      severity: 'high',
      frequentWrongGate: 'CNOT (q0 as target instead of control)',
      suggestedAction: 'Dedicate 10 minutes to explain that CX(q0, q1) modifies q1 conditional on q0 being |1⟩; control wire remains unchanged in the computational basis.'
    },
    {
      conceptId: 'phase_vs_bitflip',
      conceptName: 'Phase Flip vs. Bit Flip Confusion (Z vs. X)',
      category: 'Phase Dynamics',
      errorPercentage: 62.5,
      studentsAffected: 30,
      severity: 'high',
      frequentWrongGate: 'NOT (X) used instead of Phase (Z)',
      suggestedAction: 'Demonstrate that X|+⟩ = |+⟩ (eigenstate) on the 3D Bloch sphere, whereas Z|+⟩ = |-⟩ creates relative phase.'
    },
    {
      conceptId: 'premature_measurement',
      conceptName: 'Premature Wavefunction Collapse',
      category: 'Measurement',
      errorPercentage: 54.1,
      studentsAffected: 26,
      severity: 'high',
      frequentWrongGate: 'Measure placed mid-algorithm',
      suggestedAction: 'Emphasize that measurement destroys phase coherence and projects superposition irreversibly. Place measurements strictly at terminal step.'
    },
    {
      conceptId: 'phase_kickback_neglect',
      conceptName: 'Phase Kickback Eigenvalue Neglect',
      category: 'Phase Dynamics',
      errorPercentage: 43.8,
      studentsAffected: 21,
      severity: 'medium',
      frequentWrongGate: 'Target initialized in |0⟩ instead of |-⟩',
      suggestedAction: 'Review how eigenvalue (-1) transfers from target to control qubit in controlled-U operations (key for Deutsch-Jozsa & Grover).'
    },
    {
      conceptId: 'hadamard_superposition_bias',
      conceptName: 'Superposition Normalization Ambiguity',
      category: 'Superposition',
      errorPercentage: 29.2,
      studentsAffected: 14,
      severity: 'low',
      frequentWrongGate: 'Double Hadamard cancellation',
      suggestedAction: 'Highlight Hadamard involution: H² = I. Applying two successive H gates restores original ground state.'
    },
    {
      conceptId: 'multi_qubit_separable',
      conceptName: 'Separable vs. Entangled State Confusion',
      category: 'Multi-Qubit',
      errorPercentage: 25.0,
      studentsAffected: 12,
      severity: 'low',
      frequentWrongGate: 'Hadamard on both wires without 2-qubit gate',
      suggestedAction: 'Show that |++⟩ = (|00⟩+|01⟩+|10⟩+|11⟩)/2 is purely separable; true entanglement requires non-local correlation via CNOT/CZ.'
    }
  ],
  students: [
    { id: 's1', name: 'Aarav Sharma', avatar: '👨‍🎓', masteryScore: 88, totalAttempts: 24, topMisconception: 'None (Excelling)', status: 'advanced' },
    { id: 's2', name: 'Priya Patel', avatar: '👩‍🎓', masteryScore: 54, totalAttempts: 19, topMisconception: 'Phase vs Bit Flip', status: 'needs_help' },
    { id: 's3', name: 'Kavita Sundaram', avatar: '👩‍🎓', masteryScore: 62, totalAttempts: 22, topMisconception: 'CNOT Inversion', status: 'needs_help' },
    { id: 's4', name: 'Rohan Gupta', avatar: '👨‍🎓', masteryScore: 78, totalAttempts: 31, topMisconception: 'Premature Measurement', status: 'on_track' },
    { id: 's5', name: 'Ananya Roy', avatar: '👩‍🎓', masteryScore: 92, totalAttempts: 27, topMisconception: 'None (Excelling)', status: 'advanced' },
    { id: 's6', name: 'Vikram Joshi', avatar: '👨‍🎓', masteryScore: 49, totalAttempts: 16, topMisconception: 'CNOT Inversion', status: 'needs_help' },
    { id: 's7', name: 'Deepa Krishnan', avatar: '👩‍🎓', masteryScore: 74, totalAttempts: 20, topMisconception: 'Phase Kickback', status: 'on_track' },
    { id: 's8', name: 'Aditya Verma', avatar: '👨‍🎓', masteryScore: 82, totalAttempts: 29, topMisconception: 'None (Excelling)', status: 'advanced' }
  ]
};

const TELEMETRY_STORAGE_KEY = 'quantum_mind_telemetry';

export function getLocalStudentMisconceptions(): Record<string, number> {
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return {
    phase: 2,
    entanglement: 3,
    measurement: 1
  };
}

export function recordLocalMisconception(type: 'phase' | 'entanglement' | 'measurement' | 'superposition') {
  const current = getLocalStudentMisconceptions();
  current[type] = (current[type] || 0) + 1;
  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    // ignore
  }
}

/**
 * Difficulty-Adaptive Challenge Recommendation Engine
 * Analyzes the student's logged misconceptions and automatically picks the optimal challenge.
 */
export function getAdaptiveRecommendation(
  misconceptions: Record<string, number>,
  completedChallenges: string[]
): AdaptiveChallengeRecommendation {
  // Score misconception categories
  const phaseErrors = misconceptions['phase'] || 0;
  const entangleErrors = misconceptions['entanglement'] || 0;
  const measureErrors = misconceptions['measurement'] || 0;

  // Find challenge matching the highest error rate
  if (entangleErrors >= phaseErrors && entangleErrors >= measureErrors) {
    if (!completedChallenges.includes('broken-bell')) {
      return {
        challengeId: 'broken-bell',
        challengeTitle: 'Challenge 1: The Inverted Entangler',
        difficulty: 'Beginner',
        reason: `Targeted remediation: You encountered ${entangleErrors} entanglement inversion errors. Master CNOT control/target dynamics.`,
        relatedMisconception: 'Entanglement Inversion',
        urgency: 'high'
      };
    }
    if (!completedChallenges.includes('ghz-broken-chain')) {
      return {
        challengeId: 'ghz-broken-chain',
        challengeTitle: 'Challenge 4: Fractured GHZ Entanglement',
        difficulty: 'Advanced',
        reason: 'Multi-qubit advancement: Reinforce 3-qubit entanglement propagation without classical decoupling.',
        relatedMisconception: 'Multi-Qubit Entanglement',
        urgency: 'medium'
      };
    }
  }

  if (phaseErrors >= measureErrors) {
    if (!completedChallenges.includes('phase-flip-mystery')) {
      return {
        challengeId: 'phase-flip-mystery',
        challengeTitle: 'Challenge 3: The Phase Flip Puzzle',
        difficulty: 'Intermediate',
        reason: `Targeted remediation: Detected ${phaseErrors} phase vs. bit-flip confusions. Learn why Pauli-Z rotates |+⟩ to |-⟩ while X has zero effect!`,
        relatedMisconception: 'Phase vs Bit-Flip Duality',
        urgency: 'high'
      };
    }
  }

  if (!completedChallenges.includes('superposition-collapse')) {
    return {
      challengeId: 'superposition-collapse',
      challengeTitle: 'Challenge 2: Premature Wavefunction Collapse',
      difficulty: 'Intermediate',
      reason: 'Axiomatic verification: Resolve premature measurement placement to prevent early decoherence.',
      relatedMisconception: 'Wavefunction Collapse',
      urgency: 'medium'
    };
  }

  // Fallback to first uncompleted challenge
  const uncompleted = DEBUG_CHALLENGES.find(c => !completedChallenges.includes(c.id));
  if (uncompleted) {
    return {
      challengeId: uncompleted.id,
      challengeTitle: uncompleted.title,
      difficulty: uncompleted.difficulty,
      reason: 'Adaptive progression: Challenge calibrated to your current mastery level.',
      relatedMisconception: uncompleted.category,
      urgency: 'low'
    };
  }

  // All completed!
  return {
    challengeId: DEBUG_CHALLENGES[0].id,
    challengeTitle: 'All Challenges Mastered!',
    difficulty: 'Advanced',
    reason: 'Exceptional mastery across all quantum domains! You can re-attempt any challenge in sandbox mode.',
    relatedMisconception: 'Complete Mastery',
    urgency: 'low'
  };
}
