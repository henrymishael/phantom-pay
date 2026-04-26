import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ToastNotification } from '../ToastNotification'

describe('ToastNotification', () => {
  it('renders message with correct role and aria-live', () => {
    const message = 'Test notification'
    render(<ToastNotification message={message} type="info" />)
    
    const notification = screen.getByRole('alert')
    expect(notification).toBeInTheDocument()
    expect(notification).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('applies correct background color for success type', () => {
    render(<ToastNotification message="Success" type="success" />)
    
    const notification = screen.getByRole('alert')
    expect(notification).toHaveClass('bg-green-500')
  })

  it('applies correct background color for error type', () => {
    render(<ToastNotification message="Error" type="error" />)
    
    const notification = screen.getByRole('alert')
    expect(notification).toHaveClass('bg-red-500')
  })

  it('applies correct background color for info type', () => {
    render(<ToastNotification message="Info" type="info" />)
    
    const notification = screen.getByRole('alert')
    expect(notification).toHaveClass('bg-blue-500')
  })

  it('renders close button when onClose is provided', () => {
    const onClose = vi.fn()
    render(<ToastNotification message="Test" type="info" onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: 'Close notification' })
    expect(closeButton).toBeInTheDocument()
    
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render close button when onClose is not provided', () => {
    render(<ToastNotification message="Test" type="info" />)
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})