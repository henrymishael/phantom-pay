interface ToastNotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose?: () => void
}

export function ToastNotification({ message, type, onClose }: ToastNotificationProps) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type]

  return (
    <div
      className={`px-4 py-2 rounded-md shadow-lg text-white ${bgColor}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close notification"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}