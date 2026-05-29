// Chart consultations — BarChart 6 derniers mois (distribués vs consultés).
// Chunk séparé, chargé en lazy par dashboard.tsx pour sortir recharts du bundle initial.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface PointConsultation {
  mois: string;
  distribues: number;
  consultes: number;
}

export default function ChartConsultations({ data }: { data: PointConsultation[] }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#ECEFF4" vertical={false} />
        <XAxis
          dataKey="mois"
          tick={{ fill: '#5B6577', fontSize: 12 }}
          axisLine={{ stroke: '#DCE1E9' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#5B6577', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 12 }}
          cursor={{ fill: '#F3F5F9' }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="distribues" name="Distribués" fill="#DCE1E9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="consultes" name="Consultés" fill="#15294E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
