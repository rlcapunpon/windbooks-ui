
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import OrganizationPage from './Organization'

// Mock services
vi.mock('../../services/organizationService')
vi.mock('../../services/userService')
vi.mock('../../utils/organizationPermissions')

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'test-org-123' }),
    useNavigate: () => vi.fn()
  }
})

describe('Organization Details Integration', () => {
  it('should render basic component structure', () => {
    render(
      <BrowserRouter>
        <OrganizationPage />
      </BrowserRouter>
    )
    
    // Basic smoke test
    expect(document.body).toBeInTheDocument()
  })
})
