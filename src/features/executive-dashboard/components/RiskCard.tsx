import type { ReactNode } from 'react'

type RiskCardProps = {
  title: string
  subtitle: string
  highlightValue: string
  highlightLabel: string
  toneClassName: string
  isActive: boolean
  onClick: () => void
  children: ReactNode
}

export function RiskCard({
  title,
  subtitle,
  highlightValue,
  highlightLabel,
  toneClassName,
  isActive,
  onClick,
  children,
}: RiskCardProps) {
  const activeStyles = isActive
    ? `${toneClassName} ring-2 ring-offset-2 ring-current dark:ring-offset-gray-900 shadow-md scale-[1.02]`
    : 'border-gray-200 bg-gray-50/50 opacity-60 hover:opacity-100 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/30'

  return (
    <div
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-5 text-left transition-all duration-200 ${activeStyles}`}
    >
      <header>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{subtitle}</p>
      </header>

      <div
        className={`mt-5 rounded-xl p-4 text-center transition-colors ${isActive ? 'bg-white/70 dark:bg-gray-950/30' : 'bg-white/40 dark:bg-gray-800/50'}`}
      >
        <p className="text-4xl font-bold text-gray-900 dark:text-white">
          {highlightValue}
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {highlightLabel}
        </p>
      </div>

      <div className="mt-4 space-y-3">{children}</div>
    </div>
  )
}
