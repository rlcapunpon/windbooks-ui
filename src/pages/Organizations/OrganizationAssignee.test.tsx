import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OrganizationAssignee from './OrganizationAssignee'

describe('OrganizationAssignee', () => {
  it('renders organization assignee page with correct title and description', () => {
    render(<OrganizationAssignee />)

    expect(screen.getByText('Organization Assignee')).toBeInTheDocument()
    expect(screen.getByText('Manage organization assignees and assignments')).toBeInTheDocument()
  })

  it('displays placeholder content for organization assignee management', () => {
    render(<OrganizationAssignee />)

    expect(screen.getByText('Organization Assignee Management')).toBeInTheDocument()
    expect(screen.getByText('This feature is under development. Organization assignee management functionality will be available soon.')).toBeInTheDocument()
  })

  it('shows appropriate icon for under development state', () => {
    render(<OrganizationAssignee />)

    // Check for the user group icon (used for organization/user management)
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders in a structured layout with proper spacing', () => {
    const { container } = render(<OrganizationAssignee />)

    // Check for main container with space-y-6 class
    const mainContainer = container.firstChild
    expect(mainContainer).toHaveClass('space-y-6')

    // Check for header section - OrganizationAssignee doesn't have a complex header like other pages
    const title = screen.getByText('Organization Assignee')
    expect(title).toBeInTheDocument()

    // Check for content section with proper styling
    const contentSection = screen.getByText('Organization Assignee Management').closest('.bg-white')
    expect(contentSection).toHaveClass('bg-white', 'shadow-sm', 'rounded-lg', 'border', 'border-gray-200', 'p-8')
  })

  it('centers the placeholder content appropriately', () => {
    render(<OrganizationAssignee />)

    const placeholderDiv = screen.getByText('Organization Assignee Management').closest('div')
    expect(placeholderDiv).toHaveClass('text-center')
  })
})