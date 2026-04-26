import { describe, it, expect } from 'vitest'

describe('Dependencies verification', () => {
  it('should have all required dependencies available', async () => {
    // Test React Query
    const { QueryClient } = await import('@tanstack/react-query')
    expect(QueryClient).toBeDefined()

    // Test Solana wallet adapter
    const { useWallet } = await import('@solana/wallet-adapter-react')
    expect(useWallet).toBeDefined()

    // Test wallet adapters
    const { PhantomWalletAdapter } = await import('@solana/wallet-adapter-wallets')
    expect(PhantomWalletAdapter).toBeDefined()

    // Test fast-check for property-based testing
    const fc = await import('fast-check')
    expect(fc.default).toBeDefined()

    // Test React Testing Library
    const { render } = await import('@testing-library/react')
    expect(render).toBeDefined()
  })
})