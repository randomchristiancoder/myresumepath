import React, { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import ApiKeyInput from './ApiKeyInput'
import ModelSelector from './ModelSelector'
import ApiKeyActions from './ApiKeyActions'
import { 
  Brain, 
  Shield, 
  Globe, 
  Star, 
  Zap, 
  Cpu, 
  Code, 
  MessageSquare, 
  Search,
  Crown,
  Gift,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

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

interface Provider {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  color: string
  website: string
}

interface ApiKeyManagerProps {
  provider: Provider
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  provider,
  onSuccess,
  onError
}) => {
  const { apiKeys, addApiKey, updateApiKey, deleteApiKey, getApiKey } = useSettingsStore()
  
  const [tempApiKey, setTempApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [validationError, setValidationError] = useState('')

  const existingKey = getApiKey(provider.id)

  // Comprehensive AI Models Database
  const availableModels: AIModel[] = [
    // OpenRouter Free Models
    {
      id: 'meta-llama/llama-3.2-3b-instruct:free',
      name: 'Llama 3.2 3B Instruct (Free)',
      provider: 'openrouter',
      description: 'Meta\'s latest instruction-tuned model, optimized for chat',
      pricing: 'free',
      contextWindow: 131072,
      category: 'text',
      performance: 'good',
      recommended: true
    },
    {
      id: 'microsoft/phi-3-mini-128k-instruct:free',
      name: 'Phi-3 Mini (Free)',
      provider: 'openrouter',
      description: 'Microsoft\'s efficient small model with large context',
      pricing: 'free',
      contextWindow: 128000,
      category: 'text',
      performance: 'good'
    },
    {
      id: 'google/gemma-2-9b-it:free',
      name: 'Gemma 2 9B IT (Free)',
      provider: 'openrouter',
      description: 'Google\'s open-source instruction-tuned model',
      pricing: 'free',
      contextWindow: 8192,
      category: 'text',
      performance: 'good'
    },
    {
      id: 'mistralai/mistral-7b-instruct:free',
      name: 'Mistral 7B Instruct (Free)',
      provider: 'openrouter',
      description: 'High-quality instruction-following model',
      pricing: 'free',
      contextWindow: 32768,
      category: 'text',
      performance: 'good',
      recommended: true
    },
    {
      id: 'huggingfaceh4/zephyr-7b-beta:free',
      name: 'Zephyr 7B Beta (Free)',
      provider: 'openrouter',
      description: 'Fine-tuned Mistral model for helpful conversations',
      pricing: 'free',
      contextWindow: 32768,
      category: 'text',
      performance: 'good'
    },

    // OpenRouter Premium Models
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      provider: 'openrouter',
      description: 'OpenAI\'s most advanced multimodal model',
      pricing: 'paid',
      contextWindow: 128000,
      category: 'multimodal',
      performance: 'excellent',
      recommended: true,
      inputCost: '$5.00/1M',
      outputCost: '$15.00/1M'
    },
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'openrouter',
      description: 'Anthropic\'s most capable model for complex tasks',
      pricing: 'paid',
      contextWindow: 200000,
      category: 'text',
      performance: 'excellent',
      recommended: true,
      inputCost: '$3.00/1M',
      outputCost: '$15.00/1M'
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5',
      provider: 'openrouter',
      description: 'Google\'s advanced multimodal model',
      pricing: 'paid',
      contextWindow: 2000000,
      category: 'multimodal',
      performance: 'excellent',
      inputCost: '$1.25/1M',
      outputCost: '$5.00/1M'
    },

    // OpenAI Models
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      description: 'Most advanced multimodal model with excellent reasoning',
      pricing: 'paid',
      contextWindow: 128000,
      category: 'multimodal',
      performance: 'excellent',
      recommended: true,
      inputCost: '$5.00/1M',
      outputCost: '$15.00/1M'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      description: 'Fast and capable model for complex tasks',
      pricing: 'paid',
      contextWindow: 128000,
      category: 'text',
      performance: 'excellent',
      inputCost: '$10.00/1M',
      outputCost: '$30.00/1M'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Fast and efficient model for most tasks',
      pricing: 'paid',
      contextWindow: 16385,
      category: 'text',
      performance: 'good',
      inputCost: '$0.50/1M',
      outputCost: '$1.50/1M'
    },

    // Anthropic Models
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      description: 'Most powerful Claude model for complex reasoning',
      pricing: 'paid',
      contextWindow: 200000,
      category: 'text',
      performance: 'excellent',
      recommended: true,
      inputCost: '$15.00/1M',
      outputCost: '$75.00/1M'
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      description: 'Balanced performance and speed',
      pricing: 'paid',
      contextWindow: 200000,
      category: 'text',
      performance: 'excellent',
      inputCost: '$3.00/1M',
      outputCost: '$15.00/1M'
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      description: 'Fast and efficient for quick tasks',
      pricing: 'paid',
      contextWindow: 200000,
      category: 'text',
      performance: 'good',
      inputCost: '$0.25/1M',
      outputCost: '$1.25/1M'
    },

    // Google Models
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      description: 'Google\'s most capable multimodal model',
      pricing: 'freemium',
      contextWindow: 32768,
      category: 'multimodal',
      performance: 'excellent',
      recommended: true
    },
    {
      id: 'gemini-pro-vision',
      name: 'Gemini Pro Vision',
      provider: 'google',
      description: 'Specialized for image and text understanding',
      pricing: 'freemium',
      contextWindow: 16384,
      category: 'multimodal',
      performance: 'excellent'
    },

    // Cohere Models
    {
      id: 'command-r-plus',
      name: 'Command R+',
      provider: 'cohere',
      description: 'Advanced model for complex reasoning and analysis',
      pricing: 'paid',
      contextWindow: 128000,
      category: 'text',
      performance: 'excellent',
      inputCost: '$3.00/1M',
      outputCost: '$15.00/1M'
    },
    {
      id: 'command-r',
      name: 'Command R',
      provider: 'cohere',
      description: 'Efficient model for retrieval-augmented generation',
      pricing: 'paid',
      contextWindow: 128000,
      category: 'text',
      performance: 'good',
      inputCost: '$0.50/1M',
      outputCost: '$1.50/1M'
    }
  ]

  useEffect(() => {
    if (existingKey) {
      setTempApiKey(existingKey.apiKey)
      setSelectedModel(existingKey.selectedModel)
    } else {
      // Set default free model for new keys
      const defaultFreeModel = availableModels.find(
        model => model.provider === provider.id && model.pricing === 'free' && model.recommended
      )
      if (defaultFreeModel) {
        setSelectedModel(defaultFreeModel.id)
      }
    }
  }, [existingKey, provider.id])

  const validateApiKey = (key: string): boolean => {
    if (!key.trim()) {
      setValidationError('API key is required')
      return false
    }

    // Provider-specific validation
    switch (provider.id) {
      case 'openai':
        if (!key.startsWith('sk-')) {
          setValidationError('OpenAI API keys should start with "sk-"')
          return false
        }
        break
      case 'anthropic':
        if (!key.startsWith('sk-ant-')) {
          setValidationError('Anthropic API keys should start with "sk-ant-"')
          return false
        }
        break
      case 'openrouter':
        if (!key.startsWith('sk-or-v1-')) {
          setValidationError('OpenRouter API keys should start with "sk-or-v1-"')
          return false
        }
        break
      case 'google':
        if (!key.startsWith('AIza')) {
          setValidationError('Google API keys should start with "AIza"')
          return false
        }
        break
    }

    setValidationError('')
    return true
  }

  const handleSave = async () => {
    if (!validateApiKey(tempApiKey)) return

    setIsSaving(true)
    try {
      if (existingKey) {
        updateApiKey(existingKey.id, {
          apiKey: tempApiKey,
          selectedModel: selectedModel
        })
      } else {
        addApiKey(provider.id, tempApiKey, selectedModel)
      }

      onSuccess?.(`${provider.name} API key saved successfully!`)
    } catch (error) {
      onError?.('Failed to save API key')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!existingKey) return

    setIsDeleting(true)
    try {
      deleteApiKey(existingKey.id)
      setTempApiKey('')
      setSelectedModel('')
      onSuccess?.(`${provider.name} API key deleted successfully!`)
    } catch (error) {
      onError?.('Failed to delete API key')
    } finally {
      setIsDeleting(false)
    }
  }

  const providerModels = availableModels.filter(model => model.provider === provider.id)
  const freeModelsCount = providerModels.filter(model => model.pricing === 'free').length

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${provider.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <provider.icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{provider.name}</h3>
              <p className="text-white/80 text-sm">{provider.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-white/90 text-xs">
                  <Cpu className="h-3 w-3" />
                  <span>{providerModels.length} models</span>
                </div>
                {freeModelsCount > 0 && (
                  <div className="flex items-center space-x-1 text-white/90 text-xs">
                    <Gift className="h-3 w-3" />
                    <span>{freeModelsCount} free</span>
                  </div>
                )}
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-white/90 hover:text-white text-xs transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Get API Key</span>
                </a>
              </div>
            </div>
          </div>
          {existingKey && (
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <span className="text-white text-sm font-medium">Configured</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <ApiKeyInput
          value={tempApiKey}
          onChange={setTempApiKey}
          provider={provider.id}
          error={validationError}
          disabled={isSaving || isDeleting}
        />

        <ModelSelector
          provider={provider.id}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          availableModels={availableModels}
          disabled={isSaving || isDeleting}
        />

        {/* Storage Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-900 font-medium">Secure Local Storage</p>
              <p className="text-blue-700 mt-1">
                Your API key is stored locally in your browser and never transmitted to our servers. 
                It persists until manually cleared.
              </p>
            </div>
          </div>
        </div>

        <ApiKeyActions
          onSave={handleSave}
          onDelete={existingKey ? handleDelete : undefined}
          isSaving={isSaving}
          isDeleting={isDeleting}
          canSave={!!tempApiKey.trim() && !!selectedModel}
          canDelete={!!existingKey}
          saveText={existingKey ? 'Update Configuration' : 'Save API Key'}
        />
      </div>
    </div>
  )
}

export default ApiKeyManager