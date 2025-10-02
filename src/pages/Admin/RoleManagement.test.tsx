import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
      expect(mockGetAllUsers).toHaveBeenCalledWith(1, 10)
    })

    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('should display user status badges correctly', async () => {
    render(<RoleManagement />)

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Inactive')).toBeInTheDocument()
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
})