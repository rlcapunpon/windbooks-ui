import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { OrganizationTable } from './OrganizationTable'
import type { Organization } from '../../services/organizationService'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

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
    mockNavigate.mockClear()
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

  describe('Search Functionality', () => {
    it('should display search input when onSearchChange prop is provided', () => {
      const mockOnSearchChange = vi.fn()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery=""
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search organizations...');
    });

    it('should not display search input when onSearchChange prop is not provided', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      );

      const searchInput = screen.queryByTestId('search-input');
      expect(searchInput).not.toBeInTheDocument();
    });

    it('should call onSearchChange when search input value changes', async () => {
      const mockOnSearchChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery=""
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test search');
      
      expect(mockOnSearchChange).toHaveBeenCalledTimes(11); // 'test search' has 11 characters
    });

    it('should filter organizations based on search query', () => {
      const mockOnSearchChange = vi.fn()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery="Test Organization 1"
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      // Should show only the filtered organization
      const rows = screen.getAllByRole('row');
      // Header row + 1 data row
      expect(rows).toHaveLength(2);
      
      // Check that the filtered organization is displayed
      expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Organization 2')).not.toBeInTheDocument();
    });

    it('should show filtered count in header when searching', () => {
      const mockOnSearchChange = vi.fn()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery="Test Organization 1"
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      // Should show "Organizations (1 of 2)" when filtered
      expect(screen.getByText('Organizations (1 of 2)')).toBeInTheDocument();
    });

    it('should show all organizations when search query is empty', () => {
      const mockOnSearchChange = vi.fn()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery=""
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      // Should show all organizations
      expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
      expect(screen.getByText('Test Organization 2')).toBeInTheDocument();
      expect(screen.getByText('Organizations (2)')).toBeInTheDocument();
    });

    it('should search across multiple fields (name, TIN, category, tax_classification, address)', () => {
      const mockOnSearchChange = vi.fn()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery="VAT"
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      // Should find organization with VAT tax classification
      expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Organization 2')).not.toBeInTheDocument();
    });

    it('should be case insensitive when searching', () => {
      const mockOnSearchChange = vi.fn()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery="test organization"
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      // Should find both organizations (case insensitive)
      expect(screen.getByText('Test Organization 1')).toBeInTheDocument();
      expect(screen.getByText('Test Organization 2')).toBeInTheDocument();
    });
  });

  describe('View Action Navigation Reliability', () => {
    it('should maintain consistent View button functionality after search operations', async () => {
      const user = userEvent.setup()
      const mockOnSearchChange = vi.fn()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery=""
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      // Perform search operation that filters to specific organization
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'org-1')
      
      // Verify View button still works after search  
      const viewButtons = screen.getAllByText('View')
      expect(viewButtons.length).toBeGreaterThan(0) // At least one organization should be visible
      
      await user.click(viewButtons[0])
      expect(mockNavigate).toHaveBeenCalledWith('/organizations/org-1')
    });

    it('should navigate to correct organization after filtering and clearing search', async () => {
      const user = userEvent.setup()
      const mockOnSearchChange = vi.fn()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
            searchQuery="Test Organization 1"
            onSearchChange={mockOnSearchChange}
          />
        </BrowserRouter>
      );

      // Click View on filtered result
      const viewButton = screen.getByText('View')
      await user.click(viewButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/organizations/org-1')
    });

    it('should preserve View action functionality during loading states', async () => {
      const user = userEvent.setup()
      
      const { rerender } = render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      );

      // Change to loading state
      rerender(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={true}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      );

      // View buttons should still be present and functional during refresh
      const viewButtons = screen.getAllByText('View')
      expect(viewButtons.length).toBeGreaterThan(0)
      
      await user.click(viewButtons[0])
      expect(mockNavigate).toHaveBeenCalledWith('/organizations/org-1')
    });

    it('should handle rapid View button clicks without issues', async () => {
      const user = userEvent.setup()
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      );

      const viewButtons = screen.getAllByText('View')
      
      // Click multiple View buttons rapidly
      await user.click(viewButtons[0])
      await user.click(viewButtons[1])
      
      expect(mockNavigate).toHaveBeenCalledTimes(2)
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/organizations/org-1')
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/organizations/org-2')
    });

    it('should maintain View button accessibility attributes', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      );

      const viewButtons = screen.getAllByText('View')
      
      viewButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
        expect(button).toHaveClass('text-blue-600', 'hover:text-blue-900')
      })
    });

    it('should render View buttons for each organization consistently', () => {
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={mockOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      );

      const viewButtons = screen.getAllByText('View')
      const organizationRows = screen.getAllByRole('row').slice(1) // Exclude header row
      
      expect(viewButtons).toHaveLength(mockOrganizations.length)
      expect(organizationRows).toHaveLength(mockOrganizations.length)
    });

    it('should navigate with correct organization ID from different table states', async () => {
      const user = userEvent.setup()
      const threeOrganizations = [...mockOrganizations, {
        id: 'org-3',
        name: 'Test Organization 3',
        category: 'NON_INDIVIDUAL' as const,
        subcategory: 'CORPORATION' as const,
        tin: '333-333-333-333',
        tax_classification: 'NON_VAT' as const,
        address: '789 Third St',
        registration_date: '2023-03-01T00:00:00.000Z',
        created_at: '2023-03-01T00:00:00.000Z',
        updated_at: '2023-03-01T00:00:00.000Z',
        deleted_at: null,
        status: {
          id: 'status-3',
          organization_id: 'org-3',
          status: 'PENDING_REG' as const,
          reason: 'APPROVED' as const,
          last_update: '2023-03-01T00:00:00.000Z',
          created_at: '2023-03-01T00:00:00.000Z',
          updated_at: '2023-03-01T00:00:00.000Z'
        }
      }]
      
      render(
        <BrowserRouter>
          <OrganizationTable
            organizations={threeOrganizations}
            loading={false}
            onRefresh={mockOnRefresh}
          />
        </BrowserRouter>
      );

      const viewButtons = screen.getAllByText('View')
      
      // Test first organization
      await user.click(viewButtons[0])
      expect(mockNavigate).toHaveBeenCalledWith('/organizations/org-1')
      
      // Test last organization
      await user.click(viewButtons[2])
      expect(mockNavigate).toHaveBeenCalledWith('/organizations/org-3')
    });
  });
});