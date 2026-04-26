import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TruncatedAddress } from '../TruncatedAddress'

describe('TruncatedAddress', () => {
  it('renders first 4 and last 4 characters with ellipsis', () => {
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    render(<TruncatedAddress address={address} />)
    
    const truncated = screen.getByText('1A1z...vfNa')
    expect(truncated).toBeInTheDocument()
    expect(truncated).toHaveAttribute('title', address)
  })

  it('handles addresses exactly 8 characters long', () => {
    const address = '12345678'
    render(<TruncatedAddress address={address} />)
    
    const truncated = screen.getByText('1234...5678')
    expect(truncated).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    render(<TruncatedAddress address={address} className="custom-class" />)
    
    const element = screen.getByText('1A1z...vfNa')
    expect(element).toHaveClass('custom-class')
  })
})