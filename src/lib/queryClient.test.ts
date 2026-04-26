import { describe, it, expect } from 'vitest'
import { queryClient } from './queryClient'

describe('queryClient', () => {
  it('should be configured with correct default options', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    
    expect(defaultOptions.queries?.staleTime).toBe(30_000)
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true)
    expect(defaultOptions.queries?.retry).toBe(2)
  })
})