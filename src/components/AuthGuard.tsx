'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionKey } from '../hooks/useSessionKey'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isPresent } = useSessionKey()
  const router = useRouter()

  useEffect(() => {
    if (!isPresent()) {
      router.replace('/')
    }
  }, [isPresent, router])

  if (!isPresent()) return null

  return <>{children}</>
}
