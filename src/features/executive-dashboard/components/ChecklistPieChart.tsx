import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#10B981', '#EF4444']

type ChecklistPieChartProps = {
  success: number
  fail: number
  onFailClick?: () => void
}

export function ChecklistPieChart({
  success,
  fail,
  onFailClick,
}: ChecklistPieChartProps) {
  const data = [
    { name: 'Aprovado', value: success },
    { name: 'Não Conforme', value: fail },
  ]

  const handleSliceClick = (payload: any, index: number) => {
    const clickedName = data[index].name

    if (clickedName === 'Não Conforme') {
      onFailClick?.()
    }
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          outerRadius={80}
          dataKey="value"
          paddingAngle={2}
          onClick={(data, index) => handleSliceClick(data, index)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value) => {
            const num = typeof value === 'number' ? value : Number(value)
            return `${Math.round(num)}%`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
