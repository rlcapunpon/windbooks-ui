import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserManagement from './UserManagement'
import { UserService } from '../../services/userService'

// Mock the user service
vi.mock('../../services/userService', () => ({
  UserService: {
    getAllUsers: vi.fn(),
    deactivateUser: vi.fn(),
    deleteUser: vi.fn(),
    activateUser: vi.fn(),
    isSuperAdmin: vi.fn(),
    hasUserData: vi.fn(),
    fetchAndStoreUserData: vi.fn()
  }
}))

const mockGetAllUsers = vi.mocked(UserService.getAllUsers)

describe('UserManagement', () => {
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

  it('should render the UserManagement page with title and description', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument()
      expect(screen.getByText('Manage system users and their permissions')).toBeInTheDocument()
    })
  })

  it('should display loading state initially', () => {
    render(<UserManagement />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should fetch and display users in a table', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, '', undefined)
    })

    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('should display user status badges correctly', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, '', undefined)
    })

    // Check that status badges are displayed (both Active and Inactive should appear)
    const activeBadges = screen.getAllByText('Active')
    const inactiveBadges = screen.getAllByText('Inactive')
    
    expect(activeBadges.length).toBeGreaterThan(0)
    expect(inactiveBadges.length).toBeGreaterThan(0)
  })

  it('should display table headers correctly', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  it('should display Edit and Delete buttons for each user', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      const deactivateButtons = screen.getAllByText('Deactivate')
      const activateButtons = screen.getAllByText('Activate')
      const deleteButtons = screen.getAllByText('Delete')

      expect(deactivateButtons).toHaveLength(1) // Only active user shows deactivate
      expect(activateButtons).toHaveLength(1) // Only inactive user shows activate
      expect(deleteButtons).toHaveLength(2) // Both users show delete
    })
  })

  it('should display total users count', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Total users: 2')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockGetAllUsers.mockRejectedValue(new Error('API Error'))

    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load users. Please try again.')).toBeInTheDocument()
    })
  })

  it('should not display pagination when there is only one page', async () => {
    render(<UserManagement />)

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

    render(<UserManagement />)

    await waitFor(() => {
      const paginationElement = document.querySelector('p.text-sm.text-gray-700')
      expect(paginationElement?.textContent?.trim()).toBe('Page 1 of 3')
    })
  })

  it('should render search input field', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by email...')
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('should render status filter dropdown', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      const statusFilter = screen.getByRole('combobox')
      expect(statusFilter).toBeInTheDocument()
      expect(statusFilter).toHaveValue('')
    })
  })

  it('should not trigger search on typing but should trigger on Enter key', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    // Clear the mock calls from initial render
    mockGetAllUsers.mockClear()

    const searchInput = screen.getByPlaceholderText('Search by email...')
    await user.clear(searchInput)
    await user.type(searchInput, 'user@example.com')

    // Verify that typing doesn't trigger search
    expect(mockGetAllUsers).not.toHaveBeenCalled()

    // Press Enter key to trigger search
    await user.keyboard('{Enter}')

    // Wait for the API call with the search term
    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, 'user@example.com', undefined)
    })
  })

  it('should trigger search when search button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    // Clear the mock calls from initial render
    mockGetAllUsers.mockClear()

    const searchInput = screen.getByPlaceholderText('Search by email...')
    await user.clear(searchInput)
    await user.type(searchInput, 'admin@example.com')

    // Verify that typing doesn't trigger search
    expect(mockGetAllUsers).not.toHaveBeenCalled()

    // Click the search button
    const searchButton = screen.getByRole('button', { name: '' })
    await user.click(searchButton)

    // Wait for the API call with the search term
    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10, 'admin@example.com', undefined)
    })
  })

  it('should filter users by status', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    const statusFilter = screen.getByRole('combobox')
    await user.selectOptions(statusFilter, 'true')

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenLastCalledWith(1, 10, '', true)
    })
  })

  it('should show deactivate confirmation dialog when deactivate button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    const deactivateButton = screen.getAllByText('Deactivate')[0]
    await user.click(deactivateButton)

    expect(screen.getByText('Deactivate User')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Are you sure you want to deactivate'))).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getAllByText('Deactivate')).toHaveLength(2) // Table button + dialog button
  })

  it('should show delete confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByText('Delete')[0]
    await user.click(deleteButton)

    expect(screen.getByText('Delete User')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Are you sure you want to permanently delete'))).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getAllByText('Delete')).toHaveLength(3) // Table buttons + dialog button
  })

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    const deactivateButton = screen.getAllByText('Deactivate')[0]
    await user.click(deactivateButton)

    expect(screen.getByText('Deactivate User')).toBeInTheDocument()

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Deactivate User')).not.toBeInTheDocument()
    })
  })

  it('should call deactivate API and refresh users when confirmed', async () => {
    const mockDeactivateUser = vi.fn().mockResolvedValue(undefined)
    UserService.deactivateUser = mockDeactivateUser

    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    const deactivateButtons = screen.getAllByText('Deactivate')
    await user.click(deactivateButtons[0])

    // The last "Deactivate" button should be the dialog confirm button
    const allDeactivateButtons = screen.getAllByText('Deactivate')
    const confirmButton = allDeactivateButtons[allDeactivateButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockDeactivateUser).toHaveBeenCalledWith('user-1')
      expect(mockGetAllUsers).toHaveBeenCalledTimes(2) // Initial load + refresh after deactivate
    })
  })

  it('should call delete API and refresh users when confirmed', async () => {
    const mockDeleteUser = vi.fn().mockResolvedValue(undefined)
    UserService.deleteUser = mockDeleteUser

    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    // The last "Delete" button should be the dialog confirm button
    const allDeleteButtons = screen.getAllByText('Delete')
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith('user-1')
      expect(mockGetAllUsers).toHaveBeenCalledTimes(2) // Initial load + refresh after delete
    })
  })

  it('should handle deactivate API error gracefully', async () => {
    const mockDeactivateUser = vi.fn().mockRejectedValue(new Error('API Error'))
    UserService.deactivateUser = mockDeactivateUser

    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    const deactivateButtons = screen.getAllByText('Deactivate')
    await user.click(deactivateButtons[0])

    // The last "Deactivate" button should be the dialog confirm button
    const allDeactivateButtons = screen.getAllByText('Deactivate')
    const confirmButton = allDeactivateButtons[allDeactivateButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to deactivate user. Please try again.')).toBeInTheDocument()
    })
  })

  it('should handle delete API error gracefully', async () => {
    const mockDeleteUser = vi.fn().mockRejectedValue(new Error('API Error'))
    UserService.deleteUser = mockDeleteUser

    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    // The last "Delete" button should be the dialog confirm button
    const allDeleteButtons = screen.getAllByText('Delete')
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to delete user. Please try again.')).toBeInTheDocument()
    })
  })

  it('should show activate button for inactive users and deactivate button for active users', async () => {
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
    })

    // Check that active user shows deactivate button
    const activeUserRow = screen.getByText('admin@example.com').closest('tr')
    expect(within(activeUserRow!).getByText('Deactivate')).toBeInTheDocument()
    expect(within(activeUserRow!).queryByText('Activate')).not.toBeInTheDocument()

    // Check that inactive user shows activate button
    const inactiveUserRow = screen.getByText('user@example.com').closest('tr')
    expect(within(inactiveUserRow!).getByText('Activate')).toBeInTheDocument()
    expect(within(inactiveUserRow!).queryByText('Deactivate')).not.toBeInTheDocument()
  })

  it('should show activate confirmation dialog when activate button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
    })

    const activateButton = screen.getByText('Activate')
    await user.click(activateButton)

    expect(screen.getByText('Activate User')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Are you sure you want to activate'))).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getAllByText('Activate')).toHaveLength(2) // Table button + dialog button
  })

  it('should call activate API and refresh users when confirmed', async () => {
    const mockActivateUser = vi.fn().mockResolvedValue(undefined)
    UserService.activateUser = mockActivateUser

    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
    })

    const activateButton = screen.getByText('Activate')
    await user.click(activateButton)

    // The last "Activate" button should be the dialog confirm button
    const allActivateButtons = screen.getAllByText('Activate')
    const confirmButton = allActivateButtons[allActivateButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockActivateUser).toHaveBeenCalledWith('user-2')
      expect(mockGetAllUsers).toHaveBeenCalledTimes(2) // Initial load + refresh after activate
    })
  })

  it('should handle activate API error gracefully', async () => {
    const mockActivateUser = vi.fn().mockRejectedValue(new Error('API Error'))
    UserService.activateUser = mockActivateUser

    const user = userEvent.setup()
    render(<UserManagement />)

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument()
    })

    const activateButton = screen.getByText('Activate')
    await user.click(activateButton)

    // The last "Activate" button should be the dialog confirm button
    const allActivateButtons = screen.getAllByText('Activate')
    const confirmButton = allActivateButtons[allActivateButtons.length - 1]
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to activate user. Please try again.')).toBeInTheDocument()
    })
  })
})