import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SystemSettings from './SystemSettings'

describe('SystemSettings', () => {
  it('renders system settings page with correct title and description', () => {
    render(<SystemSettings />)

    expect(screen.getByText('System Settings')).toBeInTheDocument()
    expect(screen.getByText('Configure system-wide settings and preferences. This feature is currently under development and will be available soon.')).toBeInTheDocument()
  })

  it('displays placeholder content for system settings management', () => {
    render(<SystemSettings />)

    expect(screen.getByText('System Settings')).toBeInTheDocument()
    expect(screen.getByText('Configure system-wide settings and preferences. This feature is currently under development and will be available soon.')).toBeInTheDocument()
  })

  it('shows appropriate icon for under development state', () => {
    render(<SystemSettings />)

    // Check for the development/construction icon
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders in a structured layout with proper spacing', () => {
    const { container } = render(<SystemSettings />)

    // Check for main container with FeatureUnderDevelopment styling
    const mainContainer = container.firstChild
    expect(mainContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-50', 'py-12', 'px-4', 'sm:px-6', 'lg:px-8')

    // Check for the card container
    const cardContainer = screen.getByText('System Settings').closest('.bg-white')
    expect(cardContainer).toHaveClass('bg-white', 'shadow-lg', 'rounded-lg', 'p-8', 'text-center')
  })

  it('centers the placeholder content appropriately', () => {
    render(<SystemSettings />)

    const placeholderDiv = screen.getByText('System Settings').closest('div')
    expect(placeholderDiv).toHaveClass('text-center')
  })
})