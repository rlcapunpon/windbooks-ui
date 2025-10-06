import apiClient from '../api/client'
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

// Delete operation response interface
interface DeleteResponse {
  success?: boolean
  message?: string
}

// Organization Owner DTOs based on org-mgmt-api.yaml
export interface OrganizationOwner {
  id: string
  org_id: string
  user_id: string
  assigned_date: string
  last_update: string
}

export interface AssignOrganizationOwnerRequestDto {
  org_id: string
  user_id: string
}

export interface OrganizationOwnersResponseDto {
  owners: OrganizationOwner[]
}

export interface CheckOwnershipResponseDto {
  is_owner: boolean
  org_id: string
  user_id: string
}

export class OrganizationOwnerService {
  private static readonly BASE_ENDPOINT = '/organizations'
  private static readonly OWNER_ENDPOINT = '/organization-owners'

  /**
   * Assigns a user as an owner of an organization
   */
  static async assignOwner(organizationId: string, userId: string): Promise<OrganizationOwner> {
    try {
      const data: AssignOrganizationOwnerRequestDto = {
        org_id: organizationId,
        user_id: userId
      }
      const response = await apiClient.post<OrganizationOwner>(`${this.BASE_ENDPOINT}/${organizationId}/owners`, data)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to assign owner:', apiError)
      throw apiError
    }
  }

  /**
   * Gets all owners of an organization
   */
  static async getOrganizationOwners(organizationId: string): Promise<OrganizationOwner[]> {
    try {
      const response = await apiClient.get<OrganizationOwnersResponseDto>(`${this.BASE_ENDPOINT}/${organizationId}/owners`)
      return response.data.owners
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to fetch organization owners:', apiError)
      throw apiError
    }
  }

  /**
   * Checks if the current user is an owner of an organization
   */
  static async checkOwnership(organizationId: string): Promise<boolean> {
    try {
      const response = await orgApiClient.get<CheckOwnershipResponseDto>(`${this.BASE_ENDPOINT}/${organizationId}/ownership`)
      return response.data.is_owner
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to check ownership:', apiError)
      throw apiError
    }
  }

  /**
   * Removes a user as an owner of an organization
   */
  static async removeOwner(organizationId: string, userId: string): Promise<DeleteResponse> {
    try {
      const response = await apiClient.delete<DeleteResponse>(`${this.BASE_ENDPOINT}/${organizationId}/owners/${userId}`)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to remove owner:', apiError)
      throw apiError
    }
  }

  /**
   * Removes an owner assignment by assignment ID
   */
  static async removeOwnerById(ownerId: string): Promise<DeleteResponse> {
    try {
      const response = await apiClient.delete<DeleteResponse>(`${this.OWNER_ENDPOINT}/${ownerId}`)
      return response.data
    } catch (error: unknown) {
      const apiError = error as ApiError
      console.error('Failed to remove owner by ID:', apiError)
      throw apiError
    }
  }
}