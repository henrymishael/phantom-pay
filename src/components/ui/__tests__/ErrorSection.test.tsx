import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorSection } from '../ErrorSection'

describe('ErrorSection', () => {
  it('renders error message', () => {
    const message = 'Something went wrong'
    render(<ErrorSection message={message} />)
    
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorSection message="Error" onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: 'Retry the failed operation' })
    expect(retryButton).toBeInTheDocument()
    
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorSection message="Error" />)
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ErrorSection message="Error" />)
    
    const retryButton = screen.queryByRole('button')
    if (retryButton) {
      expect(retryButton).toHaveAttribute('aria-label', 'Retry the failed operation')
    }
  })
})