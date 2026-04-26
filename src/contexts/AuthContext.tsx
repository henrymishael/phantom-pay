'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useSessionKey } from '../hooks/useSessionKey'
import { createApiClient, setApiClient, ApiError } from '../lib/apiClient'
import { useToast } from './ToastContext'

interface AuthContextValue {
  isAuthenticated: boolean
  walletAddress: string | null
  sessionCreatedAt: string | null
  connect(): Promise<void>
  disconnect(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, signMessage, disconnect: walletDisconnect, connected } = useWallet()
  const { getSessionKey, storeSessionKey, clearSessionKey, isPresent } = useSessionKey()
  const { addToast } = useToast()
  const router = useRouter()

  // Auth state - walletAddress held only in memory, never persisted
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null)

  // Initialize API client with session key access
  useEffect(() => {
    const client = createApiClient(getSessionKey)
    setApiClient(client)
  }, [getSessionKey])

  // Check authentication status on mount and when wallet/session changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const hasSession = isPresent()
      const hasWallet = connected && publicKey

      if (hasSession && hasWallet) {
        setIsAuthenticated(true)
        setWalletAddress(publicKey.toString())
        // Set a placeholder timestamp - in real app this would come from session data
        setSessionCreatedAt(new Date().toISOString())
      } else {
        setIsAuthenticated(false)
        setWalletAddress(null)
        setSessionCreatedAt(null)
      }
    }

    checkAuthStatus()
  }, [connected, publicKey, isPresent])

  // Listen for wallet disconnection events
  useEffect(() => {
    if (!connected && isAuthenticated) {
      // Wallet was disconnected - clear session and reset state
      clearSessionKey()
      setIsAuthenticated(false)
      setWalletAddress(null)
      setSessionCreatedAt(null)
    }
  }, [connected, isAuthenticated, clearSessionKey])

  const connect = useCallback(async () => {
    try {
      if (!publicKey || !signMessage) {
        throw new Error('Wallet not connected')
      }

      const client = createApiClient(getSessionKey)
      
      // Generate a client-side nonce since the backend doesn't provide one
      const nonce = crypto.randomUUID()

      // Sign the nonce as the challenge message
      const messageBytes = new TextEncoder().encode(nonce)
      
      // Request signature from wallet
      const signature = await signMessage(messageBytes)
      const signatureBase58 = Buffer.from(signature).toString('base64')

      // Send to backend for session creation (nonce required by API)
      const response = await client.connect(publicKey.toString(), signatureBase58, nonce)

      // Store session key encrypted in localStorage
      await storeSessionKey(response.sessionKey)

      // Update auth state
      setIsAuthenticated(true)
      setWalletAddress(publicKey.toString())
      setSessionCreatedAt(new Date().toISOString())

      addToast('Successfully connected to PhantomPay', 'success')
    } catch (error) {
      console.error('Authentication failed:', error)
      
      let errorMessage = 'Authentication failed'
      if (error instanceof ApiError) {
        errorMessage = error.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      addToast(errorMessage, 'error')
      throw error
    }
  }, [publicKey, signMessage, getSessionKey, storeSessionKey, addToast])

  const disconnect = useCallback(async () => {
    try {
      // Revoke session on backend
      const client = createApiClient(getSessionKey)
      await client.revokeSession()
    } catch (error) {
      console.error('Failed to revoke session:', error)
      // Continue with logout even if backend call fails
    }

    // Clear session key from localStorage
    clearSessionKey()

    // Disconnect wallet
    try {
      await walletDisconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }

    // Reset auth state
    setIsAuthenticated(false)
    setWalletAddress(null)
    setSessionCreatedAt(null)

    // Redirect to landing page
    router.push('/')

    addToast('Disconnected from PhantomPay', 'info')
  }, [getSessionKey, clearSessionKey, walletDisconnect, router, addToast])

  const value: AuthContextValue = {
    isAuthenticated,
    walletAddress,
    sessionCreatedAt,
    connect,
    disconnect,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}