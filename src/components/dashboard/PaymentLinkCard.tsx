'use client'

import { CopyButton } from '../ui/CopyButton'
import { PrivacyModeBadge } from '../ui/PrivacyModeBadge'

interface PaymentLink {
  id: string
  amount: number
  token: 'SOL' | 'USDC'
  description: string | null
  expiresAt: string | null
  privacyMode: 'anonymous' | 'verifiable'
  status: 'active' | 'expired' | 'fulfilled' | 'deactivated'
  createdAt: string
}

interface PaymentLinkCardProps {
  link: PaymentLink
  onDeactivate: (id: string) => void
}

export function PaymentLinkCard({ link, onDeactivate }: PaymentLinkCardProps) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/pay/${link.id}`

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold">
            {link.amount} {link.token}
          </p>
          {link.description && (
            <p className="text-zinc-400 text-sm truncate">{link.description}</p>
          )}
        </div>
        <PrivacyModeBadge mode={link.privacyMode} />
      </div>

      {link.expiresAt && (
        <p className="text-zinc-500 text-xs">
          Expires: {new Date(link.expiresAt).toLocaleString()}
        </p>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-zinc-900 rounded px-2 py-1 min-w-0">
          <p className="text-zinc-400 text-xs font-mono truncate">{url}</p>
        </div>
        <CopyButton value={url} label="Copy link" />
      </div>

      <button
        onClick={() => onDeactivate(link.id)}
        className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-700 rounded transition-colors"
        aria-label={`Deactivate payment link ${link.id}`}
      >
        Deactivate
      </button>
    </div>
  )
}
