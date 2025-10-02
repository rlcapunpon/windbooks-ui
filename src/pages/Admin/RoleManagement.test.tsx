import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoleManagement from './RoleManagement'
import { UserService } from '../../services/userService'

// Mock the user service
vi.mock('../../services/userService', () => ({
  UserService: {
    getAllUsers: vi.fn(),
    isSuperAdmin: vi.fn(),
    hasUserData: vi.fn(),
    fetchAndStoreUserData: vi.fn()
  }
}))

const mockGetAllUsers = vi.mocked(UserService.getAllUsers)

describe('RoleManagement', () => {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'admin@example.com',
      isActive: true,
      isSuperAdmin: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      roles: [
        {
          role: {
            id: 'role-1',
            name: 'ADMIN',
            description: 'Administrator role',
            permissions: [
              {
                permission: {
                  id: 'perm-1',
                  name: 'read_users',
                  description: 'Can read users'
                }
              }
            ]
          }
        }
      ]
    },
    {
      id: 'user-2',
      email: 'user@example.com',
      isActive: false,
      isSuperAdmin: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      roles: []
    }
  ]

  const mockPaginationResponse = {
    data: mockUsers,
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllUsers.mockResolvedValue(mockPaginationResponse)
  })

  it('should render the RoleManagement page with title and description', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      expect(screen.getByText('Role Management')).toBeInTheDocument()
      expect(screen.getByText('Manage user roles and permissions')).toBeInTheDocument()
    })
  })

  it('should display loading state initially', () => {
    render(<RoleManagement />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should fetch and display users in a table', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, undefined, undefined)
    })

    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('should display user status badges correctly', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Active')
      const inactiveBadges = screen.getAllByText('Inactive')
      expect(activeBadges.length).toBeGreaterThan(0)
      expect(inactiveBadges.length).toBeGreaterThan(0)
    })
  })

  it('should display table headers correctly', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Primary Role')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  it('should display primary role correctly', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      expect(screen.getByText('ADMIN')).toBeInTheDocument()
      expect(screen.getByText('None')).toBeInTheDocument()
    })
  })

  it('should display Edit Roles button for each user', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit Roles')
      expect(editButtons).toHaveLength(2)
    })
  })

  it('should display total users count', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      expect(screen.getByText('Total users: 2')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockGetAllUsers.mockRejectedValue(new Error('API Error'))

    render(<RoleManagement />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load users. Please try again.')).toBeInTheDocument()
    })
  })

  it('should not display pagination when there is only one page', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      expect(screen.queryByText('Page 1 of 1')).not.toBeInTheDocument()
    })
  })

  it('should display pagination when there are multiple pages', async () => {
    const multiPageResponse = {
      ...mockPaginationResponse,
      pagination: {
        ...mockPaginationResponse.pagination,
        total: 25,
        totalPages: 3,
        hasNext: true
      }
    }

    mockGetAllUsers.mockResolvedValue(multiPageResponse)

    render(<RoleManagement />)

    await waitFor(() => {
      const paginationElement = document.querySelector('p.text-sm.text-gray-700')
      expect(paginationElement?.textContent?.trim()).toBe('Page 1 of 3')
    })
  })

  it('should render search input field', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by email...')
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('should render status filter dropdown', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      const statusSelect = screen.getByDisplayValue('')
      expect(statusSelect).toBeInTheDocument()
    })
  })

  it('should not trigger search on typing but should trigger on Enter key', async () => {
    const user = userEvent.setup()
    render(<RoleManagement />)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, undefined, undefined)
    })

    // Clear previous calls
    mockGetAllUsers.mockClear()

    const searchInput = screen.getByPlaceholderText('Search by email...')

    await user.clear(searchInput)
    await user.type(searchInput, 'admin')

    // Verify that typing doesn't trigger search
    expect(mockGetAllUsers).not.toHaveBeenCalled()

    // Press Enter key to trigger search
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, 'admin', undefined)
    })
  })

  it('should trigger search when search button is clicked', async () => {
    const user = userEvent.setup()
    render(<RoleManagement />)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, undefined, undefined)
    })

    // Clear previous calls
    mockGetAllUsers.mockClear()

    const searchInput = screen.getByPlaceholderText('Search by email...')

    await user.clear(searchInput)
    await user.type(searchInput, 'user@example.com')

    // Verify that typing doesn't trigger search
    expect(mockGetAllUsers).not.toHaveBeenCalled()

    // Click the search button
    const searchButton = screen.getByRole('button', { name: '' })
    await user.click(searchButton)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, 'user@example.com', undefined)
    })
  })

  it('should filter users by status', async () => {
    const user = userEvent.setup()
    render(<RoleManagement />)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, undefined, undefined)
    })

    const statusSelect = screen.getByRole('combobox')

    await user.selectOptions(statusSelect, 'Active')

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, undefined, true)
    })
  })

  it('should maintain search text when status filter changes', async () => {
    const user = userEvent.setup()
    render(<RoleManagement />)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, undefined, undefined)
    })

    const searchInput = screen.getByPlaceholderText('Search by email...')
    const statusSelect = screen.getByRole('combobox')

    // Type in search input without triggering search
    await user.clear(searchInput)
    await user.type(searchInput, 'user')
    
    // Select status filter
    await user.selectOptions(statusSelect, 'Inactive')

    // Verify that the search input still contains the typed value
    expect(searchInput).toHaveValue('user')
    expect(statusSelect).toHaveValue('Inactive')
  })

  it('should clear filters when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<RoleManagement />)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, undefined, undefined)
    })

    const clearButton = screen.getByText('Clear Filters')

    // Clear previous calls to focus on the clear button action
    mockGetAllUsers.mockClear()

    // Click clear filters
    await user.click(clearButton)

    // Verify clear filters API call is made with empty parameters
    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, undefined, undefined)
    })
  })
})