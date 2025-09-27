import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Make environment variables available in test environment
(import.meta.env as any).VITE_API_BASE_URL = 'http://localhost:3000';
(import.meta.env as any).VITE_ORG_API_BASE_URL = 'http://localhost:3001/api/org';
(import.meta.env as any).DEV = true;
(import.meta.env as any).VITE_APP_NAME = 'Windbooks UI';
(import.meta.env as any).VITE_CORS_ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:3000,http://localhost:3001';
(import.meta.env as any).VITE_SECURE_COOKIES = 'false';

// JWT Analysis Tool
(global as any).analyzeJWT = () => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  if (!token) {
    console.log('❌ No JWT token found in storage')
    return null
  }
  
  try {
    const [header, payload, signature] = token.split('.')
    const decodedPayload = JSON.parse(atob(payload))
    
    console.log('🔍 JWT Analysis:')
    console.log('📏 Token Length:', token.length, 'chars')
    console.log('📦 Payload:', decodedPayload)
    console.log('⏰ Expires:', new Date(decodedPayload.exp * 1000))
    console.log('🔧 Size Analysis:', {
      header: header.length,
      payload: payload.length,
      signature: signature.length,
      total: token.length
    })
    
    return { header, payload: decodedPayload, signature, size: token.length }
  } catch (error) {
    console.error('❌ Failed to parse JWT:', error)
    return null
  }
}

console.log('🔧 JWT Analysis Tool Available: Call analyzeJWT() in console to analyze current token')

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})