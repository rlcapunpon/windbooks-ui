import React from 'react'

interface RadioOption {
  value: string
  label: string
  description: string
  ariaLabel?: string
}

interface RadioOptionSelectorProps {
  name: string
  options: RadioOption[]
  selectedValue: string
  onChange: (value: string) => void
  columns?: number
}

export const RadioOptionSelector: React.FC<RadioOptionSelectorProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  columns = 2
}) => {
  const gridCols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {options.map((option) => (
        <label key={option.value} className="relative">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
                          aria-label={option.ariaLabel || option.label}
          />
          <div className={`p-4 border-2 rounded-lg cursor-pointer hover:border-gray-300 transition-all duration-200 ${
            selectedValue === option.value
              ? 'border-primary'
              : 'border-gray-200'
          }`}
          style={selectedValue === option.value ? {
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            fontWeight: '600'
          } : {}}>
            <div className="flex items-center justify-center">
              <div>
                <div className={`font-medium ${selectedValue === option.value ? '' : 'text-gray-900'}`}>{option.label}</div>
                <div className={`text-sm ${selectedValue === option.value ? 'text-white/80' : 'text-gray-600'}`}>{option.description}</div>
              </div>
            </div>
          </div>
        </label>
      ))}
    </div>
  )
}