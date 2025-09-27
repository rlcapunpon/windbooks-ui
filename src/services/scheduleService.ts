import apiClient from '../api/client'

// Schedule DTOs based on org-mgmt-api.yaml
export interface ScheduleResponseDto {
  org_obligation_id: string
  period: string
  due_date: string
  status: 'DUE' | 'FILED' | 'LATE' | 'EXEMPT'
  filed_at?: string | null
  obligation?: {
    id: string
    code: string
    name: string
    frequency: string
  }
}

export interface GetSchedulesQueryDto {
  start_date?: string
  end_date?: string
}

export class ScheduleService {
  private static readonly BASE_ENDPOINT = '/organizations'

  /**
   * Fetches compliance schedules for a specific organization
   */
  static async getOrganizationSchedules(
    organizationId: string,
    filters?: GetSchedulesQueryDto
  ): Promise<ScheduleResponseDto[]> {
    try {
      const response = await apiClient.get<ScheduleResponseDto[]>(
        `${this.BASE_ENDPOINT}/${organizationId}/schedules`,
        { params: filters }
      )
      return response.data
    } catch (error: unknown) {
      console.error('Failed to fetch organization schedules:', error)
      throw error
    }
  }
}