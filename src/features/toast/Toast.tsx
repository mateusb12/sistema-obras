import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  isValidElement,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  message: string | ReactNode | Error | object
  type?: ToastType
  duration?: number
}

export interface InternalToast {
  id: number
  message: ReactNode
  type: ToastType
  duration: number
  dedupKey?: string
}

interface ToastContextValue {
  success: (msg: ToastOptions['message'], duration?: number) => void
  error: (msg: ToastOptions['message'], duration?: number) => void
  warning: (msg: ToastOptions['message'], duration?: number) => void
  info: (msg: ToastOptions['message'], duration?: number) => void
  show: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<InternalToast[]>([])
  const activeKeys = useRef<Set<string>>(new Set())

  const removeToast = (id: number) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id)
      if (toast?.dedupKey) {
        activeKeys.current.delete(toast.dedupKey)
      }
      return prev.filter((t) => t.id !== id)
    })
  }

  const createDedupKey = (content: unknown): string => {
    try {
      if (typeof content === 'string') return content
      if (isValidElement(content)) {
        const extract = (node: any): string => {
          if (typeof node === 'string' || typeof node === 'number')
            return String(node)
          if (Array.isArray(node)) return node.map(extract).join('')
          if (node?.props?.children) return extract(node.props.children)
          return ''
        }
        return extract(content)
      }
      if (content instanceof Error) return content.message
      if (typeof content === 'object') return JSON.stringify(content)
      return String(content)
    } catch {
      return 'toast'
    }
  }

  const show = ({
    message,
    type = 'success',
    duration = 4000,
  }: ToastOptions) => {
    const dedupKey = createDedupKey(message)

    if (activeKeys.current.has(dedupKey)) return

    activeKeys.current.add(dedupKey)

    const id = Date.now()

    const toast: InternalToast = {
      id,
      message: typeof message === 'string' ? message : message,
      type,
      duration,
      dedupKey,
    }

    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const success = (msg: ToastOptions['message'], duration?: number) =>
    show({ message: msg, type: 'success', duration })
  const error = (msg: ToastOptions['message'], duration?: number) =>
    show({ message: msg, type: 'error', duration })
  const warning = (msg: ToastOptions['message'], duration?: number) =>
    show({ message: msg, type: 'warning', duration })
  const info = (msg: ToastOptions['message'], duration?: number) =>
    show({ message: msg, type: 'info', duration })

  const value: ToastContextValue = {
    success,
    error,
    warning,
    info,
    show,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      {createPortal(
        <div className="fixed top-4 right-4 z-[99999] space-y-3">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

const ToastItem = ({
  toast,
  onClose,
}: {
  toast: InternalToast
  onClose: () => void
}) => {
  const { type, message } = toast

  const icon = {
    success: <CheckCircle className="text-green-500 w-5 h-5" />,
    error: <XCircle className="text-red-500 w-5 h-5" />,
    warning: <AlertCircle className="text-yellow-500 w-5 h-5" />,
    info: <Info className="text-blue-500 w-5 h-5" />,
  }[type]

  const color = {
    success: 'border-green-500/40 bg-green-50 dark:bg-green-900/20',
    error: 'border-red-500/40 bg-red-50 dark:bg-red-900/20',
    warning: 'border-yellow-500/40 bg-yellow-50 dark:bg-yellow-900/20',
    info: 'border-blue-500/40 bg-blue-50 dark:bg-blue-900/20',
  }[type]

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-md backdrop-blur-sm ${color} w-80`}
    >
      <div>{icon}</div>
      <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default ToastProvider
