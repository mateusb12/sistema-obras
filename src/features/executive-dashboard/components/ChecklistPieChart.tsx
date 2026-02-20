import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#10B981', '#EF4444']

type ChecklistPieChartProps = {
  success: number
  fail: number
}

export function ChecklistPieChart({ success, fail }: ChecklistPieChartProps) {
  const data = [
    { name: 'Aprovado', value: success },
    { name: 'Não Conforme', value: fail },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} outerRadius={80} dataKey="value" paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
