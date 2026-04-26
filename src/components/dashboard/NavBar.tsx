'use client'

import { useAuth } from '../../contexts/AuthContext'
import { TruncatedAddress } from '../ui/TruncatedAddress'

export function NavBar() {
  const { walletAddress, disconnect } = useAuth()

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6">
      <span className="text-white font-semibold tracking-tight">PhantomPay</span>
      <div className="flex items-center gap-4">
        {walletAddress && (
          <TruncatedAddress address={walletAddress} className="text-zinc-400 text-sm font-mono" />
        )}
        <button
          onClick={disconnect}
          aria-label="Disconnect wallet"
          className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1 rounded-lg border border-zinc-700 hover:border-zinc-500"
        >
          Disconnect
        </button>
      </div>
    </header>
  )
}
