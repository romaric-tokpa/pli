// Chart bulletins par mois — BarChart volume mensuel cumulé portefeuille.
// Chunk séparé, lazy chargé par /cabinet/statistiques uniquement.

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface PointBulletinsMois {
  mois: string;
  bulletins: number;
}

export default function ChartBulletinsMois({ data }: { data: PointBulletinsMois[] }) {
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
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 12 }} />
        <Bar dataKey="bulletins" name="Bulletins" fill="#15294E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
