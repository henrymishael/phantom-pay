import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PrivacyModeBadge } from '../PrivacyModeBadge'

describe('PrivacyModeBadge', () => {
  it('renders anonymous mode correctly', () => {
    render(<PrivacyModeBadge mode="anonymous" />)
    
    const badge = screen.getByText('Anonymous')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Privacy mode: anonymous')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('renders verifiable mode correctly', () => {
    render(<PrivacyModeBadge mode="verifiable" />)
    
    const badge = screen.getByText('Verifiable')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Privacy mode: verifiable')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('applies custom className', () => {
    render(<PrivacyModeBadge mode="anonymous" className="custom-class" />)
    
    const badge = screen.getByText('Anonymous')
    expect(badge).toHaveClass('custom-class')
  })
})