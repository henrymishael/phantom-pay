interface ErrorSectionProps {
  message: string
  onRetry?: () => void
}

export function ErrorSection({ message, onRetry }: ErrorSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="text-red-600 mb-4">
        <svg 
          className="w-12 h-12 mx-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      <p className="text-gray-700 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Retry the failed operation"
        >
          Retry
        </button>
      )}
    </div>
  )
}