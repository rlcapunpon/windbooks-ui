import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EditRoles from './EditRoles'
import { UserService } from '../../services/userService'

// Mock the services
vi.mock('../../services/userService', () => ({
  UserService: {
    getUserResourcesById: vi.fn(),
    searchResources: vi.fn(),
    getAvailableRoles: vi.fn(),
    assignRole: vi.fn(),
    getUserById: vi.fn(),
  },
}))

const mockGetUserResources = vi.mocked(UserService.getUserResourcesById)
const mockSearchResources = vi.mocked(UserService.searchResources)
const mockGetAvailableRoles = vi.mocked(UserService.getAvailableRoles)
const mockAssignRole = vi.mocked(UserService.assignRole)
const mockGetUserById = vi.mocked(UserService.getUserById)

describe('EditRoles', () => {
  const mockUserResources = [
    {
      resource: {
        id: 'resource-1',
        name: 'Organization Management',
        description: 'Manage organizations',
        type: 'ORGANIZATION'
      },
      role: 'ADMIN'
    }
  ]

  const mockAvailableRoles = [
    {
      id: 'role-1',
      name: 'ADMIN',
      description: 'Administrator role'
    },
    {
      id: 'role-2',
      name: 'CLIENT',
      description: 'Client role'
    }
  ]

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    isActive: true,
    isSuperAdmin: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    roles: []
  }

  beforeEach(() => {
    mockGetUserResources.mockResolvedValue(mockUserResources)
    mockGetAvailableRoles.mockResolvedValue(mockAvailableRoles)
    mockSearchResources.mockResolvedValue([])
    mockAssignRole.mockResolvedValue()
    mockGetUserById.mockResolvedValue(mockUser)
  })

  const renderEditRoles = (userId = 'user-123') => {
    return render(
      <MemoryRouter initialEntries={[`/admin/edit-roles/${userId}`]}>
        <Routes>
          <Route path="/admin/edit-roles/:userId" element={<EditRoles />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('should render the EditRoles page with title and description', async () => {
    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Edit Roles')).toBeInTheDocument()
      expect(screen.getByText('Manage user roles and resource assignments for')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('should display back button to role management', async () => {
    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      const backButton = screen.getByText('Back to Role Management')
      expect(backButton).toBeInTheDocument()
    })
  })

  it('should display current user resources section', async () => {
    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Current User Resources')).toBeInTheDocument()
      expect(screen.getByText('Resource Name')).toBeInTheDocument()
      expect(screen.getByText('Current Role')).toBeInTheDocument()
    })
  })

  it('should display search resources section', async () => {
    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Search Resources')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument()
    })
  })

  it('should display resources to assign section', async () => {
    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Resources to Assign')).toBeInTheDocument()
      expect(screen.getByText('No resources selected for assignment')).toBeInTheDocument()
    })
  })

  it('should display "No assigned resources found." when user has no resources', async () => {
    mockGetUserResources.mockResolvedValue([])

    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('No assigned resources found.')).toBeInTheDocument()
    })
  })

  it('should call search API when search input changes (debounced)', async () => {
    const user = userEvent.setup()
    const mockSearchResults = [
      {
        id: 'search-resource-1',
        name: 'Test Resource',
        description: 'Test Description',
        type: 'TEST'
      }
    ]
    
    mockSearchResources.mockResolvedValue(mockSearchResults)

    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search resources...')

    // Type in search query
    await act(async () => {
      await user.type(searchInput, 'test query')
    })

    // Wait for debounce to complete
    await waitFor(() => {
      expect(mockSearchResources).toHaveBeenCalledWith('test query')
    }, { timeout: 1000 })
  })

  it('should display search results with description', async () => {
    const user = userEvent.setup()
    const mockSearchResultsWithoutType = [
      {
        id: 'cmg95g0wk0004n3m8xtdyl8si',
        name: 'Ramon Corp',
        description: 'Organization Ramon Corp (123456789000)',
        createdAt: '2025-10-02T08:24:28.821Z',
        updatedAt: '2025-10-02T08:24:28.821Z'
      },
      {
        id: 'cmg95degc0004n30oo3sr6oxn',
        name: 'WINDBOOKS_APP',
        description: 'Main frontend application resource for global role assignments',
        createdAt: '2025-10-02T08:22:26.413Z',
        updatedAt: '2025-10-02T08:22:26.413Z'
      }
    ]
    
    mockSearchResources.mockResolvedValue(mockSearchResultsWithoutType)

    await act(async () => {
      renderEditRoles()
    })

    const searchInput = screen.getByPlaceholderText('Search resources...')

    // Type in search query to trigger search
    await act(async () => {
      await user.type(searchInput, 'Ramon')
    })

    // Wait for search results to appear
    await waitFor(() => {
      expect(screen.getByText('Ramon Corp')).toBeInTheDocument()
      expect(screen.getByText('Organization Ramon Corp (123456789000)')).toBeInTheDocument()
      expect(screen.getByText('WINDBOOKS_APP')).toBeInTheDocument()
      expect(screen.getByText('Main frontend application resource for global role assignments')).toBeInTheDocument()
    })
  })

  it('should assign roles with correct roleId when submit button is clicked', async () => {
    const user = userEvent.setup()
    
    // Mock search results to show resources with Add buttons
    const mockSearchResults = [
      {
        id: 'resource-new',
        name: 'New Resource',
        description: 'A new resource to assign',
        type: 'TEST'
      }
    ]

    // Mock the getUserResourcesById to return updated data after assignment
    const mockUpdatedResources = [
      ...mockUserResources,
      {
        resource: mockSearchResults[0],
        role: 'CLIENT'
      }
    ]
    
    mockSearchResources.mockResolvedValue(mockSearchResults)
    mockGetUserResources.mockResolvedValueOnce(mockUserResources) // Initial load
    mockGetUserResources.mockResolvedValueOnce(mockUpdatedResources) // After assignment
    mockAssignRole.mockResolvedValue()

    await act(async () => {
      renderEditRoles()
    })

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Resources to Assign')).toBeInTheDocument()
    })

    // Search for resources to show search results with Add buttons
    const searchInput = screen.getByPlaceholderText('Search resources...')
    await act(async () => {
      await user.type(searchInput, 'New')
    })

    // Wait for search results to appear
    await waitFor(() => {
      expect(screen.getByText('New Resource')).toBeInTheDocument()
    })

    // Click Add button to add resource to assignment list
    const addButton = screen.getByText('Add')
    await act(async () => {
      await user.click(addButton)
    })

    // Wait for resource to appear in assignment section
    await waitFor(() => {
      expect(screen.getByDisplayValue('Select Role')).toBeInTheDocument()
    })

    // Select a role for the resource
    const roleSelect = screen.getByDisplayValue('Select Role')
    await act(async () => {
      await user.selectOptions(roleSelect, 'role-2')
    })

    // Click submit button
    const submitButton = screen.getByText('Submit')
    await act(async () => {
      await user.click(submitButton)
    })

    // Verify assignRole was called with roleId (not role name)
    await waitFor(() => {
      expect(mockAssignRole).toHaveBeenCalledWith('user-123', 'resource-new', 'role-2')
    })
  })
})