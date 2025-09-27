import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateOrganizationButton } from './CreateOrganizationButton'

describe('CreateOrganizationButton', () => {
  const mockOnCreate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Permission-based Visibility', () => {
    it('should render button when user has create permission', () => {
      render(
        <CreateOrganizationButton
          hasCreatePermission={true}
          onCreate={mockOnCreate}
        />
      )

      expect(screen.getByText('Create Organization')).toBeInTheDocument()
    })

    it('should not render button when user lacks create permission', () => {
      render(
        <CreateOrganizationButton
          hasCreatePermission={false}
          onCreate={mockOnCreate}
        />
      )

      expect(screen.queryByText('Create Organization')).not.toBeInTheDocument()
    })
  })

  describe('Button Properties', () => {
    it('should have correct button attributes', () => {
      render(
        <CreateOrganizationButton
          hasCreatePermission={true}
          onCreate={mockOnCreate}
        />
      )

      const button = screen.getByText('Create Organization')
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveClass('inline-flex', 'items-center', 'px-4', 'py-2')
    })

    it('should have plus icon', () => {
      render(
        <CreateOrganizationButton
          hasCreatePermission={true}
          onCreate={mockOnCreate}
        />
      )

      const button = screen.getByText('Create Organization')
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Click Handling', () => {
    it('should call onCreate when button is clicked', async () => {
      render(
        <CreateOrganizationButton
          hasCreatePermission={true}
          onCreate={mockOnCreate}
        />
      )

      const button = screen.getByText('Create Organization')
      await userEvent.click(button)

      expect(mockOnCreate).toHaveBeenCalledTimes(1)
    })

    it('should not call onCreate when button is not rendered', () => {
      render(
        <CreateOrganizationButton
          hasCreatePermission={false}
          onCreate={mockOnCreate}
        />
      )

      // Button shouldn't exist, so no click possible
      expect(mockOnCreate).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(
        <CreateOrganizationButton
          hasCreatePermission={true}
          onCreate={mockOnCreate}
        />
      )

      const button = screen.getByText('Create Organization')
      expect(button).toHaveAttribute('aria-label', 'Create new organization')
    })
  })
})