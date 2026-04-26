import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SkeletonBlock } from '../SkeletonBlock'

describe('SkeletonBlock', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonBlock />)
    
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded', 'w-full', 'h-4')
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies custom width and height', () => {
    const { container } = render(<SkeletonBlock width="w-32" height="h-8" />)
    
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('w-32', 'h-8')
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonBlock className="custom-class" />)
    
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('custom-class')
  })

  it('combines all classes correctly', () => {
    const { container } = render(<SkeletonBlock width="w-24" height="h-6" className="mb-4" />)
    
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded', 'w-24', 'h-6', 'mb-4')
  })
})