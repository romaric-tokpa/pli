// Chart évolution taux de consultation — LineChart 12 mois (moyenne portefeuille).
// Chunk séparé, lazy chargé par /cabinet/statistiques uniquement.

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface PointEvolutionConsultation {
  mois: string;
  taux: number;
}

export default function ChartEvolutionConsultation({
  data,
}: {
  data: PointEvolutionConsultation[];
}) {
  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
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
          domain={[60, 100]}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 12 }}
          formatter={(v: number) => `${v}%`}
        />
        <Line
          type="monotone"
          dataKey="taux"
          name="Taux"
          stroke="#15294E"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#15294E' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
