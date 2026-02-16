import { FileText } from 'lucide-react'
import type { Attachment } from '../types'

type DocumentModalProps = {
  attachment: Attachment | null
  title: string
  onClose: () => void
}

export function DocumentModal({
  attachment,
  title,
  onClose,
}: DocumentModalProps) {
  if (!attachment) return null

  const isImage = attachment.fileType.startsWith('image/')

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {attachment.fileName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>

        {isImage ? (
          <img
            src={attachment.base64}
            alt={attachment.fileName}
            className="max-h-[70vh] w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700"
          />
        ) : (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <FileText size={16} />
              PDF anexado
            </div>
            <iframe
              title={attachment.fileName}
              src={attachment.base64}
              className="h-[60vh] w-full rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        )}

        <a
          href={attachment.base64}
          download={attachment.fileName}
          className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Baixar arquivo
        </a>
      </div>
    </div>
  )
}
