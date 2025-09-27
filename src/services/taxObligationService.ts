import apiClient from '../api/client'

// Tax Obligation DTOs based on org-mgmt-api.yaml
export interface TaxObligation {
  id: string
  code: string
  name: string
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME'
  due_rule: any // JSON object for due date rules
  status?: string
  created_at: string
  updated_at: string
}

export interface CreateTaxObligationRequestDto {
  code: string
  name: string
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME'
  due_rule: any // JSON object for due date rules
  status?: string
}

export class TaxObligationService {
  private static readonly BASE_ENDPOINT = '/tax-obligations'

  /**
   * Fetches all tax obligations
   */
  static async getAllTaxObligations(): Promise<TaxObligation[]> {
    try {
      const response = await apiClient.get<TaxObligation[]>(this.BASE_ENDPOINT)
      return response.data
    } catch (error: unknown) {
      console.error('Failed to fetch tax obligations:', error)
      throw error
    }
  }

  /**
   * Creates a new tax obligation
   */
  static async createTaxObligation(data: CreateTaxObligationRequestDto): Promise<TaxObligation> {
    try {
      const response = await apiClient.post<TaxObligation>(this.BASE_ENDPOINT, data)
      return response.data
    } catch (error: unknown) {
      console.error('Failed to create tax obligation:', error)
      throw error
    }
  }
}