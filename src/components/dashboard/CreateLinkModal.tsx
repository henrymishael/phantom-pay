'use client'

import { PaymentLinkForm } from './PaymentLinkForm'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateLinkModal({ isOpen, onClose }: CreateLinkModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-xl font-semibold text-white mb-4">Create Payment Link</h2>
        <PaymentLinkForm onClose={onClose} />
      </div>
    </div>
  )
}
