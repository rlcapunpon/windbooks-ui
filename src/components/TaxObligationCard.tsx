import React from 'react'
import type { OrganizationObligationResponseDto, TaxObligationResponseDto } from '../services/organizationService'

interface TaxObligationCardProps {
  organizationObligation: OrganizationObligationResponseDto
  taxObligation: TaxObligationResponseDto
}

const TaxObligationCard: React.FC<TaxObligationCardProps> = ({
  organizationObligation,
  taxObligation
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'DUE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FILED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'LATE':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'EXEMPT':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'SUSPENDED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'CLOSED':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'ASSIGNED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'NOT_APPLICABLE':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'MONTHLY':
        return '📅'
      case 'QUARTERLY':
        return '📊'
      case 'ANNUAL':
        return '📈'
      case 'ONE_TIME':
        return '🔸'
      default:
        return '📋'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {taxObligation.code}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {taxObligation.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {getFrequencyIcon(taxObligation.frequency)}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(organizationObligation.status)}`}>
            {organizationObligation.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Frequency:</span>
          <span className="text-gray-900 font-medium">{taxObligation.frequency}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Start Date:</span>
          <span className="text-gray-900">{formatDate(organizationObligation.start_date)}</span>
        </div>

        {organizationObligation.end_date && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">End Date:</span>
            <span className="text-gray-900">{formatDate(organizationObligation.end_date)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Last Updated:</span>
          <span className="text-gray-900">{formatDate(organizationObligation.updated_at)}</span>
        </div>

        {organizationObligation.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Notes:</p>
            <p className="text-sm text-gray-700">{organizationObligation.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaxObligationCard