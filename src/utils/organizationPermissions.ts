import { OrganizationOwnerService } from '../services/organizationOwnerService'
import { UserService } from '../services/userService'

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
    const isOwner = await OrganizationOwnerService.checkOwnership(organizationId)
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
    const isOwner = await OrganizationOwnerService.checkOwnership(organizationId)
    return isOwner

  } catch (error) {
    // On any error (API failure, network issues, etc.), deny access for security
    console.error('Failed to check organization registration edit permissions:', error)
    return false
  }
}