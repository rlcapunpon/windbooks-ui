import { OrganizationOwnerService } from '../services/organizationOwnerService'
import { UserService } from '../services/userService'

// Cache for ownership check results to prevent redundant API calls
// Key: organizationId, Value: Promise<boolean> to handle concurrent requests
const ownershipCache = new Map<string, Promise<boolean>>()

/**
 * Checks if the current user has permission to edit an organization's business status
 * 
 * A user can edit the business status if:
 * 1. The user is a SUPERADMIN (has wildcard permissions)
 * 2. The user is an owner of the organization
 * 
 * @param organizationId - The ID of the organization to check permissions for
 * @returns Promise<boolean> - True if user can edit the status, false otherwise
 */
export async function canEditOrganizationStatus(organizationId: string): Promise<boolean> {
  try {
    // First check if user is SUPERADMIN - this gives universal access regardless of organization ID
    if (UserService.isSuperAdmin()) {
      return true
    }

    // Check if organization ID is valid
    if (!organizationId || typeof organizationId !== 'string' || organizationId.trim() === '') {
      return false
    }

    // If not SUPERADMIN, check if user is an owner of the organization
    const isOwner = await getCachedOwnership(organizationId)
    return isOwner

  } catch (error) {
    // On any error (API failure, network issues, etc.), deny access for security
    console.error('Failed to check organization edit permissions:', error)
    return false
  }
}

/**
 * Checks if the current user has permission to edit an organization's registration information
 * 
 * A user can edit the registration information if:
 * 1. The user is a SUPERADMIN (has wildcard permissions)
 * 2. The user is an owner of the organization
 * 
 * @param organizationId - The ID of the organization to check permissions for
 * @returns Promise<boolean> - True if user can edit the registration, false otherwise
 */
export async function canEditOrganizationRegistration(organizationId: string): Promise<boolean> {
  try {
    // First check if user is SUPERADMIN - this gives universal access regardless of organization ID
    if (UserService.isSuperAdmin()) {
      return true
    }

    // Check if organization ID is valid
    if (!organizationId || typeof organizationId !== 'string' || organizationId.trim() === '') {
      return false
    }

    // If not SUPERADMIN, check if user is an owner of the organization
    const isOwner = await getCachedOwnership(organizationId)
    return isOwner

  } catch (error) {
    // On any error (API failure, network issues, etc.), deny access for security
    console.error('Failed to check organization registration edit permissions:', error)
    return false
  }
}

/**
 * Cached ownership check to prevent redundant API calls
 * Uses a Map to cache results per organization ID
 * 
 * @param organizationId - The ID of the organization to check ownership for
 * @returns Promise<boolean> - True if user is owner, false otherwise
 */
async function getCachedOwnership(organizationId: string): Promise<boolean> {
  // Check if we already have a cached result for this organization
  const cachedResult = ownershipCache.get(organizationId)
  if (cachedResult !== undefined) {
    return cachedResult
  }

  // If not cached, make the API call and cache the result
  const ownershipPromise = OrganizationOwnerService.checkOwnership(organizationId)
  
  // Cache the promise to handle concurrent requests
  ownershipCache.set(organizationId, ownershipPromise)

  try {
    const result = await ownershipPromise
    // Replace the promise with the resolved value for future calls
    ownershipCache.set(organizationId, Promise.resolve(result))
    return result
  } catch (error) {
    // On error, remove from cache so it can be retried
    ownershipCache.delete(organizationId)
    throw error
  }
}

/**
 * Clears the ownership cache - useful for testing or when user context changes
 */
export function clearOwnershipCache(): void {
  ownershipCache.clear()
}