// Chart tendance réclamations — LineChart 6 derniers mois (ouvertes vs résolues).
// Chunk séparé, lazy chargé par dashboard.tsx.

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface PointReclamations {
  mois: string;
  ouvertes: number;
  resolues: number;
}

export default function ChartTendanceReclamations({ data }: { data: PointReclamations[] }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="#ECEFF4" vertical={false} />
        <XAxis
          dataKey="mois"
          tick={{ fill: '#5B6577', fontSize: 11 }}
          axisLine={{ stroke: '#DCE1E9' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#5B6577', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 11 }}
        />
        <Line
          type="monotone"
          dataKey="ouvertes"
          name="Ouvertes"
          stroke="#B85737"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="resolues"
          name="Résolues"
          stroke="#2F8F5B"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
