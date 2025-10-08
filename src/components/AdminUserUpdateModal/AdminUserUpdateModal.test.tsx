import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminUserUpdateModal from './AdminUserUpdateModal'
import { UserService } from '../../services/userService'

// Mock the user service
vi.mock('../../services/userService', () => ({
  UserService: {
    getUserDetails: vi.fn(),
    searchUsers: vi.fn(),
    updateUserDetailsAdmin: vi.fn(),
  }
}))

const mockGetUserDetails = vi.mocked(UserService.getUserDetails)
const mockSearchUsers = vi.mocked(UserService.searchUsers)
const mockUpdateUserDetails = vi.mocked(UserService.updateUserDetailsAdmin)

describe('AdminUserUpdateModal', () => {
  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    nickName: 'Johnny',
    contactNumber: '+1234567890',
    reportToId: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    user: {
      email: 'admin@example.com',
      isSuperAdmin: true,
      isActive: true
    },
    reportTo: null
  }

  const mockSearchResults = [
    {
      id: 'user-2',
      email: 'manager@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      isActive: true
    },
    {
      id: 'user-3',
      email: 'supervisor@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      isActive: true
    }
  ]

  const mockProps = {
    isOpen: true,
    userId: 'user-1',
    onClose: vi.fn(),
    onSave: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserDetails.mockResolvedValue(mockUser)
    mockSearchUsers.mockResolvedValue({ data: mockSearchResults, pagination: { page: 1, limit: 10, total: 2, totalPages: 1, hasNext: false, hasPrev: false } })
    mockUpdateUserDetails.mockResolvedValue(mockUser)
  })

  it('should render modal when isOpen is true', () => {
    render(<AdminUserUpdateModal {...mockProps} />)

    expect(screen.getByText('Update User Details')).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(<AdminUserUpdateModal {...mockProps} isOpen={false} />)

    expect(screen.queryByText('Update User Details')).not.toBeInTheDocument()
  })

  it('should fetch and display user details on mount', async () => {
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    // Wait for the form to be populated with user details
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    })
  })

  it('should display form fields for user details', async () => {
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Nickname')).toBeInTheDocument()
    expect(screen.getByLabelText('Contact Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Reports to')).toBeInTheDocument()
  })

  it('should display search input for Reports to field', async () => {
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    const reportsToSection = screen.getByLabelText('Reports to').closest('div')
    expect(within(reportsToSection!).getByPlaceholderText('Search by email...')).toBeInTheDocument()
    expect(within(reportsToSection!).getByRole('button', { name: 'Search users' })).toBeInTheDocument()
  })

  it('should search for users when search button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    const searchInput = screen.getByPlaceholderText('Search by email...')
    const searchButton = screen.getByRole('button', { name: 'Search users' })

    await user.clear(searchInput)
    await user.type(searchInput, 'manager')
    await user.click(searchButton)

    await waitFor(() => {
      expect(mockSearchUsers).toHaveBeenCalledWith(1, 10, 'manager')
    })
  })

  it('should display search results in a table', async () => {
    const user = userEvent.setup()
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    const searchInput = screen.getByPlaceholderText('Search by email...')
    const searchButton = screen.getByRole('button', { name: 'Search users' })

    await user.clear(searchInput)
    await user.type(searchInput, 'manager')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('manager@example.com')).toBeInTheDocument()
      expect(screen.getByText('supervisor@example.com')).toBeInTheDocument()
    })

    // Check table headers
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('should exclude selected user from search results', async () => {
    const user = userEvent.setup()
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    const searchInput = screen.getByPlaceholderText('Search by email...')
    const searchButton = screen.getByRole('button', { name: 'Search users' })

    await user.clear(searchInput)
    await user.type(searchInput, 'admin@example.com')
    await user.click(searchButton)

    await waitFor(() => {
      expect(mockSearchUsers).toHaveBeenCalledWith(1, 10, 'admin@example.com')
    })

    // Should not show the selected user's email in results
    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument()
  })

  it('should allow selecting a user from search results', async () => {
    const user = userEvent.setup()
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    // Perform search
    const searchInput = screen.getByPlaceholderText('Search by email...')
    const searchButton = screen.getByRole('button', { name: 'Search users' })
    await user.clear(searchInput)
    await user.type(searchInput, 'manager')
    await user.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('manager@example.com')).toBeInTheDocument()
    })

    // Click select button
    const selectButton = screen.getAllByRole('button', { name: 'Select' })[0]
    await user.click(selectButton)

    // Check that reports to field is updated
    const reportsToInput = screen.getByLabelText('Reports to')
    expect(reportsToInput).toHaveValue('manager@example.com')
  })

  it('should submit form with updated user details', async () => {
    const user = userEvent.setup()
    const mockOnSave = vi.fn()

    render(<AdminUserUpdateModal {...mockProps} onSave={mockOnSave} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    // Wait for form to be populated
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    })

    // Update form fields
    const firstNameInput = screen.getByDisplayValue('John')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Updated John')

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUserDetails).toHaveBeenCalledWith('user-1', {
        firstName: 'Updated John',
        lastName: 'Doe',
        nickName: 'Johnny',
        contactNumber: '+1234567890',
        reportTo: undefined
      })
      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    mockGetUserDetails.mockRejectedValue(new Error('API Error'))

    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load user details')).toBeInTheDocument()
    })
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    // Wait for form to be populated with user data
    await waitFor(() => {
      const firstNameInput = screen.getByLabelText('First Name')
      expect(firstNameInput).toHaveValue('John')
    })

    // Clear required fields
    const firstNameInput = screen.getByLabelText('First Name')
    await user.clear(firstNameInput)

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First Name is required')).toBeInTheDocument()
    })
  })

  it('should display existing reportTo email in the search input', async () => {
    const mockUserWithReportTo = {
      ...mockUser,
      reportToId: 'manager-1',
      reportTo: {
        id: 'manager-1',
        email: 'manager@example.com',
        details: {
          firstName: 'Jane',
          lastName: 'Smith',
          nickName: 'Manager'
        }
      }
    }

    mockGetUserDetails.mockResolvedValue(mockUserWithReportTo)

    render(<AdminUserUpdateModal {...mockProps} />)

    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user-1')
    })

    // Wait for the form to be populated with the existing reportTo
    await waitFor(() => {
      const reportsToInput = screen.getByLabelText('Reports to')
      expect(reportsToInput).toHaveValue('manager@example.com')
    })

    // Check that the clear button is visible
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })
})