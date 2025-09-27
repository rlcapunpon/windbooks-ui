import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import OrganizationsDashboard from './OrganizationsDashboard'
import { OrganizationService } from '../../services/organizationService'

// Mock the services
vi.mock('../../services/organizationService', () => ({
  OrganizationService: {
    getAllOrganizations: vi.fn()
  }
}))
vi.mock('../../services/userService', () => ({
  UserService: {
    hasPermission: vi.fn().mockReturnValue(true),
    isSuperAdmin: vi.fn().mockReturnValue(false)
  }
}))

// Mock components
vi.mock('../../../components/OrganizationTable/OrganizationTable', () => ({
  OrganizationTable: ({ organizations, loading, onRefresh }: any) => (
    <div data-testid="organization-table">
      <div data-testid="organizations-count">{organizations?.length || 0}</div>
      <div data-testid="loading-state">{loading ? 'loading' : 'loaded'}</div>
      <button data-testid="refresh-btn" onClick={onRefresh}>Refresh</button>
    </div>
  )
}))

vi.mock('../../../components/CreateOrganizationButton/CreateOrganizationButton', () => ({
  CreateOrganizationButton: ({ hasPermission }: any) => (
    <button data-testid="create-org-btn" disabled={!hasPermission}>
      Create Organization
    </button>
  )
}))

const mockOrganizations = [
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
    deleted_at: null
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
    deleted_at: null
  }
]

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('OrganizationsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the dashboard with title and description', () => {
      ;(OrganizationService.getAllOrganizations as any).mockResolvedValue([])

      renderWithRouter(<OrganizationsDashboard />)

      expect(screen.getByText('Organizations Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Manage and monitor all organizations')).toBeInTheDocument()
    })

    it('should render the organization table component', async () => {
      ;(OrganizationService.getAllOrganizations as any).mockResolvedValue(mockOrganizations)

      renderWithRouter(<OrganizationsDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('organizations-table')).toBeInTheDocument()
      })
    })

    it('should render the create organization button', async () => {
      ;(OrganizationService.getAllOrganizations as any).mockResolvedValue([])

      renderWithRouter(<OrganizationsDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Create Organization')).toBeInTheDocument()
      })
    })
  })

  describe('Data Loading', () => {
    it('should load organizations on component mount', async () => {
      ;(OrganizationService.getAllOrganizations as any).mockResolvedValue(mockOrganizations)

      renderWithRouter(<OrganizationsDashboard />)

      await waitFor(() => {
        expect(OrganizationService.getAllOrganizations).toHaveBeenCalledWith()
      })

      expect(screen.getByText('Organizations (2)')).toBeInTheDocument()
      expect(screen.getByText('Test Organization 1')).toBeInTheDocument()
      expect(screen.getByText('Test Organization 2')).toBeInTheDocument()
    })

    it('should handle empty organizations list', async () => {
      ;(OrganizationService.getAllOrganizations as any).mockResolvedValue([])

      renderWithRouter(<OrganizationsDashboard />)

      await waitFor(() => {
        expect(screen.getByText('No organizations found')).toBeInTheDocument()
      })
    })

    it('should handle loading state', async () => {
      ;(OrganizationService.getAllOrganizations as any).mockResolvedValue(mockOrganizations)

      renderWithRouter(<OrganizationsDashboard />)

      // Initially should show loading
      expect(screen.getByText('Loading organizations...')).toBeInTheDocument()

      // After data loads, should show organizations
      await waitFor(() => {
        expect(screen.getByText('Organizations (2)')).toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      ;(OrganizationService.getAllOrganizations as any).mockRejectedValue(new Error('API Error'))

      renderWithRouter(<OrganizationsDashboard />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load organizations:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Refresh Functionality', () => {
    it('should refresh organizations when refresh button is clicked', async () => {
      ;(OrganizationService.getAllOrganizations as any).mockResolvedValue(mockOrganizations)

      renderWithRouter(<OrganizationsDashboard />)

      await waitFor(() => {
        expect(OrganizationService.getAllOrganizations).toHaveBeenCalledTimes(1)
      })

      const refreshBtn = screen.getByText('Refresh')
      await userEvent.click(refreshBtn)

      await waitFor(() => {
        expect(OrganizationService.getAllOrganizations).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Permission Handling', () => {
    it('should render create organization button when user has permission', async () => {
      ;(OrganizationService.getAllOrganizations as any).mockResolvedValue([])

      renderWithRouter(<OrganizationsDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Create Organization')).toBeInTheDocument()
      })
    })
  })
})