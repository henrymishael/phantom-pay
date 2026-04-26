import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProofBadge } from '../ProofBadge'

describe('ProofBadge', () => {
  it('renders when proofValid is true', () => {
    render(<ProofBadge proofValid={true} />)
    
    const badge = screen.getByRole('status')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Verified sender badge')
    expect(screen.getByText('Verified sender, identity withheld')).toBeInTheDocument()
  })

  it('does not render when proofValid is false', () => {
    render(<ProofBadge proofValid={false} />)
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('Verified sender, identity withheld')).not.toBeInTheDocument()
  })

  it('does not render when proofValid is undefined', () => {
    render(<ProofBadge proofValid={undefined as any} />)
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})