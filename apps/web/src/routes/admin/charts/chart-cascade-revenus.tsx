// Chart cascade revenus — bar chart « brut → remises → net » pour
// /admin/revenus. Lazy chargé.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface BarreCascade {
  etape: string;
  /** Valeur barre — montant FCFA. */
  valeur: number;
  /** Couleur (positif = encre/succès, négatif = cachet remise). */
  couleur: string;
}

function format(v: number): string {
  return v.toLocaleString('fr-FR').replace(/,/g, ' ');
}

export default function ChartCascadeRevenus({ data }: { data: BarreCascade[] }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="#ECEFF4" vertical={false} />
        <XAxis
          dataKey="etape"
          tick={{ fill: '#5B6577', fontSize: 11 }}
          axisLine={{ stroke: '#DCE1E9' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#5B6577', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)} k`}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 12 }}
          formatter={(v: number) => `${format(v)} FCFA`}
        />
        <Bar dataKey="valeur" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.couleur} />
          ))}
          <LabelList
            dataKey="valeur"
            position="top"
            formatter={(v: number) => format(v)}
            fontSize={10}
            fill="#5B6577"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
