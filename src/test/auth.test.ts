import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../api/auth'
import apiClient from '../api/client'

// Mock the API client
vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should send login request with correct data and return tokens', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' }
      const expectedResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456'
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: expectedResponse
      })

      const result = await authService.login(loginData)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginData)
      expect(result).toEqual(expectedResponse)
    })

    it('should throw error when login fails', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' }
      const error = new Error('Invalid credentials')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginData)
    })
  })

  describe('register', () => {
    it('should send register request with correct data', async () => {
      const registerData = { email: 'newuser@example.com', password: 'password123' }

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: null })

      await authService.register(registerData)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData)
    })

    it('should throw error when registration fails', async () => {
      const registerData = { email: 'existing@example.com', password: 'password123' }
      const error = new Error('User already exists')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.register(registerData)).rejects.toThrow('User already exists')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData)
    })
  })

  describe('logout', () => {
    it('should send logout request with refresh token', async () => {
      const refreshToken = 'refresh-token-456'

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: null })

      await authService.logout(refreshToken)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', { refreshToken })
    })

    it('should handle logout errors gracefully', async () => {
      const refreshToken = 'invalid-refresh-token'
      const error = new Error('Invalid refresh token')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.logout(refreshToken)).rejects.toThrow('Invalid refresh token')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', { refreshToken })
    })
  })

  describe('refreshToken', () => {
    it('should send refresh request and return new access token', async () => {
      const refreshData = { refreshToken: 'refresh-token-456' }
      const expectedResponse = { accessToken: 'new-access-token-789' }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: expectedResponse
      })

      const result = await authService.refreshToken(refreshData)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', refreshData)
      expect(result).toEqual(expectedResponse)
    })

    it('should throw error when refresh fails', async () => {
      const refreshData = { refreshToken: 'expired-refresh-token' }
      const error = new Error('Refresh token expired')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.refreshToken(refreshData)).rejects.toThrow('Refresh token expired')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', refreshData)
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch and return current user data', async () => {
      const expectedUser = {
        id: 'user-123',
        email: 'test@example.com',
        roles: ['ROLE_LEVEL_1']
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: expectedUser
      })

      const result = await authService.getCurrentUser()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(expectedUser)
    })

    it('should throw error when fetching user fails', async () => {
      const error = new Error('Unauthorized')

      vi.mocked(apiClient.get).mockRejectedValueOnce(error)

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized')
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    })
  })

  describe('API endpoint validation', () => {
    it('should use correct API endpoints for all methods', async () => {
      // Mock all API calls to avoid errors
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} })

      // Test all endpoints
      await authService.login({ email: 'test@example.com', password: 'password' })
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', expect.any(Object))

      await authService.register({ email: 'test@example.com', password: 'password' })
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', expect.any(Object))

      await authService.logout('token')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', expect.any(Object))

      await authService.refreshToken({ refreshToken: 'token' })
      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', expect.any(Object))

      await authService.getCurrentUser()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    })
  })
})