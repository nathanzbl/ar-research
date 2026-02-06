import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

interface SessionResponse {
  id: string;
  conditionType: string;
  deviceType: string;
  startedAt: string;
  completedAt: string | null;
  isScreenedOut: boolean;
  responses: Record<string, string>;
}

interface SurveyAnalyticsProps {
  sessions: SessionResponse[];
}

const CONDITION_LABELS: Record<string, string> = {
  ar_menu: 'AR Menu',
  menu_image_0: 'Menu Image 1',
  menu_image_1: 'Menu Image 2',
};

const CONDITIONS = ['ar_menu', 'menu_image_0', 'menu_image_1'] as const;
const CONDITION_COLORS: Record<string, string> = {
  ar_menu: '#002E5D',
  menu_image_0: '#0062B8',
  menu_image_1: '#009CE7',
};

const PIE_COLORS = ['#002E5D', '#0062B8', '#009CE7', '#6B7280', '#F59E0B', '#10B981', '#EF4444'];

function parseLikert(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

function avgByCondition(
  sessions: SessionResponse[],
  questionId: string,
): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  for (const cond of CONDITIONS) {
    const vals = sessions
      .filter((s) => s.conditionType === cond && !s.isScreenedOut && s.completedAt)
      .map((s) => parseLikert(s.responses[questionId]))
      .filter((v): v is number => v !== null);
    result[cond] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  return result;
}

const LIKERT_Q8 = [
  { id: 'Q8a', short: 'Visual design' },
  { id: 'Q8b', short: 'Intuitive layout' },
  { id: 'Q8c', short: 'Sufficient info' },
  { id: 'Q8d', short: 'Easy to navigate' },
  { id: 'Q8e', short: 'Clearly described' },
  { id: 'Q8f', short: 'Modern' },
];

const CHOICE_FACTORS = [
  { id: 'Q3b', short: 'Familiarity' },
  { id: 'Q4', short: 'Price' },
  { id: 'Q5', short: 'Flavor' },
  { id: 'Q6', short: 'Past experience' },
  { id: 'Q6d', short: 'Confidence' },
];

const TF_QUESTIONS = [
  { id: 'Q11', short: 'Realistic' },
  { id: 'Q12', short: 'Innovative' },
  { id: 'Q13', short: 'Engaged' },
];

function buildGroupedBarData(
  sessions: SessionResponse[],
  questions: { id: string; short: string }[],
) {
  return questions.map((q) => {
    const avgs = avgByCondition(sessions, q.id);
    return {
      question: q.short,
      'AR Menu': avgs.ar_menu !== null ? Math.round(avgs.ar_menu * 100) / 100 : 0,
      'Menu Image 1': avgs.menu_image_0 !== null ? Math.round(avgs.menu_image_0 * 100) / 100 : 0,
      'Menu Image 2': avgs.menu_image_1 !== null ? Math.round(avgs.menu_image_1 * 100) / 100 : 0,
    };
  });
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-byu-dark mb-4">{title}</h3>
      {children}
    </div>
  );
}

function GroupedBarChartSection({
  title,
  data,
  yDomain,
}: {
  title: string;
  data: { question: string; 'AR Menu': number; 'Menu Image 1': number; 'Menu Image 2': number }[];
  yDomain?: [number, number];
}) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="question" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis domain={yDomain || [0, 5]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="AR Menu" fill={CONDITION_COLORS.ar_menu} />
          <Bar dataKey="Menu Image 1" fill={CONDITION_COLORS.menu_image_0} />
          <Bar dataKey="Menu Image 2" fill={CONDITION_COLORS.menu_image_1} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SurveyAnalytics({ sessions }: SurveyAnalyticsProps) {
  const completedSessions = useMemo(
    () => sessions.filter((s) => s.completedAt && !s.isScreenedOut),
    [sessions],
  );

  // Grouped bar data
  const q8Data = useMemo(() => buildGroupedBarData(completedSessions, LIKERT_Q8), [completedSessions]);
  const choiceData = useMemo(() => buildGroupedBarData(completedSessions, CHOICE_FACTORS), [completedSessions]);

  // Confidence distribution (Q10 0-100)
  const confidenceBins = useMemo(() => {
    const bins = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];
    completedSessions.forEach((s) => {
      const val = parseInt(s.responses.Q10, 10);
      if (isNaN(val)) return;
      if (val <= 20) bins[0].count++;
      else if (val <= 40) bins[1].count++;
      else if (val <= 60) bins[2].count++;
      else if (val <= 80) bins[3].count++;
      else bins[4].count++;
    });
    return bins;
  }, [completedSessions]);

  // True/False stacked bar (Q11, Q12, Q13)
  const tfData = useMemo(() => {
    return TF_QUESTIONS.map((q) => {
      const row: Record<string, string | number> = { question: q.short };
      for (const cond of CONDITIONS) {
        const condSessions = completedSessions.filter((s) => s.conditionType === cond);
        const total = condSessions.length;
        const trueCount = condSessions.filter((s) => {
          const v = s.responses[q.id]?.toLowerCase();
          return v === 'true' || v === 'yes';
        }).length;
        const label = CONDITION_LABELS[cond];
        row[`${label} True`] = total > 0 ? Math.round((trueCount / total) * 100) : 0;
        row[`${label} False`] = total > 0 ? Math.round(((total - trueCount) / total) * 100) : 0;
      }
      return row;
    });
  }, [completedSessions]);

  // Gender distribution (Q18)
  const genderData = useMemo(() => {
    const counts: Record<string, number> = {};
    completedSessions.forEach((s) => {
      const val = s.responses.Q18;
      if (!val) return;
      const key = val.trim();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [completedSessions]);

  // AR experience (Q25)
  const arExpData = useMemo(() => {
    let yes = 0;
    let no = 0;
    completedSessions.forEach((s) => {
      const val = s.responses.Q25?.toLowerCase();
      if (val === 'yes' || val === 'true') yes++;
      else if (val === 'no' || val === 'false') no++;
    });
    return [
      { name: 'Yes', value: yes },
      { name: 'No', value: no },
    ].filter((d) => d.value > 0);
  }, [completedSessions]);

  if (completedSessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8 text-center text-byu-gray">
        No completed sessions to display analytics.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-bold text-byu-dark">Survey Analytics</h2>

      {/* Q8 Likert */}
      <GroupedBarChartSection title="Menu Perceptions (Q8a–Q8f) — Avg by Condition" data={q8Data} />

      {/* Choice influence factors */}
      <GroupedBarChartSection title="Choice Influence Factors — Avg by Condition" data={choiceData} />

      {/* Confidence Distribution */}
      <ChartCard title="Confidence Distribution (Q10)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={confidenceBins} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill={CONDITION_COLORS.ar_menu} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* True/False Stacked */}
      <ChartCard title="True/False Questions — % True by Condition">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={tfData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="AR Menu True" stackId="ar" fill={CONDITION_COLORS.ar_menu} />
            <Bar dataKey="AR Menu False" stackId="ar" fill={`${CONDITION_COLORS.ar_menu}40`} />
            <Bar dataKey="Menu Image 1 True" stackId="m1" fill={CONDITION_COLORS.menu_image_0} />
            <Bar dataKey="Menu Image 1 False" stackId="m1" fill={`${CONDITION_COLORS.menu_image_0}40`} />
            <Bar dataKey="Menu Image 2 True" stackId="m2" fill={CONDITION_COLORS.menu_image_1} />
            <Bar dataKey="Menu Image 2 False" stackId="m2" fill={`${CONDITION_COLORS.menu_image_1}40`} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Gender Distribution (Q18)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                dataKey="value"
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AR Experience (Q25)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={arExpData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                dataKey="value"
              >
                {arExpData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
