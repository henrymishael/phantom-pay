import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { AuthProvider, useAuth } from '../AuthContext'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSessionKey } from '../../hooks/useSessionKey'
import { useToast } from '../ToastContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
vi.mock('@solana/wallet-adapter-react')
vi.mock('../../hooks/useSessionKey')
vi.mock('../ToastContext')
vi.mock('next/navigation')

const mockUseWallet = vi.mocked(useWallet)
const mockUseSessionKey = vi.mocked(useSessionKey)
const mockUseToast = vi.mocked(useToast)
const mockUseRouter = vi.mocked(useRouter)

// Test component to access auth context
function TestComponent() {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="wallet-address">{auth.walletAddress || 'null'}</div>
      <div data-testid="session-created">{auth.sessionCreatedAt || 'null'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  const mockAddToast = vi.fn()
  const mockPush = vi.fn()
  const mockGetSessionKey = vi.fn()
  const mockStoreSessionKey = vi.fn()
  const mockClearSessionKey = vi.fn()
  const mockIsPresent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseToast.mockReturnValue({
      toasts: [],
      addToast: mockAddToast,
      removeToast: vi.fn(),
    })
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })
    
    mockUseSessionKey.mockReturnValue({
      getSessionKey: mockGetSessionKey,
      storeSessionKey: mockStoreSessionKey,
      clearSessionKey: mockClearSessionKey,
      isPresent: mockIsPresent,
      isReady: true,
    })
  })

  it('should render unauthenticated state when no wallet or session', () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      signMessage: undefined,
      disconnect: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)
    
    mockIsPresent.mockReturnValue(false)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('null')
    expect(screen.getByTestId('session-created')).toHaveTextContent('null')
  })

  it('should render authenticated state when wallet connected and session present', () => {
    const mockPublicKey = {
      toString: () => '11111111111111111111111111111112'
    }

    mockUseWallet.mockReturnValue({
      publicKey: mockPublicKey,
      connected: true,
      signMessage: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)
    
    mockIsPresent.mockReturnValue(true)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('11111111111111111111111111111112')
  })

  it('should clear session when wallet disconnects', () => {
    const mockPublicKey = {
      toString: () => '11111111111111111111111111111112'
    }

    // Start with connected wallet and session
    mockUseWallet.mockReturnValue({
      publicKey: mockPublicKey,
      connected: true,
      signMessage: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)
    
    mockIsPresent.mockReturnValue(true)

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Verify authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')

    // Simulate wallet disconnection
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      signMessage: undefined,
      disconnect: vi.fn(),
    } as unknown as ReturnType<typeof useWallet>)

    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Should clear session and reset state
    expect(mockClearSessionKey).toHaveBeenCalled()
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('null')
  })

  it('should throw error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })
})