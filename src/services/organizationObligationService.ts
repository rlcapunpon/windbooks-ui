import apiClient from '../api/client'

// Organization Obligation DTOs based on org-mgmt-api.yaml
export interface OrganizationObligation {
  id: string
  organization_id: string
  obligation_id: string
  start_date: string
  end_date?: string | null
  status: 'NOT_APPLICABLE' | 'ASSIGNED' | 'ACTIVE' | 'DUE' | 'FILED' | 'PAID' | 'OVERDUE' | 'LATE' | 'EXEMPT' | 'SUSPENDED' | 'CLOSED'
  notes?: string
  created_at: string
  updated_at: string
}

export interface AssignObligationRequestDto {
  obligation_id: string
  start_date: string
  end_date?: string
  notes?: string
}

export interface UpdateObligationStatusRequestDto {
  status: 'NOT_APPLICABLE' | 'ASSIGNED' | 'ACTIVE' | 'DUE' | 'FILED' | 'PAID' | 'OVERDUE' | 'LATE' | 'EXEMPT' | 'SUSPENDED' | 'CLOSED'
}

export class OrganizationObligationService {
  private static readonly BASE_ENDPOINT = '/organizations'
  private static readonly OBLIGATION_ENDPOINT = '/organization-obligations'

  /**
   * Fetches all obligations for a specific organization
   */
  static async getOrganizationObligations(organizationId: string): Promise<OrganizationObligation[]> {
    try {
      const response = await apiClient.get<OrganizationObligation[]>(`${this.BASE_ENDPOINT}/${organizationId}/obligations`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch organization obligations:', error)
      throw error
    }
  }

  /**
   * Assigns a tax obligation to an organization
   */
  static async assignObligation(organizationId: string, data: AssignObligationRequestDto): Promise<OrganizationObligation> {
    try {
      const response = await apiClient.post<OrganizationObligation>(`${this.BASE_ENDPOINT}/${organizationId}/obligations`, data)
      return response.data
    } catch (error: any) {
      console.error('Failed to assign obligation:', error)
      throw error
    }
  }

  /**
   * Updates the status of an organization obligation
   */
  static async updateObligationStatus(obligationId: string, data: UpdateObligationStatusRequestDto): Promise<OrganizationObligation> {
    try {
      const response = await apiClient.put<OrganizationObligation>(`${this.OBLIGATION_ENDPOINT}/${obligationId}`, data)
      return response.data
    } catch (error: any) {
      console.error('Failed to update obligation status:', error)
      throw error
    }
  }
}