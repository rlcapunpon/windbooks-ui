import React from 'react'

interface CreateOrganizationButtonProps {
  hasCreatePermission: boolean
  onCreate: () => void
}

export const CreateOrganizationButton: React.FC<CreateOrganizationButtonProps> = ({
  hasCreatePermission,
  onCreate
}) => {
  if (!hasCreatePermission) {
    return null
  }

  return (
    <button
      type="button"
      onClick={onCreate}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label="Create new organization"
    >
      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Create Organization
    </button>
  )
}