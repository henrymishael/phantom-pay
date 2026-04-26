'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryKeys'
import { apiClient, ApiError } from '../../lib/apiClient'
import { CopyButton } from '../ui/CopyButton'
import { useToast } from '../../contexts/ToastContext'

interface FormValues {
  amount: string
  token: 'SOL' | 'USDC'
  description: string
  expiresAt: string
  privacyMode: 'anonymous' | 'verifiable'
  usageType: 'single-use' | 'multiple-use'
}

interface FieldErrors {
  amount?: string
  token?: string
  privacyMode?: string
  general?: string
}

interface PaymentLinkFormProps {
  onClose: () => void
}

function getDefaultPrivacyMode(): 'anonymous' | 'verifiable' {
  if (typeof window === 'undefined') return 'anonymous'
  try {
    const saved = localStorage.getItem('pp_default_privacy')
    return saved === 'verifiable' ? 'verifiable' : 'anonymous'
  } catch {
    return 'anonymous'
  }
}

export function PaymentLinkForm({ onClose }: PaymentLinkFormProps) {
  const qc = useQueryClient()
  const { addToast } = useToast()
  const [values, setValues] = useState<FormValues>({
    amount: '',
    token: 'SOL',
    description: '',
    expiresAt: '',
    privacyMode: getDefaultPrivacyMode(),
    usageType: 'single-use',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [createdLinkId, setCreatedLinkId] = useState<string | null>(null)

  const validate = (): boolean => {
    const e: FieldErrors = {}
    const amt = parseFloat(values.amount)
    if (!values.amount || isNaN(amt) || amt <= 0) e.amount = 'Amount must be a positive number'
    if (!values.token) e.token = 'Token is required'
    if (!values.privacyMode) e.privacyMode = 'Privacy mode is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setErrors({})
    try {
      const result = await apiClient.createLink({
        amount: parseFloat(values.amount),
        token: values.token,
        description: values.description || undefined,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
        privacyMode: values.privacyMode,
        usageType: values.usageType,
      })
      await qc.invalidateQueries({ queryKey: queryKeys.links() })
      setCreatedLinkId(result.id)
      addToast('Payment link created', 'success')
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        const fieldErrs: FieldErrors = {}
        for (const d of err.details) {
          fieldErrs[d.field as keyof FieldErrors] = d.message
        }
        setErrors(fieldErrs)
      } else {
        setErrors({ general: err instanceof Error ? err.message : 'Failed to create link' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (createdLinkId) {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/pay/${createdLinkId}`
    return (
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Link created!</h3>
        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
          <span className="text-zinc-300 text-sm font-mono flex-1 truncate">{url}</span>
          <CopyButton value={url} label="Copy payment link" />
        </div>
        <button onClick={onClose} className="w-full py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors">
          Done
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.general && (
        <p role="alert" className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">{errors.general}</p>
      )}

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm text-zinc-300 mb-1">Amount <span className="text-red-400">*</span></label>
        <input
          id="amount"
          type="number"
          min="0"
          step="any"
          value={values.amount}
          onChange={e => setValues(v => ({ ...v, amount: e.target.value }))}
          aria-label="Payment amount"
          aria-describedby={errors.amount ? 'amount-error' : undefined}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
          placeholder="0.00"
        />
        {errors.amount && <p id="amount-error" role="alert" className="text-red-400 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Token */}
      <div>
        <label htmlFor="token" className="block text-sm text-zinc-300 mb-1">Token <span className="text-red-400">*</span></label>
        <select
          id="token"
          value={values.token}
          onChange={e => setValues(v => ({ ...v, token: e.target.value as 'SOL' | 'USDC' }))}
          aria-label="Select token"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
        >
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
        {errors.token && <p role="alert" className="text-red-400 text-xs mt-1">{errors.token}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm text-zinc-300 mb-1">Description <span className="text-zinc-500">(optional)</span></label>
        <input
          id="description"
          type="text"
          maxLength={200}
          value={values.description}
          onChange={e => setValues(v => ({ ...v, description: e.target.value }))}
          aria-label="Payment description"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
          placeholder="What's this payment for?"
        />
      </div>

      {/* Expiry */}
      <div>
        <label htmlFor="expiresAt" className="block text-sm text-zinc-300 mb-1">Expiry <span className="text-zinc-500">(optional)</span></label>
        <input
          id="expiresAt"
          type="datetime-local"
          value={values.expiresAt}
          onChange={e => setValues(v => ({ ...v, expiresAt: e.target.value }))}
          aria-label="Link expiry date and time"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
        />
      </div>

      {/* Usage Type */}
      <div>
        <span className="block text-sm text-zinc-300 mb-2">Usage Type <span className="text-red-400">*</span></span>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Usage type">
          {(['single-use', 'multiple-use'] as const).map(type => (
            <label
              key={type}
              className={`flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                values.usageType === type
                  ? 'border-violet-500 bg-violet-600/10'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <input
                type="radio"
                name="usageType"
                value={type}
                checked={values.usageType === type}
                onChange={() => setValues(v => ({ ...v, usageType: type }))}
                className="sr-only"
              />
              <span className="text-white text-sm font-medium capitalize">{type === 'single-use' ? 'Single Use' : 'Multiple Use'}</span>
              <span className="text-zinc-400 text-xs">
                {type === 'single-use'
                  ? 'Link can only be paid once'
                  : 'Link can be paid multiple times'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Mode */}
      <div>
        <span className="block text-sm text-zinc-300 mb-2">Privacy Mode <span className="text-red-400">*</span></span>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Privacy mode">
          {(['anonymous', 'verifiable'] as const).map(mode => (
            <label
              key={mode}
              className={`flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                values.privacyMode === mode
                  ? 'border-violet-500 bg-violet-600/10'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <input
                type="radio"
                name="privacyMode"
                value={mode}
                checked={values.privacyMode === mode}
                onChange={() => setValues(v => ({ ...v, privacyMode: mode }))}
                className="sr-only"
              />
              <span className="text-white text-sm font-medium capitalize">{mode}</span>
              <span className="text-zinc-400 text-xs">
                {mode === 'anonymous'
                  ? "Sender's identity fully hidden"
                  : 'Sender can prove legitimacy without revealing identity'}
              </span>
            </label>
          ))}
        </div>
        {errors.privacyMode && <p role="alert" className="text-red-400 text-xs mt-1">{errors.privacyMode}</p>}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          aria-label="Create payment link"
          className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {submitting ? 'Creating…' : 'Create Link'}
        </button>
      </div>
    </form>
  )
}
