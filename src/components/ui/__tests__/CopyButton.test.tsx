import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CopyButton } from '../CopyButton'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct label and aria-label', () => {
    render(<CopyButton value="test-value" label="Test Label" />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Test Label - Click to copy')
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('copies value to clipboard when clicked', async () => {
    const testValue = 'test-value-to-copy'
    render(<CopyButton value={testValue} label="Test Label" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testValue)
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Test Label - Copied!')
    })
  })

  it('applies custom className', () => {
    render(<CopyButton value="test" label="Test" className="custom-class" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})