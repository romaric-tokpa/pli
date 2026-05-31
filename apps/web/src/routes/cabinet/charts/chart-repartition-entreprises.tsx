// Chart répartition top 5 entreprises (volume bulletins du mois) — PieChart.
// Chunk séparé, lazy chargé par /cabinet/statistiques uniquement.

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface PointRepartition {
  nom: string;
  value: number;
  couleur: string;
}

export default function ChartRepartitionEntreprises({
  data,
}: {
  data: PointRepartition[];
}) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="nom" innerRadius={48} outerRadius={80} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.couleur} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 12 }}
          formatter={(v: number) => `${v} bulletins`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
