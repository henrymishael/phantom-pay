interface PrivacyModeBadgeProps {
  mode: 'anonymous' | 'verifiable'
  className?: string
}

export function PrivacyModeBadge({ mode, className = '' }: PrivacyModeBadgeProps) {
  const isAnonymous = mode === 'anonymous'
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isAnonymous 
          ? 'bg-gray-100 text-gray-800' 
          : 'bg-blue-100 text-blue-800'
      } ${className}`}
      aria-label={`Privacy mode: ${mode}`}
    >
      <svg 
        className="w-3 h-3 mr-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {isAnonymous ? (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" 
          />
        ) : (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
          />
        )}
      </svg>
      {isAnonymous ? 'Anonymous' : 'Verifiable'}
    </span>
  )
}