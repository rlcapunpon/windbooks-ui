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
  columns = 1
}) => {
  const gridCols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

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
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  selectedValue === option.value ? 'bg-white' : ''
                }`}></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </div>
          </div>
        </label>
      ))}
    </div>
  )
}