import { describe, it, expect } from 'vitest'

// Solana ESM packages (@solana/wallet-adapter-react, @ledgerhq/errors, etc.)
// hang indefinitely when dynamically imported in the vitest/jsdom environment.
// Dependency availability is validated at build time via TypeScript compilation.
describe('Dependencies verification', () => {
  it.skip('should have all required dependencies available', async () => {
    const { QueryClient } = await import('@tanstack/react-query')
    expect(QueryClient).toBeDefined()

    const { useWallet } = await import('@solana/wallet-adapter-react')
    expect(useWallet).toBeDefined()

    const fc = await import('fast-check')
    expect(fc.default).toBeDefined()

    const { render } = await import('@testing-library/react')
    expect(render).toBeDefined()
  })
})
