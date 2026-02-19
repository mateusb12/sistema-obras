import type { ReactNode } from 'react'

type RiskCardProps = {
  title: string
  subtitle: string
  highlightValue: string
  highlightLabel: string
  toneClassName: string
  children: ReactNode
}

export function RiskCard({
  title,
  subtitle,
  highlightValue,
  highlightLabel,
  toneClassName,
  children,
}: RiskCardProps) {
  return (
    <article className={`rounded-2xl border p-5 ${toneClassName}`}>
      <header>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{subtitle}</p>
      </header>

      <div className="mt-5 rounded-xl bg-white/70 p-4 text-center dark:bg-gray-950/30">
        <p className="text-4xl font-bold text-gray-900 dark:text-white">
          {highlightValue}
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {highlightLabel}
        </p>
      </div>

      <div className="mt-4 space-y-3">{children}</div>
    </article>
  )
}
