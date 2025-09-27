import apiClient from '../api/client'

// Organization DTOs based on org-mgmt-api.yaml
export interface Organization {
  id: string
  name: string
  tin?: string
  category: 'INDIVIDUAL' | 'NON_INDIVIDUAL'
  subcategory?: 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS'
  tax_classification: 'VAT' | 'NON_VAT'
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
  reason?: 'EXPIRED' | 'OPTED_OUT' | 'PAYMENT_PENDING' | 'VIOLATIONS'
  description?: string
  last_update: string
  created_at: string
  updated_at: string
}

export interface CreateOrganizationRequestDto {
  name: string
  category: 'INDIVIDUAL' | 'NON_INDIVIDUAL'
  tax_classification: 'VAT' | 'NON_VAT'
  first_name: string
  last_name: string
  line_of_business: string
  address_line: string
  region: string
  city: string
  zip_code: string
  tin_registration: string
  rdo_code: string
  contact_number: string
  email_address: string
  tax_type: string
  start_date: string
  reg_date: string
  tin?: string
  subcategory?: 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS'
  registration_date?: string
  address?: string
  middle_name?: string
  trade_name?: string
}

export interface UpdateOrganizationRequestDto {
  name?: string
  tin?: string
  category?: 'INDIVIDUAL' | 'NON_INDIVIDUAL'
  subcategory?: 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS'
  tax_classification?: 'VAT' | 'NON_VAT'
  registration_date?: string
  address?: string
}

export interface UpdateOrganizationStatusRequestDto {
  status: 'REGISTERED' | 'PENDING_REG' | 'ACTIVE' | 'INACTIVE' | 'CESSATION' | 'CLOSED' | 'NON_COMPLIANT' | 'UNDER_AUDIT' | 'SUSPENDED'
  reason?: 'EXPIRED' | 'OPTED_OUT' | 'PAYMENT_PENDING' | 'VIOLATIONS'
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

export interface OrganizationFilters {
  category?: 'INDIVIDUAL' | 'NON_INDIVIDUAL'
  tax_classification?: 'VAT' | 'NON_VAT'
  subcategory?: 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'FREELANCER' | 'CORPORATION' | 'PARTNERSHIP' | 'OTHERS'
}

export class OrganizationService {
  private static readonly BASE_ENDPOINT = '/organizations'

  /**
   * Fetches all organizations with optional filtering
   */
  static async getAllOrganizations(filters?: OrganizationFilters): Promise<Organization[]> {
    try {
      const response = await apiClient.get<Organization[]>(this.BASE_ENDPOINT, {
        params: filters
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch organizations:', error)
      throw error
    }
  }

  /**
   * Creates a new organization
   */
  static async createOrganization(data: CreateOrganizationRequestDto): Promise<Organization> {
    try {
      const response = await apiClient.post<Organization>(this.BASE_ENDPOINT, data)
      return response.data
    } catch (error: any) {
      console.error('Failed to create organization:', error)
      throw error
    }
  }

  /**
   * Fetches a specific organization by ID
   */
  static async getOrganizationById(id: string): Promise<Organization> {
    try {
      const response = await apiClient.get<Organization>(`${this.BASE_ENDPOINT}/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch organization:', error)
      throw error
    }
  }

  /**
   * Updates an existing organization
   */
  static async updateOrganization(id: string, data: UpdateOrganizationRequestDto): Promise<Organization> {
    try {
      const response = await apiClient.put<Organization>(`${this.BASE_ENDPOINT}/${id}`, data)
      return response.data
    } catch (error: any) {
      console.error('Failed to update organization:', error)
      throw error
    }
  }

  /**
   * Updates organization business status
   */
  static async updateOrganizationStatus(id: string, data: UpdateOrganizationStatusRequestDto): Promise<OrganizationStatus> {
    try {
      const response = await apiClient.put<OrganizationStatus>(`${this.BASE_ENDPOINT}/${id}/status`, data)
      return response.data
    } catch (error: any) {
      console.error('Failed to update organization status:', error)
      throw error
    }
  }

  /**
   * Gets organization business status
   */
  static async getOrganizationStatus(id: string): Promise<OrganizationStatus> {
    try {
      const response = await apiClient.get<OrganizationStatus>(`${this.BASE_ENDPOINT}/${id}/status`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch organization status:', error)
      throw error
    }
  }

  /**
   * Updates organization operation details
   */
  static async updateOrganizationOperation(id: string, data: UpdateOrganizationOperationRequestDto): Promise<any> {
    try {
      const response = await apiClient.put(`${this.BASE_ENDPOINT}/${id}/operation`, data)
      return response.data
    } catch (error: any) {
      console.error('Failed to update organization operation:', error)
      throw error
    }
  }

  /**
   * Gets organization operation details
   */
  static async getOrganizationOperation(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.BASE_ENDPOINT}/${id}/operation`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch organization operation:', error)
      throw error
    }
  }

  /**
   * Updates organization registration details
   */
  static async updateOrganizationRegistration(id: string, data: UpdateOrganizationRegistrationRequestDto): Promise<any> {
    try {
      const response = await apiClient.put(`${this.BASE_ENDPOINT}/${id}/registration`, data)
      return response.data
    } catch (error: any) {
      console.error('Failed to update organization registration:', error)
      throw error
    }
  }
}