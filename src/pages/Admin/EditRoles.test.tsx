import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act, within } from '@testing-library/react'
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
    revokeRole: vi.fn(),
  },
}))

const mockGetUserResources = vi.mocked(UserService.getUserResourcesById)
const mockSearchResources = vi.mocked(UserService.searchResources)
const mockGetAvailableRoles = vi.mocked(UserService.getAvailableRoles)
const mockAssignRole = vi.mocked(UserService.assignRole)
const mockGetUserById = vi.mocked(UserService.getUserById)
const mockRevokeRole = vi.mocked(UserService.revokeRole)

describe('EditRoles', () => {
  const mockUserResources = [
    {
      resourceId: 'resource-1',
      resourceName: 'Organization Management',
      roleName: 'ADMIN',
      roleId: 'role-1'
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

  it('should display current user roles section with action column', async () => {
    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Current User Roles')).toBeInTheDocument()
      expect(screen.getByText('Resource Name')).toBeInTheDocument()
      expect(screen.getByText('Current Role')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
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
        resourceId: mockSearchResults[0].id,
        resourceName: mockSearchResults[0].name,
        roleName: 'CLIENT',
        roleId: 'role-2'
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

  it('should display current user roles section with action column', async () => {
    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Current User Roles')).toBeInTheDocument()
      expect(screen.getByText('Resource Name')).toBeInTheDocument()
      expect(screen.getByText('Current Role')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  it('should display remove button for each user role', async () => {
    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      expect(removeButtons).toHaveLength(1)
      expect(removeButtons[0]).toBeInTheDocument()
    })
  })

  it('should show confirmation modal when remove button is clicked', async () => {
    const user = userEvent.setup()

    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Current User Roles')).toBeInTheDocument()
    })

    // Wait for the remove button to be enabled (availableRoles loaded)
    await waitFor(() => {
      const removeButtons = screen.getAllByText('Remove')
      expect(removeButtons[0]).not.toBeDisabled()
    })

    // Find the remove button in the table (not the modal)
    const removeButtons = screen.getAllByText('Remove')
    const tableRemoveButton = removeButtons[0] // First one is in the table
    await act(async () => {
      await user.click(tableRemoveButton)
    })

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    
    // Check modal content
    const modal = screen.getByRole('dialog')
    expect(within(modal).getByText('Confirm Role Removal')).toBeInTheDocument()
    // Check for the modal text content which is split across multiple spans
    expect(within(modal).getByText('Are you sure you want to remove the', { exact: false })).toBeInTheDocument()
    expect(within(modal).getByText('ADMIN')).toBeInTheDocument()
    expect(within(modal).getByText('Organization Management')).toBeInTheDocument()
    expect(within(modal).getByText('Cancel')).toBeInTheDocument()
  })

  it('should call revokeRole API when remove is confirmed', async () => {
    const user = userEvent.setup()

    mockRevokeRole.mockResolvedValue()

    await act(async () => {
      renderEditRoles()
    })

    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    // Wait for the remove button to be enabled (availableRoles loaded)
    await waitFor(() => {
      const removeButtons = screen.getAllByText('Remove')
      expect(removeButtons[0]).not.toBeDisabled()
    })

    // Click remove button in table
    const removeButtons = screen.getAllByText('Remove')
    const tableRemoveButton = removeButtons[0] // First one is in the table
    await act(async () => {
      await user.click(tableRemoveButton)
    })

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Confirm Role Removal')).toBeInTheDocument()
    })

    // Confirm removal in modal - now there are 2 Remove buttons
    await waitFor(() => {
      const allRemoveButtons = screen.getAllByText('Remove')
      expect(allRemoveButtons).toHaveLength(2) // Table + Modal
    })
    const allRemoveButtons = screen.getAllByText('Remove')
    const confirmButton = allRemoveButtons[1] // Second one is in the modal
    await act(async () => {
      await user.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockRevokeRole).toHaveBeenCalledWith('user-123', 'resource-1', 'role-1') // Should use roleId, not role name
    })
  })

  it('should refresh user roles after successful removal', async () => {
    const user = userEvent.setup()

    mockRevokeRole.mockResolvedValue()
    // Mock updated resources after removal (empty array)
    mockGetUserResources.mockResolvedValueOnce(mockUserResources) // Initial load
    mockGetUserResources.mockResolvedValue([]) // After removal

    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Current User Roles')).toBeInTheDocument()
    })

    // Wait for the remove button to be enabled (availableRoles loaded)
    await waitFor(() => {
      const removeButtons = screen.getAllByText('Remove')
      expect(removeButtons[0]).not.toBeDisabled()
    })

    // Click remove button in table
    const removeButtons = screen.getAllByText('Remove')
    const tableRemoveButton = removeButtons[0] // First one is in the table
    await act(async () => {
      await user.click(tableRemoveButton)
    })

    // Confirm removal in modal - now there are 2 Remove buttons
    await waitFor(() => {
      const allRemoveButtons = screen.getAllByText('Remove')
      expect(allRemoveButtons).toHaveLength(2) // Table + Modal
    })
    const allRemoveButtons = screen.getAllByText('Remove')
    const confirmButton = allRemoveButtons[1] // Second one is in the modal
    await act(async () => {
      await user.click(confirmButton)
    })

    await waitFor(() => {
      expect(screen.getByText('No assigned resources found.')).toBeInTheDocument()
    })
  })

  it('should close modal when cancel is clicked', async () => {
    const user = userEvent.setup()

    await act(async () => {
      renderEditRoles()
    })

    await waitFor(() => {
      expect(screen.getByText('Current User Roles')).toBeInTheDocument()
    })

    // Wait for the remove button to be enabled (availableRoles loaded)
    await waitFor(() => {
      const removeButtons = screen.getAllByText('Remove')
      expect(removeButtons[0]).not.toBeDisabled()
    })

    // Click remove button in table
    const removeButtons = screen.getAllByText('Remove')
    const tableRemoveButton = removeButtons[0] // First one is in the table
    await act(async () => {
      await user.click(tableRemoveButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Confirm Role Removal')).toBeInTheDocument()
    })

    // Click cancel in modal
    const cancelButton = screen.getByText('Cancel')
    await act(async () => {
      await user.click(cancelButton)
    })

    await waitFor(() => {
      expect(screen.queryByText('Confirm Role Removal')).not.toBeInTheDocument()
    })
  })
})