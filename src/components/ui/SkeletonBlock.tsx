interface SkeletonBlockProps {
  width?: string
  height?: string
  className?: string
}

export function SkeletonBlock({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}: SkeletonBlockProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  )
}