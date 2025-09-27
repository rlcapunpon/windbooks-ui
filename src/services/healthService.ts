import apiClient from '../api/client'

export interface HealthStatus {
  status: string
  timestamp: string
  uptime: number
  version: string
}

export class HealthService {
  private static readonly HEALTH_ENDPOINT = '/health'

  /**
   * Checks the health status of the organization management API
   * @returns Promise<HealthStatus> - Health status information
   */
  static async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await apiClient.get<HealthStatus>(this.HEALTH_ENDPOINT)
      return response.data
    } catch (error: unknown) {
      console.error('Failed to check health status:', error)
      throw error
    }
  }
}