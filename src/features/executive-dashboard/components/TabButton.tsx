type TabButtonProps = {
  label: string
  isActive: boolean
  onClick: () => void
  icon?: React.ReactNode
}

export function TabButton({ label, isActive, onClick, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-5 py-3 rounded-xl 
        font-medium transition-all text-sm
        ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md scale-[1.03]'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}
