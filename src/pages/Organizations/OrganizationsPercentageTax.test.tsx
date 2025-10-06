import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import OrganizationsPercentageTax from './OrganizationsPercentageTax'
import { OrganizationService } from '../../services/organizationService'
import { UserService } from '../../services/userService'
import type { Organization } from '../../services/organizationService'

// Mock component interfaces
interface MockOrganizationTableProps {
  organizations: Organization[]
  loading: boolean
  onRefresh: () => void
}

interface MockCreateOrganizationButtonProps {
  hasCreatePermission: boolean
  onCreate: () => void
}

interface MockCreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: Organization) => Promise<void> | void
}

// Mock dependencies
vi.mock('../../services/organizationService')
vi.mock('../../services/userService')
vi.mock('../../components/OrganizationTable/OrganizationTable', () => ({
  OrganizationTable: ({ organizations, loading, onRefresh }: MockOrganizationTableProps) => (
    <div data-testid="organization-table">
      <div data-testid="organizations-data">{JSON.stringify(organizations)}</div>
      <div data-testid="loading-state">{loading ? 'loading' : 'not-loading'}</div>
      <button data-testid="refresh-btn" onClick={onRefresh}>Refresh</button>
    </div>
  )
}))
vi.mock('../../components/CreateOrganizationButton/CreateOrganizationButton', () => ({
  CreateOrganizationButton: ({ hasCreatePermission, onCreate }: MockCreateOrganizationButtonProps) => (
    hasCreatePermission ? (
      <button data-testid="create-org-btn" onClick={onCreate}>
        Create Organization
      </button>
    ) : null
  )
}))
vi.mock('../../components/CreateOrganizationModal/CreateOrganizationModal', () => ({
  CreateOrganizationModal: ({ isOpen, onClose, onSuccess }: MockCreateOrganizationModalProps) => (
    isOpen ? (
      <div data-testid="create-modal">
        <button data-testid="close-modal-btn" onClick={onClose}>Close</button>
        <button data-testid="success-btn" onClick={() => onSuccess({ id: 'new-org' } as Organization)}>Success</button>
      </div>
    ) : null
  )
}))

describe('OrganizationsPercentageTax', () => {
  const mockOrganizations = [
    {
      id: '1',
      name: 'Percentage Tax Organization 1',
      tin: '123456789',
      category: 'INDIVIDUAL' as const,
      tax_classification: 'NON_VAT' as const,
      registration_date: '2024-01-01',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      deleted_at: null
    },
    {
      id: '2',
      name: 'Percentage Tax Organization 2',
      tin: '987654321',
      category: 'NON_INDIVIDUAL' as const,
      tax_classification: 'NON_VAT' as const,
      registration_date: '2024-01-01',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      deleted_at: null
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(OrganizationService.getAllOrganizations).mockResolvedValue(mockOrganizations)
    vi.mocked(UserService.hasPermission).mockReturnValue(true)
    vi.mocked(UserService.isSuperAdmin).mockReturnValue(false)
  })

  it('renders Percentage Tax organizations page with correct title and description', async () => {
    render(<OrganizationsPercentageTax />)

    expect(screen.getByText('Percentage Tax Organizations')).toBeInTheDocument()
    expect(screen.getByText('Manage and monitor percentage tax organizations')).toBeInTheDocument()
  })

  it('loads and displays NON_VAT organizations on mount', async () => {
    render(<OrganizationsPercentageTax />)

    await waitFor(() => {
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledWith({ tax_classification: 'NON_VAT' })
    })

    await waitFor(() => {
      const organizationsData = screen.getByTestId('organizations-data')
      expect(JSON.parse(organizationsData.textContent || '[]')).toEqual(mockOrganizations)
    })
  })

  it('shows loading state initially', () => {
    render(<OrganizationsPercentageTax />)

    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
  })

  it('hides loading state after data loads', async () => {
    render(<OrganizationsPercentageTax />)

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('not-loading')
    })
  })

  it('displays error message when loading fails', async () => {
    const errorMessage = 'Failed to load Percentage Tax organizations'
    vi.mocked(OrganizationService.getAllOrganizations).mockRejectedValue(new Error(errorMessage))

    render(<OrganizationsPercentageTax />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load Percentage Tax organizations. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows create organization button when user has permission', () => {
    render(<OrganizationsPercentageTax />)

    expect(screen.getByTestId('create-org-btn')).toBeInTheDocument()
  })

  it('hides create organization button when user lacks permission', () => {
    vi.mocked(UserService.hasPermission).mockReturnValue(false)
    vi.mocked(UserService.isSuperAdmin).mockReturnValue(false)

    render(<OrganizationsPercentageTax />)

    expect(screen.queryByTestId('create-org-btn')).not.toBeInTheDocument()
  })

  it('shows create organization button for super admin', () => {
    vi.mocked(UserService.hasPermission).mockReturnValue(false)
    vi.mocked(UserService.isSuperAdmin).mockReturnValue(true)

    render(<OrganizationsPercentageTax />)

    expect(screen.getByTestId('create-org-btn')).toBeInTheDocument()
  })

  it('opens create organization modal when create button is clicked', () => {
    render(<OrganizationsPercentageTax />)

    const createBtn = screen.getByTestId('create-org-btn')
    fireEvent.click(createBtn)

    expect(screen.getByTestId('create-modal')).toBeInTheDocument()
  })

  it('closes create organization modal when close button is clicked', () => {
    render(<OrganizationsPercentageTax />)

    // Open modal
    const createBtn = screen.getByTestId('create-org-btn')
    fireEvent.click(createBtn)

    // Close modal
    const closeBtn = screen.getByTestId('close-modal-btn')
    fireEvent.click(closeBtn)

    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument()
  })

  it('refreshes organizations list when refresh button is clicked', async () => {
    render(<OrganizationsPercentageTax />)

    await waitFor(() => {
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledTimes(1)
    })

    const refreshBtn = screen.getByTestId('refresh-btn')
    fireEvent.click(refreshBtn)

    await waitFor(() => {
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledTimes(2)
    })
  })

  it('refreshes organizations list after successful organization creation', async () => {
    render(<OrganizationsPercentageTax />)

    await waitFor(() => {
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledTimes(1)
    })

    // Open and complete create modal
    const createBtn = screen.getByTestId('create-org-btn')
    fireEvent.click(createBtn)

    const successBtn = screen.getByTestId('success-btn')
    fireEvent.click(successBtn)

    await waitFor(() => {
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledTimes(2)
    })
  })

  it('closes modal after successful organization creation', async () => {
    render(<OrganizationsPercentageTax />)

    // Open modal
    const createBtn = screen.getByTestId('create-org-btn')
    fireEvent.click(createBtn)

    // Complete creation
    const successBtn = screen.getByTestId('success-btn')
    fireEvent.click(successBtn)

    await waitFor(() => {
      expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument()
    })
  })
})