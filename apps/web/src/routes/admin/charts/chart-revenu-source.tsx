// Chart revenu par source — PieChart Février 2026 (plateforme). Chunk séparé,
// lazy chargé par la vue d'ensemble admin uniquement.

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { SourceRevenu } from '@pli/types';

function formatNum(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

export default function ChartRevenuSource({ data }: { data: SourceRevenu[] }) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="montant"
          nameKey="source"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.couleur} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => `${formatNum(v)} FCFA`}
          contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
