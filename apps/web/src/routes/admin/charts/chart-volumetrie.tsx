// Chart volumétrie 30j — bulletins + signatures (stack). Lazy chargé par
// /admin/sante uniquement.

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PointVolumetrie } from '@pli/types';

export default function ChartVolumetrie({ data }: { data: PointVolumetrie[] }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="#ECEFF4" vertical={false} />
        <XAxis
          dataKey="jour"
          tick={{ fill: '#5B6577', fontSize: 10 }}
          axisLine={{ stroke: '#DCE1E9' }}
          tickLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fill: '#5B6577', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #DCE1E9', fontSize: 12 }} />
        <Bar dataKey="bulletins" name="Bulletins" stackId="a" fill="#15294E" />
        <Bar dataKey="signatures" name="Signatures" stackId="a" fill="#B85737" />
      </BarChart>
    </ResponsiveContainer>
  );
}
