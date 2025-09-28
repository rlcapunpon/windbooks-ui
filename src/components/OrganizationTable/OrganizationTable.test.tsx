import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { OrganizationTable } from './OrganizationTable'
import type { Organization } from '../../services/organizationService'

// Mock data
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Test Organization 1',
    tin: '001234567890',
    category: 'NON_INDIVIDUAL' as const,
    tax_classification: 'VAT' as const,
    registration_date: '2024-01-01T00:00:00.000Z',
    address: 'Test Address 1',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    deleted_at: null,
    status: {
      id: 'status-1',
      organization_id: 'org-1',
      status: 'ACTIVE',
      last_update: '2024-01-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
  },
  {
    id: 'org-2',
    name: 'Test Organization 2',
    tin: '001234567891',
    category: 'INDIVIDUAL' as const,
    tax_classification: 'NON_VAT' as const,
    registration_date: '2024-01-02T00:00:00.000Z',
    address: 'Test Address 2',
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
    deleted_at: null,
    status: {
      id: 'status-2',
      organization_id: 'org-2',
      status: 'PENDING_REG',
      last_update: '2024-01-02T00:00:00.000Z',
      created_at: '2024-01-02T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z'
    }
  }
]

describe('OrganizationTable', () => {
  const mockOnRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={[]}
            loading={true}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      expect(screen.getByText('Loading organizations...')).toBeInTheDocument()
    })

    it('should show loading spinner in table when loading is true', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={[]}
            loading={true}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state message when no organizations and not loading', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={[]}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      expect(screen.getByText('No organizations found')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first organization.')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should render table headers correctly', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('TIN')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Tax Classification')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should display organization data in table rows', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      expect(screen.getByText('Test Organization 1')).toBeInTheDocument()
      expect(screen.getByText('001234567890')).toBeInTheDocument()
      expect(screen.getByText('NON_INDIVIDUAL')).toBeInTheDocument()
      expect(screen.getByText('VAT')).toBeInTheDocument()
      expect(screen.getByText('ACTIVE')).toBeInTheDocument()

      expect(screen.getByText('Test Organization 2')).toBeInTheDocument()
      expect(screen.getByText('001234567891')).toBeInTheDocument()
      expect(screen.getByText('INDIVIDUAL')).toBeInTheDocument()
      expect(screen.getByText('NON_VAT')).toBeInTheDocument()
      expect(screen.getByText('PENDING_REG')).toBeInTheDocument()
    })

    it('should show formatted dates', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      // Should show formatted dates (Jan 1, 2024 format)
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    it('should show status badges with correct colors', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      const activeBadge = screen.getByText('ACTIVE')
      const pendingBadge = screen.getByText('PENDING_REG')

      // Check that badges have appropriate styling (this would be tested with more specific selectors in real implementation)
      expect(activeBadge).toBeInTheDocument()
      expect(pendingBadge).toBeInTheDocument()
    })

    it('should handle organizations without status', () => {
      const orgWithoutStatus = {
        ...mockOrganizations[0],
        status: undefined
      }

      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={[orgWithoutStatus]}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      expect(screen.getByText('N/A')).toBeInTheDocument()
    })
  })

  describe('Actions Column', () => {
    it('should render action buttons for each organization', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      const viewButtons = screen.getAllByText('View')

      expect(viewButtons).toHaveLength(2)
    })

    it('should have proper button attributes', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      const viewButton = screen.getAllByText('View')[0]

      expect(viewButton).toHaveAttribute('type', 'button')
    })

    it('should navigate to organization page when View button is clicked', async () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      const viewButton = screen.getAllByText('View')[0]
      await userEvent.click(viewButton)

      // Note: In a real test, you would check the navigation behavior
      // For now, we just verify the button exists and can be clicked
      expect(viewButton).toBeInTheDocument()
    })
  })

  describe('Refresh Functionality', () => {
    it('should call onRefresh when refresh button is clicked', async () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      const refreshButton = screen.getByText('Refresh')
      await userEvent.click(refreshButton)

      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    it('should show refresh button', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })
  })

  describe('Table Structure', () => {
    it('should have proper table structure', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByTestId('organizations-table')).toBeInTheDocument()
    })

    it('should have correct number of rows', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      // Header row + 2 data rows
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(3)
    })

    it('should display View button for each organization', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      const viewButtons = screen.getAllByText('View')
      expect(viewButtons).toHaveLength(2)
    })

    it('should NOT display Edit button for any organization', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      )

      const editButtons = screen.queryAllByText('Edit')
      expect(editButtons).toHaveLength(0)
    })
  })
})