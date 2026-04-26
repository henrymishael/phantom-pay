'use client'

import { useEffect } from 'react'
import { PaymentLinkForm } from './PaymentLinkForm'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateLinkModal({ isOpen, onClose }: CreateLinkModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 bg-black/70"
      onClick={onClose}
    >
      {/* Bottom drawer on mobile, centered modal on sm+ */}
      <div
        className={[
          'w-full bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-6 shadow-2xl',
          'sm:max-w-md sm:border sm:border-zinc-800 sm:rounded-xl sm:rounded-t-xl',
          'animate-slide-up sm:animate-none',
        ].join(' ')}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Drag handle — visible only on mobile */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        <h2 id="modal-title" className="text-xl font-semibold text-white mb-4">
          Create Payment Link
        </h2>
        <PaymentLinkForm onClose={onClose} />
      </div>
    </div>
  )
}
