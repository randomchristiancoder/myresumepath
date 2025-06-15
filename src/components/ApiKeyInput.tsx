import React, { useState } from 'react'
import { Eye, EyeOff, Key, AlertCircle } from 'lucide-react'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
  provider: string
  placeholder?: string
  error?: string
  disabled?: boolean
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  value,
  onChange,
  provider,
  placeholder,
  error,
  disabled = false
}) => {
  const [showKey, setShowKey] = useState(false)

  const getPlaceholderText = () => {
    if (placeholder) return placeholder
    
    switch (provider) {
      case 'openai':
        return 'sk-...'
      case 'anthropic':
        return 'sk-ant-...'
      case 'openrouter':
        return 'sk-or-v1-...'
      case 'google':
        return 'AIza...'
      case 'cohere':
        return 'co-...'
      default:
        return 'Enter your API key...'
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        <Key className="h-4 w-4 inline mr-2" />
        API Key
      </label>
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getPlaceholderText()}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 border rounded-lg font-mono text-sm transition-all duration-200 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
          } ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed"
        >
          {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default ApiKeyInput