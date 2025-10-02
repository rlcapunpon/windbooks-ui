import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeatureUnderDevelopment from './FeatureUnderDevelopment'

describe('FeatureUnderDevelopment', () => {
  it('should render the feature under development page with default title', () => {
    render(<FeatureUnderDevelopment />)

    expect(screen.getByText('Feature Under Development')).toBeInTheDocument()
  })

  it('should render the feature under development page with custom title', () => {
    render(<FeatureUnderDevelopment title="Custom Feature" />)

    expect(screen.getByText('Custom Feature')).toBeInTheDocument()
  })

  it('should display the default description message', () => {
    render(<FeatureUnderDevelopment />)

    expect(screen.getByText('This feature is currently under development. Please check back later.')).toBeInTheDocument()
  })

  it('should display custom description when provided', () => {
    const customDescription = 'This awesome feature is coming soon!'
    render(<FeatureUnderDevelopment description={customDescription} />)

    expect(screen.getByText(customDescription)).toBeInTheDocument()
  })

  it('should display a construction/development icon', () => {
    render(<FeatureUnderDevelopment />)

    // Check for an icon element (could be SVG or icon component)
    const iconElement = document.querySelector('svg') || screen.getByRole('img', { hidden: true })
    expect(iconElement).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<FeatureUnderDevelopment />)

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Feature Under Development')
  })

  it('should render with proper styling classes', () => {
    const { container } = render(<FeatureUnderDevelopment />)

    // Check for main container styling
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
  })

  it('should display content in a centered card layout', () => {
    render(<FeatureUnderDevelopment />)

    // Check for card-like container
    const cardContainer = screen.getByText('Feature Under Development').closest('.bg-white')
    expect(cardContainer).toBeInTheDocument()
    expect(cardContainer).toHaveClass('bg-white', 'shadow-lg', 'rounded-lg')
  })
})