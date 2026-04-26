interface TruncatedAddressProps {
  address: string
  className?: string
}

export function TruncatedAddress({ address, className = '' }: TruncatedAddressProps) {
  // Render first 4 and last 4 characters with ellipsis
  const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`
  
  return (
    <span className={`font-mono text-sm ${className}`} title={address}>
      {truncated}
    </span>
  )
}