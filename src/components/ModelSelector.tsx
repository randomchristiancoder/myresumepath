import React, { useState, useMemo } from 'react'
import { Search, Cpu, Crown, Gift, ExternalLink, ChevronDown } from 'lucide-react'

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  pricing: 'free' | 'paid' | 'freemium'
  contextWindow: number
  category: string
  performance: 'basic' | 'good' | 'excellent'
  recommended?: boolean
  inputCost?: string
  outputCost?: string
}

interface ModelSelectorProps {
  provider: string
  selectedModel: string
  onModelSelect: (modelId: string) => void
  availableModels: AIModel[]
  disabled?: boolean
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  provider,
  selectedModel,
  onModelSelect,
  availableModels,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredModels = useMemo(() => {
    return availableModels.filter(model => {
      const matchesProvider = model.provider === provider
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory
      
      return matchesProvider && matchesSearch && matchesCategory
    })
  }, [availableModels, provider, searchTerm, selectedCategory])

  const freeModels = filteredModels.filter(model => model.pricing === 'free')
  const paidModels = filteredModels.filter(model => model.pricing !== 'free')

  const selectedModelData = availableModels.find(model => model.id === selectedModel)

  const categories = [...new Set(availableModels.filter(m => m.provider === provider).map(m => m.category))]

  const getPricingBadge = (model: AIModel) => {
    switch (model.pricing) {
      case 'free':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">FREE</span>
      case 'paid':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">PAID</span>
      case 'freemium':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">FREEMIUM</span>
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'basic': return 'text-orange-600'
      default: return 'text-slate-600'
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        <Cpu className="h-4 w-4 inline mr-2" />
        AI Model
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 text-left border rounded-lg transition-all duration-200 ${
            disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white hover:border-blue-400'
          } border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {selectedModelData ? (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-900">{selectedModelData.name}</span>
                  {selectedModelData.pricing === 'free' && <Gift className="h-4 w-4 text-green-500" />}
                  {selectedModelData.recommended && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
              ) : (
                <span className="text-slate-500">Select a model...</span>
              )}
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
            {/* Search and Filter */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {/* Free Models Section */}
              {freeModels.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Free Models ({freeModels.length})</span>
                  </div>
                  {freeModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelSelect(model.id)
                        setIsOpen(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedModel === model.id
                          ? 'bg-green-100 border border-green-300'
                          : 'hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900">{model.name}</span>
                          {model.recommended && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        {getPricingBadge(model)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{model.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{model.contextWindow.toLocaleString()} tokens</span>
                        <span className={`font-medium ${getPerformanceColor(model.performance)}`}>
                          {model.performance}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Paid Models Section */}
              {paidModels.length > 0 && (
                <div className="p-2 border-t border-slate-200">
                  <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                    <Crown className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Premium Models ({paidModels.length})</span>
                  </div>
                  {paidModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelSelect(model.id)
                        setIsOpen(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedModel === model.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900">{model.name}</span>
                          {model.recommended && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        {getPricingBadge(model)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{model.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{model.contextWindow.toLocaleString()} tokens</span>
                        <div className="flex items-center space-x-2">
                          {model.inputCost && (
                            <span className="text-slate-500">In: {model.inputCost}</span>
                          )}
                          {model.outputCost && (
                            <span className="text-slate-500">Out: {model.outputCost}</span>
                          )}
                          <span className={`font-medium ${getPerformanceColor(model.performance)}`}>
                            {model.performance}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {filteredModels.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No models found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedModelData && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-900">Selected Model Details</span>
            <div className="flex items-center space-x-1">
              {selectedModelData.pricing === 'free' && <Gift className="h-4 w-4 text-green-500" />}
              {selectedModelData.recommended && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Context:</span>
              <span className="ml-1 font-medium">{selectedModelData.contextWindow.toLocaleString()} tokens</span>
            </div>
            <div>
              <span className="text-slate-500">Performance:</span>
              <span className={`ml-1 font-medium ${getPerformanceColor(selectedModelData.performance)}`}>
                {selectedModelData.performance}
              </span>
            </div>
            {selectedModelData.inputCost && (
              <div>
                <span className="text-slate-500">Input Cost:</span>
                <span className="ml-1 font-medium">{selectedModelData.inputCost}</span>
              </div>
            )}
            {selectedModelData.outputCost && (
              <div>
                <span className="text-slate-500">Output Cost:</span>
                <span className="ml-1 font-medium">{selectedModelData.outputCost}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector