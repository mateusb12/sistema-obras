import React from 'react'

type DashboardMainCardProps = {
  title: string
  value: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}

export function DashboardMainCard({
  title,
  value,
  icon,
  isActive,
  onClick,
}: DashboardMainCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-start justify-between
        p-5 rounded-2xl w-full h-32 text-left
        transition-all duration-200 shadow-sm
        
        ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg scale-[1.03]'
            : 'bg-gray-800/40 text-gray-200 hover:bg-gray-700/40 hover:scale-[1.01]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-white/20">{icon}</div>
        <span className="text-lg font-semibold">{title}</span>
      </div>

      <p className="text-2xl font-bold mt-2">{value}</p>
    </button>
  )
}
