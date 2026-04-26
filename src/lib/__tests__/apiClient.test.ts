import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApiClient, ApiError } from '../apiClient'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ApiClient', () => {
  const mockGetSessionKey = vi.fn()
  let apiClient: ReturnType<typeof createApiClient>

  beforeEach(() => {
    vi.clearAllMocks()
    apiClient = createApiClient(mockGetSessionKey)
    
    // Set default environment variable
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
  })

  it('should attach session key in Authorization header when available', async () => {
    mockGetSessionKey.mockReturnValue('test-session-key')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    await apiClient.getLinks()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/payments/links',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-session-key'
        },
        body: undefined
      }
    )
  })

  it('should not include Authorization header when session key is null', async () => {
    mockGetSessionKey.mockReturnValue(null)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    await apiClient.getPublicLink('test-link-id')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/payments/links/test-link-id',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: undefined
      }
    )
  })

  it('should throw ApiError on non-2xx response', async () => {
    mockGetSessionKey.mockReturnValue('test-session-key')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({
        error: 'Bad Request',
        details: [{ field: 'amount', message: 'Amount is required' }]
      })
    })

    try {
      await apiClient.getLinks()
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.status).toBe(400)
        expect(error.message).toBe('Bad Request')
        expect(error.details).toEqual([{ field: 'amount', message: 'Amount is required' }])
      }
    }
  })

  it('should handle connect method with correct payload', async () => {
    mockGetSessionKey.mockReturnValue(null) // No session key for connect
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        sessionToken: 'token',
        sessionKey: 'key',
        sessionWalletPublicKey: 'pubkey'
      })
    })

    const result = await apiClient.connect('wallet-address', 'signature')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/auth/connect',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: 'wallet-address',
          signature: 'signature'
        })
      }
    )

    expect(result).toEqual({
      sessionToken: 'token',
      sessionKey: 'key',
      sessionWalletPublicKey: 'pubkey'
    })
  })

  it('should handle payment submission with optional senderProof', async () => {
    mockGetSessionKey.mockReturnValue(null) // Public endpoint
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        txHash: 'hash123',
        proofValid: true
      })
    })

    const result = await apiClient.submitPayment('link-id', {
      senderProof: 'proof123'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/payments/pay/link-id',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderProof: 'proof123'
        })
      }
    )

    expect(result).toEqual({
      txHash: 'hash123',
      proofValid: true
    })
  })

  it('should handle session key only in Authorization header, never in URL or body', async () => {
    mockGetSessionKey.mockReturnValue('secret-session-key')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    })

    await apiClient.createLink({
      amount: 100,
      token: 'SOL',
      privacyMode: 'anonymous'
    })

    const [url, options] = mockFetch.mock.calls[0]
    
    // Session key should NOT be in URL
    expect(url).not.toContain('secret-session-key')
    
    // Session key should NOT be in body
    expect(options.body).not.toContain('secret-session-key')
    
    // Session key SHOULD be in Authorization header
    expect(options.headers['Authorization']).toBe('Bearer secret-session-key')
  })
})