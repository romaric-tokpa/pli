// Chart MRR — LineChart 12 mois (plateforme). Chunk séparé, lazy chargé par
// la vue d'ensemble admin uniquement.

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PointMrrMensuel } from '@pli/types';

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

export default function ChartMrr12m({ data }: { data: PointMrrMensuel[] }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
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
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)} k`}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 12 }}
          formatter={(v: number) => `${formatNum(v)} FCFA`}
        />
        <Line
          type="monotone"
          dataKey="mrr"
          name="MRR"
          stroke="#15294E"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#15294E' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
