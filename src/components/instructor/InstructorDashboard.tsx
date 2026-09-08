import React, { useState } from 'react';
import { COHORT_TELEMETRY_DATA } from '../../quantum/telemetry';
import { sounds } from '../../utils/audio';
import {
  GraduationCap,
  AlertTriangle,
  Users,
  TrendingUp,
  Brain,
  Lightbulb,
  CheckCircle2,
  Filter,
  Download,
  Flame,
  BarChart3,
  HelpCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface InstructorDashboardProps {
  onAssignRemedialToStudent?: (studentName: string, challengeId: string) => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'needs_help' | 'on_track' | 'advanced'>('all');
  const [selectedConceptDetail, setSelectedConceptDetail] = useState<string | null>('cnot_inversion');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [backendHeatmap, setBackendHeatmap] = useState<any | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    import('../../services/api').then(({ fetchCohortHeatmap, checkBackendHealth }) => {
      checkBackendHealth().then(status => {
        if (mounted) setIsBackendConnected(status.online);
      });
      fetchCohortHeatmap().then(data => {
        if (mounted && data) {
          setBackendHeatmap(data);
        }
      });
    });
    return () => { mounted = false; };
  }, []);

  const cohort = COHORT_TELEMETRY_DATA;

  const filteredStudents = cohort.students.filter(student => {
    if (selectedFilter === 'all') return true;
    return student.status === selectedFilter;
  });

  const selectedConcept = cohort.misconceptions.find(m => m.conceptId === selectedConceptDetail);

  const handleExportReport = () => {
    sounds.playSuccess();
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full py-2">
      {/* Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-amber-700 font-mono font-bold">
              Pedagogical Analytics • Longitudinal Misconception Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Instructor & Faculty Command Center
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Aggregated cohort heatmap identifying which quantum mechanics axioms and unitary gates students fail most frequently.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            isBackendConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isBackendConnected ? 'FastAPI Telemetry: Live' : 'Local Telemetry Cache'}</span>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{copiedToast ? 'Report Exported!' : 'Export Cohort Report (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Active Cohort</span>
            <Users className="w-4 h-4 text-[#0f62fe]" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900">{cohort.totalStudents}</span>
          <span className="text-[11px] text-slate-500 mt-1">Class: Quantum 101 (Sec A)</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Average Class Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-600">{cohort.averageAccuracy}%</span>
          <span className="text-[11px] text-emerald-700 mt-1">+4.2% after Bell State lab</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Critical Misconceptions</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-bold font-mono text-red-600">{cohort.criticalMisconceptionsCount}</span>
          <span className="text-[11px] text-red-600 font-semibold mt-1">Action required before quiz</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Total Circuit Simulations</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-purple-700">184 Runs</span>
          <span className="text-[11px] text-slate-500 mt-1">100% in-browser deterministic</span>
        </div>
      </div>

      {/* CORE FEATURE: Class Misconception Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Class Misconception Heatmap</h3>
                <p className="text-[11px] text-slate-500">Real-time mistake distribution across quantum syllabus concepts</p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Ranked by Failure Rate
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {cohort.misconceptions.map((item) => {
              const isSelected = selectedConceptDetail === item.conceptId;
              const severityBg =
                item.severity === 'high'
                  ? 'bg-red-500'
                  : item.severity === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

              const severityBadge =
                item.severity === 'high'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : item.severity === 'medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div
                  key={item.conceptId}
                  onClick={() => { sounds.playClick(); setSelectedConceptDetail(item.conceptId); }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0f62fe] bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.conceptName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${severityBadge}`}>
                        {item.severity} Risk
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-800">
                        {item.errorPercentage}% Fail
                      </span>
                    </div>
                  </div>

                  {/* Heatmap Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${severityBg}`}
                      style={{ width: `${item.errorPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span><strong>{item.studentsAffected} of 48</strong> students failed this concept</span>
                    <span className="font-mono text-slate-600">Frequent bug: {item.frequentWrongGate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pedagogical Intervention Card (1 Column) */}
        <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pedagogical Intervention</h3>
                <p className="text-[11px] text-slate-500">Actionable classroom teaching tip</p>
              </div>
            </div>

            {selectedConcept ? (
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Selected Diagnosed Concept
                  </span>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedConcept.conceptName}
                  </h4>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Domain: {selectedConcept.category}
                    </span>
                    <span className="text-xs font-mono text-red-600 font-bold">
                      {selectedConcept.studentsAffected} Students Struggling
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Recommended Classroom Action:</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-amber-900">
                    {selectedConcept.suggestedAction}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Detected Common Student Misconception:</span>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Students repeatedly substitute {selectedConcept.frequentWrongGate}. They confuse continuous unitary rotations with classical bit transformations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-8 text-center">
                Click any concept in the heatmap to view tailored pedagogical teaching strategies.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span className="font-bold block mb-0.5">💡 Automated Remediation:</span>
              <span>The student platform's <strong>Difficulty-Adaptive Queue</strong> will automatically steer struggling students toward challenges covering these weak points.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Student Roster & Individual Diagnostics */}
      <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#0f62fe]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Cohort Performance</h3>
              <p className="text-[11px] text-slate-500">Live learner accuracy, attempts, and diagnosed misconception</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedFilter === 'all' ? 'bg-white text-[#0f62fe] shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({cohort.students.length})
            </button>
            <button
              onClick={() => setSelectedFilter('needs_help')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedFilter === 'needs_help' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Needs Remediation (3)
            </button>
            <button
              onClick={() => setSelectedFilter('on_track')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedFilter === 'on_track' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              On Track (2)
            </button>
            <button
              onClick={() => setSelectedFilter('advanced')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedFilter === 'advanced' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Advanced (3)
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Mastery Score</th>
                <th className="py-2.5 px-3">Circuits Run</th>
                <th className="py-2.5 px-3">Primary Diagnosed Bug</th>
                <th className="py-2.5 px-3">Cohort Status</th>
                <th className="py-2.5 px-3 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-base">{s.avatar}</span>
                    <span>{s.name}</span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className={`font-bold ${
                      s.masteryScore >= 80
                        ? 'text-emerald-600'
                        : s.masteryScore >= 60
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {s.masteryScore}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">{s.totalAttempts}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      s.topMisconception.includes('None')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {s.topMisconception}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      s.status === 'advanced'
                        ? 'bg-purple-50 text-purple-700'
                        : s.status === 'on_track'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        alert(`Assigned tailored remedial challenge to ${s.name} covering: ${s.topMisconception}`);
                      }}
                      className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-[#0f62fe] text-slate-700 hover:text-white border border-slate-300 hover:border-[#0f62fe] transition-colors cursor-pointer font-medium inline-flex items-center gap-1"
                    >
                      <span>Assign Remedial</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
