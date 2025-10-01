import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpdateOrganizationStatusModal } from './UpdateOrganizationStatusModal'
import type { OrganizationStatus } from '../../services/organizationService'

// Mock data
const mockCurrentStatus: OrganizationStatus = {
  id: 'status-123',
  organization_id: 'org-123',
  status: 'ACTIVE',
  reason: 'APPROVED',
  description: 'Currently operating',
  last_update: '2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

describe('UpdateOrganizationStatusModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      expect(screen.queryByText('Update Business Status')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      expect(screen.getByText('Update Business Status')).toBeInTheDocument()
    })

    it('should render modal overlay and content', () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Update Business Status')).toBeInTheDocument()
    })
  })

  describe('Form Elements', () => {
    beforeEach(() => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )
    })

    it('should render status dropdown with all valid status options', () => {
      const statusSelect = screen.getByRole('combobox', { name: /business status/i })
      expect(statusSelect).toBeInTheDocument()

      // Check for all valid status options
      const expectedStatuses = [
        'Pending Registration',
        'Registered',
        'Active',
        'Inactive',
        'Cessation',
        'Closed',
        'Non-Compliant',
        'Under Audit',
        'Suspended'
      ]

      expectedStatuses.forEach(status => {
        expect(screen.getByRole('option', { name: status })).toBeInTheDocument()
      })
    })

    it('should render reason dropdown with all valid reason options', () => {
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i })
      expect(reasonSelect).toBeInTheDocument()

      // Check for all valid reason options
      const expectedReasons = [
        'Approved',
        'Removed',
        'Expired',
        'Opted Out',
        'Payment Pending',
        'Violations'
      ]

      expectedReasons.forEach(reason => {
        expect(screen.getByRole('option', { name: reason })).toBeInTheDocument()
      })
    })

    it('should render description textarea', () => {
      const descriptionTextarea = screen.getByRole('textbox', { name: /description/i })
      expect(descriptionTextarea).toBeInTheDocument()
      expect(descriptionTextarea.tagName).toBe('TEXTAREA')
    })

    it('should render Save and Cancel buttons', () => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('Form Initialization', () => {
    it('should initialize form with current status values', () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      const statusSelect = screen.getByRole('combobox', { name: /business status/i }) as HTMLSelectElement
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i }) as HTMLSelectElement
      const descriptionTextarea = screen.getByRole('textbox', { name: /description/i }) as HTMLTextAreaElement

      expect(statusSelect.value).toBe('ACTIVE')
      expect(reasonSelect.value).toBe('APPROVED')
      expect(descriptionTextarea.value).toBe('Currently operating')
    })

    it('should handle missing description gracefully', () => {
      const statusWithoutDescription = {
        ...mockCurrentStatus,
        description: undefined
      }

      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={statusWithoutDescription}
          loading={false}
        />
      )

      const descriptionTextarea = screen.getByRole('textbox', { name: /description/i }) as HTMLTextAreaElement
      expect(descriptionTextarea.value).toBe('')
    })
  })

  describe('User Interactions', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
      user = userEvent.setup()
    })

    it('should call onClose when Cancel button is clicked', async () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when clicking outside modal (overlay)', async () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      const overlay = screen.getByRole('dialog').parentElement
      if (overlay) {
        await user.click(overlay)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should update status when status dropdown value changes', async () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      const statusSelect = screen.getByRole('combobox', { name: /business status/i })
      await user.selectOptions(statusSelect, 'INACTIVE')

      expect((statusSelect as HTMLSelectElement).value).toBe('INACTIVE')
    })

    it('should update reason when reason dropdown value changes', async () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      const reasonSelect = screen.getByRole('combobox', { name: /reason/i })
      await user.selectOptions(reasonSelect, 'EXPIRED')

      expect((reasonSelect as HTMLSelectElement).value).toBe('EXPIRED')
    })

    it('should update description when textarea value changes', async () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      const descriptionTextarea = screen.getByRole('textbox', { name: /description/i })
      await user.clear(descriptionTextarea)
      await user.type(descriptionTextarea, 'New status description')

      expect((descriptionTextarea as HTMLTextAreaElement).value).toBe('New status description')
    })
  })

  describe('Form Submission', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
      user = userEvent.setup()
    })

    it('should call onSave with form data when Save button is clicked', async () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      // Update form values
      const statusSelect = screen.getByRole('combobox', { name: /business status/i })
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i })
      const descriptionTextarea = screen.getByRole('textbox', { name: /description/i })

      await user.selectOptions(statusSelect, 'INACTIVE')
      await user.selectOptions(reasonSelect, 'EXPIRED')
      await user.clear(descriptionTextarea)
      await user.type(descriptionTextarea, 'License expired')

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledTimes(1)
      expect(mockOnSave).toHaveBeenCalledWith({
        status: 'INACTIVE',
        reason: 'EXPIRED',
        description: 'License expired'
      })
    })

    it('should handle form submission with empty description', async () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      const descriptionTextarea = screen.getByRole('textbox', { name: /description/i })
      await user.clear(descriptionTextarea)

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        status: 'ACTIVE',
        reason: 'APPROVED',
        description: ''
      })
    })
  })

  describe('Loading State', () => {
    it('should disable Save button when loading is true', () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={true}
        />
      )

      const saveButton = screen.getByRole('button', { name: /saving/i })
      expect(saveButton).toBeDisabled()
    })

    it('should show loading text on Save button when loading', () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={true}
        />
      )

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    })

    it('should disable form inputs when loading is true', () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={true}
        />
      )

      const statusSelect = screen.getByRole('combobox', { name: /business status/i })
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i })
      const descriptionTextarea = screen.getByRole('textbox', { name: /description/i })

      expect(statusSelect).toBeDisabled()
      expect(reasonSelect).toBeDisabled()
      expect(descriptionTextarea).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <UpdateOrganizationStatusModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          currentStatus={mockCurrentStatus}
          loading={false}
        />
      )

      // Tab through form elements
      const statusSelect = screen.getByRole('combobox', { name: /business status/i })
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i })
      const descriptionTextarea = screen.getByRole('textbox', { name: /description/i })
      const saveButton = screen.getByRole('button', { name: /save/i })

      // Focus first form element (status select)
      await statusSelect.focus()
      expect(statusSelect).toHaveFocus()

      await user.tab()
      expect(reasonSelect).toHaveFocus()

      await user.tab()
      expect(descriptionTextarea).toHaveFocus()

      await user.tab()
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toHaveFocus()

      await user.tab()
      expect(saveButton).toHaveFocus()
    })
  })
})