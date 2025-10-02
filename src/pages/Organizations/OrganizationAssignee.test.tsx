import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OrganizationAssignee from './OrganizationAssignee'

describe('OrganizationAssignee', () => {
  it('renders organization assignee page with correct title and description', () => {
    render(<OrganizationAssignee />)

    expect(screen.getByText('Organization Assignee Management')).toBeInTheDocument()
    expect(screen.getByText('Manage organization assignees and assignments. This feature is currently under development and will be available soon.')).toBeInTheDocument()
  })

  it('displays placeholder content for organization assignee management', () => {
    render(<OrganizationAssignee />)

    expect(screen.getByText('Organization Assignee Management')).toBeInTheDocument()
    expect(screen.getByText('Manage organization assignees and assignments. This feature is currently under development and will be available soon.')).toBeInTheDocument()
  })

  it('shows appropriate icon for under development state', () => {
    render(<OrganizationAssignee />)

    // Check for the development/construction icon
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders in a structured layout with proper spacing', () => {
    const { container } = render(<OrganizationAssignee />)

    // Check for main container with FeatureUnderDevelopment styling
    const mainContainer = container.firstChild
    expect(mainContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-50', 'py-12', 'px-4', 'sm:px-6', 'lg:px-8')

    // Check for the card container
    const cardContainer = screen.getByText('Organization Assignee Management').closest('.bg-white')
    expect(cardContainer).toHaveClass('bg-white', 'shadow-lg', 'rounded-lg', 'p-8', 'text-center')
  })

  it('centers the placeholder content appropriately', () => {
    render(<OrganizationAssignee />)

    const placeholderDiv = screen.getByText('Organization Assignee Management').closest('div')
    expect(placeholderDiv).toHaveClass('text-center')
  })
})