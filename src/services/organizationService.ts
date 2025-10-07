import orgApiClient from '../api/orgClient'
import type { AxiosError } from 'axios'

// API Error Response interface
interface ApiErrorResponse {
  message?: string
  error?: string
  details?: unknown
}

// Axios Error type for API calls
type ApiError = AxiosError<ApiErrorResponse>

// Organization DTOs based on org-mgmt-api.yaml
export interface Organization {
  id: string
  name: string
  tin?: string
  category: 'INDIVIDUAL' | 'NON_INDIVIDUAL'
  subcategory?: 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS'
  tax_classification: 'VAT' | 'NON_VAT' | 'EXCEMPT'
  registration_date?: string
  address?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  status?: OrganizationStatus
}

export interface OrganizationStatus {
  id: string
  organization_id: string
  status: 'REGISTERED' | 'PENDING_REG' | 'ACTIVE' | 'INACTIVE' | 'CESSATION' | 'CLOSED' | 'NON_COMPLIANT' | 'UNDER_AUDIT' | 'SUSPENDED'
  reason?: 'APPROVED' | 'REMOVED' | 'EXPIRED' | 'OPTED_OUT' | 'PAYMENT_PENDING' | 'VIOLATIONS'
  description?: string
  last_update: string
  created_at: string
  updated_at: string
}

export interface OrganizationRegistration {
  organization_id: string
  first_name: string
  middle_name?: string
  last_name: string
  trade_name?: string
  line_of_business: string
  address_line: string
  region: string
  city: string
  zip_code: string
  tin: string
  rdo_code: string
  contact_number: string
  email_address: string
  tax_type: 'VAT' | 'NON_VAT' | 'EXCEMPT'
  start_date: string
  reg_date: string
  update_date: string
  update_by: string
  created_at: string
  updated_at: string
}

export interface CreateOrganizationRequestDto {
  // Organization fields
  registered_name?: string; // Required for NON_INDIVIDUAL
  tin: string;
  category: 'INDIVIDUAL' | 'NON_INDIVIDUAL';
  subcategory?: 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS';
  tax_classification: 'VAT' | 'NON_VAT' | 'EXCEMPT';
  registration_date: string; // Date string

  // OrganizationRegistration fields
  first_name?: string; // Required for INDIVIDUAL
  middle_name?: string | null;
  last_name?: string; // Required for INDIVIDUAL
  trade_name?: string | null;
  line_of_business: string;
  address_line: string;
  region: string;
  city: string;
  zip_code: string;
  rdo_code: string;
  contact_number: string;
  email_address: string;
  start_date: string; // Date string

  // OrganizationOperation fields (optional)
  fy_start?: string;
  fy_end?: string;
  vat_reg_effectivity?: string;
  registration_effectivity?: string;
  payroll_cut_off?: string[];
  payment_cut_off?: string[];
  quarter_closing?: string[];
  has_foreign?: boolean;
  has_employees?: boolean;
  is_ewt?: boolean;
  is_fwt?: boolean;
  is_bir_withholding_agent?: boolean;
  accounting_method?: 'ACCRUAL' | 'CASH' | 'OTHERS';
}

export interface UpdateOrganizationRequestDto {
  name?: string
  tin?: string
  category?: 'INDIVIDUAL' | 'NON_INDIVIDUAL'
  subcategory?: 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS'
  tax_classification?: 'VAT' | 'NON_VAT' | 'EXCEMPT'
  registration_date?: string
  address?: string
}

export interface UpdateOrganizationStatusRequestDto {
  status: 'REGISTERED' | 'PENDING_REG' | 'ACTIVE' | 'INACTIVE' | 'CESSATION' | 'CLOSED' | 'NON_COMPLIANT' | 'UNDER_AUDIT' | 'SUSPENDED'
  reason?: 'APPROVED' | 'REMOVED' | 'EXPIRED' | 'OPTED_OUT' | 'PAYMENT_PENDING' | 'VIOLATIONS'
  description?: string
}

export interface UpdateOrganizationOperationRequestDto {
  fy_start?: string
  fy_end?: string
  vat_reg_effectivity?: string
  registration_effectivity?: string
  payroll_cut_off?: string[]
  payment_cut_off?: string[]
  quarter_closing?: string[]
  has_foreign?: boolean
  has_employees?: boolean
  is_ewt?: boolean
  is_fwt?: boolean
  is_bir_withholding_agent?: boolean
  accounting_method?: 'ACCRUAL' | 'CASH' | 'OTHERS'
}

export interface UpdateOrganizationRegistrationRequestDto {
  first_name?: string
  middle_name?: string
  last_name?: string
  trade_name?: string
  line_of_business?: string
  address_line?: string
  region?: string
  city?: string
  zip_code?: string
  tin?: string
  rdo_code?: string
  contact_number?: string
  email_address?: string
  tax_type?: string
  start_date?: string
  reg_date?: string
}

export interface OrganizationOperation {
  organization_id: string
  fy_start?: string
  fy_end?: string
  vat_reg_effectivity?: string
  registration_effectivity?: string
  payroll_cut_off?: string[]
  payment_cut_off?: string[]
  quarter_closing?: string[]
  has_foreign?: boolean
  has_employees?: boolean
  is_ewt?: boolean
  is_fwt?: boolean
  is_bir_withholding_agent?: boolean
  accounting_method?: 'ACCRUAL' | 'CASH' | 'OTHERS'
  created_at: string
  updated_at: string
}

export interface OrganizationOwnership {
  isOwner: boolean
  orgId: string
  userId: string
}

export interface OrganizationFilters {
  tax_classification?: 'VAT' | 'NON_VAT' | 'EXCEMPT'
  category?: 'INDIVIDUAL' | 'NON_INDIVIDUAL'
  status?: string
  search?: string
}

export class OrganizationService {
  private static readonly BASE_ENDPOINT = '/organizations'

  /**
   * Test backend connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔧 Testing organization service connectivity...')
      console.log('🔧 Expected endpoint: http://localhost:3001/api/org/organizations')
      
      // Test with a simple GET request to organizations endpoint
      const response = await orgApiClient.get(this.BASE_ENDPOINT, { timeout: 5000 })
      console.log('✅ Backend connectivity test passed:', response.status)
      return true
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('❌ Backend connectivity test failed:', apiError.response?.status || (apiError as Error).message)
      
      if (apiError.response?.status === 401) {
        console.log('✅ Backend is responding (401 = authentication required, which is expected)')
        return true
      }
      
      if (apiError.response?.status === 404) {
        console.error('🚫 404: Organization service endpoint not found')
        console.error('🔧 Verify organization management service is running on http://localhost:3001')
        console.error('🔧 Verify /api/org/organizations endpoint exists')
      }
      
      return false
    }
  }

  /**
   * Fetches all organizations with optional filtering
   */
  static async getAllOrganizations(filters?: OrganizationFilters): Promise<Organization[]> {
    try {
      const response = await orgApiClient.get<Organization[]>(this.BASE_ENDPOINT, {
        params: filters
      })
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch organizations:', apiError)
      
      // Provide more helpful error information
      if (apiError.response?.status === 404) {
        console.error('🔧 Troubleshooting steps:')
        console.error('1. Ensure organization management service is running on http://localhost:3001')
        console.error('2. Check if /api/org/organizations endpoint exists')
        console.error('3. Verify VITE_ORG_API_BASE_URL in .env file')
      }
      
      throw apiError
    }
  }

  /**
   * Creates a new organization
   */
  static async createOrganization(data: CreateOrganizationRequestDto): Promise<Organization> {
    try {
      const response = await orgApiClient.post<Organization>(this.BASE_ENDPOINT, data)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to create organization:', apiError)
      throw apiError
    }
  }

  /**
   * Fetches a specific organization by ID
   */
  static async getOrganizationById(id: string): Promise<Organization> {
    try {
      const response = await orgApiClient.get<Organization>(`${this.BASE_ENDPOINT}/${id}`)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch organization:', apiError)
      throw apiError
    }
  }

  /**
   * Updates an existing organization
   */
  static async updateOrganization(id: string, data: UpdateOrganizationRequestDto): Promise<Organization> {
    try {
      const response = await orgApiClient.put<Organization>(`${this.BASE_ENDPOINT}/${id}`, data)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to update organization:', apiError)
      throw apiError
    }
  }

  /**
   * Updates organization business status
   */
  static async updateOrganizationStatus(id: string, data: UpdateOrganizationStatusRequestDto): Promise<OrganizationStatus> {
    try {
      const response = await orgApiClient.put<OrganizationStatus>(`${this.BASE_ENDPOINT}/${id}/status`, data)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to update organization status:', apiError)
      throw apiError
    }
  }

  /**
   * Gets organization business status
   */
  static async getOrganizationStatus(id: string): Promise<OrganizationStatus> {
    try {
      const response = await orgApiClient.get<OrganizationStatus>(`${this.BASE_ENDPOINT}/${id}/status`)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch organization status:', apiError)
      throw apiError
    }
  }

  /**
   * Updates organization operation details
   */
  static async updateOrganizationOperation(id: string, data: UpdateOrganizationOperationRequestDto): Promise<OrganizationOperation> {
    try {
      const response = await orgApiClient.put<OrganizationOperation>(`${this.BASE_ENDPOINT}/${id}/operation`, data)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to update organization operation:', apiError)
      throw apiError
    }
  }

  /**
   * Gets organization operation details
   */
  static async getOrganizationOperation(id: string): Promise<OrganizationOperation> {
    try {
      const response = await orgApiClient.get<OrganizationOperation>(`${this.BASE_ENDPOINT}/${id}/operation`)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch organization operation:', apiError)
      throw apiError
    }
  }

  /**
   * Gets organization registration details
   */
  static async getOrganizationRegistration(id: string): Promise<OrganizationRegistration> {
    try {
      const response = await orgApiClient.get<OrganizationRegistration>(`${this.BASE_ENDPOINT}/${id}/registration`)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch organization registration:', apiError)
      throw apiError
    }
  }

  /**
   * Updates organization registration details
   */
  static async updateOrganizationRegistration(id: string, data: UpdateOrganizationRegistrationRequestDto): Promise<OrganizationRegistration> {
    try {
      const response = await orgApiClient.put<OrganizationRegistration>(`${this.BASE_ENDPOINT}/${id}/registration`, data)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to update organization registration:', apiError)
      throw apiError
    }
  }

  /**
   * Gets organization ownership information for current user
   */
  static async getOrganizationOwnership(id: string): Promise<OrganizationOwnership> {
    try {
      const response = await orgApiClient.get<OrganizationOwnership>(`${this.BASE_ENDPOINT}/${id}/ownership`)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch organization ownership:', apiError)
      throw apiError
    }
  }

  /**
   * Deletes an organization
   */
  static async deleteOrganization(id: string): Promise<void> {
    try {
      await orgApiClient.delete(`${this.BASE_ENDPOINT}/${id}`)
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to delete organization:', apiError)
      throw apiError
    }
  }
}