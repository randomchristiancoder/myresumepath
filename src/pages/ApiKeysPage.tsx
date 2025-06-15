import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Shield,
  Zap,
  Settings,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  Brain,
  Sparkles,
  RefreshCw
} from 'lucide-react'

interface ApiKey {
  id: string
  provider: string
  api_key: string
  is_active: boolean
  usage_settings: {
    resume_parsing: boolean
    job_matching: boolean
    course_recommendations: boolean
    personality_analysis: boolean
    skill_gap_analysis: boolean
    report_generation: boolean
  }
  selected_models: {
    [key: string]: string
  }
  created_at: string
  updated_at: string
}

interface Provider {
  id: string
  name: string
  description: string
  icon: string
  color: string
  placeholder: string
  website: string
  features: string[]
  models: AIModel[]
}

interface AIModel {
  id: string
  name: string
  description: string
  capabilities: string[]
  pricing: string
  context_length: string
  recommended_for: string[]
}

const ApiKeysPage: React.FC = () => {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingModels, setLoadingModels] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingSettings, setEditingSettings] = useState<string | null>(null)
  const [editingModels, setEditingModels] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({ 
    provider: '', 
    api_key: '',
    usage_settings: {
      resume_parsing: true,
      job_matching: true,
      course_recommendations: true,
      personality_analysis: true,
      skill_gap_analysis: true,
      report_generation: true
    },
    selected_models: {} as { [key: string]: string }
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const providers: Provider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5, and other OpenAI models for advanced text analysis',
      icon: '🤖',
      color: 'from-green-500 to-emerald-500',
      placeholder: 'sk-...',
      website: 'https://platform.openai.com/api-keys',
      features: ['Resume Parsing', 'Job Matching', 'Personality Analysis', 'Course Recommendations'],
      models: [
        {
          id: 'gpt-4-turbo-preview',
          name: 'GPT-4 Turbo',
          description: 'Most capable model, best for complex reasoning and analysis',
          capabilities: ['Advanced reasoning', 'Code analysis', 'Complex text processing'],
          pricing: '$0.01/1K tokens',
          context_length: '128K tokens',
          recommended_for: ['Resume parsing', 'Personality analysis', 'Complex reasoning']
        },
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'High-quality model for detailed analysis and reasoning',
          capabilities: ['Advanced reasoning', 'Detailed analysis', 'Creative tasks'],
          pricing: '$0.03/1K tokens',
          context_length: '8K tokens',
          recommended_for: ['Resume analysis', 'Career recommendations']
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient model for general tasks',
          capabilities: ['General text processing', 'Quick analysis', 'Cost-effective'],
          pricing: '$0.001/1K tokens',
          context_length: '16K tokens',
          recommended_for: ['Basic parsing', 'Quick analysis', 'Cost optimization']
        }
      ]
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude models for sophisticated reasoning and analysis',
      icon: '🧠',
      color: 'from-orange-500 to-red-500',
      placeholder: 'sk-ant-...',
      website: 'https://console.anthropic.com/',
      features: ['Resume Parsing', 'Personality Analysis', 'Report Generation'],
      models: [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Most powerful model for complex analysis and reasoning',
          capabilities: ['Advanced reasoning', 'Complex analysis', 'Creative writing'],
          pricing: '$15/1M tokens',
          context_length: '200K tokens',
          recommended_for: ['Complex resume analysis', 'Detailed personality insights']
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          description: 'Balanced model for most tasks',
          capabilities: ['Good reasoning', 'Balanced performance', 'Reliable analysis'],
          pricing: '$3/1M tokens',
          context_length: '200K tokens',
          recommended_for: ['General analysis', 'Resume parsing', 'Career insights']
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          description: 'Fast and efficient model for quick tasks',
          capabilities: ['Fast processing', 'Cost-effective', 'Quick analysis'],
          pricing: '$0.25/1M tokens',
          context_length: '200K tokens',
          recommended_for: ['Quick parsing', 'Basic analysis', 'Cost optimization']
        }
      ]
    },
    {
      id: 'google',
      name: 'Google AI',
      description: 'Gemini and PaLM models for multimodal AI capabilities',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500',
      placeholder: 'AIza...',
      website: 'https://makersuite.google.com/app/apikey',
      features: ['Resume Parsing', 'Job Matching', 'Course Recommendations'],
      models: [
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          description: 'Advanced model for complex reasoning and analysis',
          capabilities: ['Advanced reasoning', 'Multimodal processing', 'Code understanding'],
          pricing: 'Free tier available',
          context_length: '32K tokens',
          recommended_for: ['Resume analysis', 'Technical skill assessment']
        },
        {
          id: 'gemini-pro-vision',
          name: 'Gemini Pro Vision',
          description: 'Multimodal model for text and image analysis',
          capabilities: ['Text analysis', 'Image processing', 'Document understanding'],
          pricing: 'Free tier available',
          context_length: '32K tokens',
          recommended_for: ['Resume document analysis', 'Visual content processing']
        }
      ]
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Real-time web search and analysis for up-to-date career insights',
      icon: '🔍',
      color: 'from-cyan-500 to-blue-500',
      placeholder: 'pplx-...',
      website: 'https://www.perplexity.ai/settings/api',
      features: ['Job Matching', 'Course Recommendations', 'Skill Gap Analysis'],
      models: [
        {
          id: 'pplx-7b-online',
          name: 'Perplexity 7B Online',
          description: 'Real-time web search with AI analysis',
          capabilities: ['Real-time search', 'Current information', 'Web analysis'],
          pricing: '$0.2/1K tokens',
          context_length: '4K tokens',
          recommended_for: ['Job market analysis', 'Current course recommendations']
        },
        {
          id: 'pplx-70b-online',
          name: 'Perplexity 70B Online',
          description: 'Advanced real-time analysis with larger model',
          capabilities: ['Advanced search', 'Complex analysis', 'Real-time insights'],
          pricing: '$1/1K tokens',
          context_length: '4K tokens',
          recommended_for: ['Comprehensive job analysis', 'Market trend analysis']
        }
      ]
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Access to multiple AI models through a single API',
      icon: '🔀',
      color: 'from-purple-500 to-violet-500',
      placeholder: 'sk-or-...',
      website: 'https://openrouter.ai/keys',
      features: ['Resume Parsing', 'Job Matching', 'Personality Analysis'],
      models: [
        {
          id: 'openai/gpt-4-turbo-preview',
          name: 'GPT-4 Turbo (via OpenRouter)',
          description: 'OpenAI GPT-4 Turbo through OpenRouter',
          capabilities: ['Advanced reasoning', 'Complex analysis', 'High quality'],
          pricing: 'Variable pricing',
          context_length: '128K tokens',
          recommended_for: ['High-quality analysis', 'Complex reasoning tasks']
        },
        {
          id: 'anthropic/claude-3-opus',
          name: 'Claude 3 Opus (via OpenRouter)',
          description: 'Anthropic Claude 3 Opus through OpenRouter',
          capabilities: ['Advanced reasoning', 'Creative analysis', 'Long context'],
          pricing: 'Variable pricing',
          context_length: '200K tokens',
          recommended_for: ['Detailed analysis', 'Creative insights']
        },
        {
          id: 'meta-llama/llama-2-70b-chat',
          name: 'Llama 2 70B',
          description: 'Meta\'s open-source large language model',
          capabilities: ['Open source', 'Good reasoning', 'Cost-effective'],
          pricing: 'Lower cost',
          context_length: '4K tokens',
          recommended_for: ['Cost-effective analysis', 'Open source preference']
        }
      ]
    },
    {
      id: 'cohere',
      name: 'Cohere',
      description: 'Enterprise-grade language models for text understanding',
      icon: '⚡',
      color: 'from-indigo-500 to-purple-500',
      placeholder: 'co-...',
      website: 'https://dashboard.cohere.ai/api-keys',
      features: ['Resume Parsing', 'Personality Analysis'],
      models: [
        {
          id: 'command',
          name: 'Command',
          description: 'Cohere\'s flagship model for text generation and analysis',
          capabilities: ['Text generation', 'Analysis', 'Enterprise features'],
          pricing: 'Enterprise pricing',
          context_length: '4K tokens',
          recommended_for: ['Enterprise use', 'Text analysis', 'Reliable processing']
        },
        {
          id: 'command-light',
          name: 'Command Light',
          description: 'Lighter version for faster processing',
          capabilities: ['Fast processing', 'Cost-effective', 'Good performance'],
          pricing: 'Lower cost',
          context_length: '4K tokens',
          recommended_for: ['Quick analysis', 'Cost optimization', 'Fast processing']
        }
      ]
    }
  ]

  const usageFeatures = [
    { key: 'resume_parsing', label: 'Resume Parsing', description: 'Extract and analyze resume content' },
    { key: 'job_matching', label: 'Job Matching', description: 'Find relevant career opportunities' },
    { key: 'course_recommendations', label: 'Course Recommendations', description: 'Suggest learning resources' },
    { key: 'personality_analysis', label: 'Personality Analysis', description: 'Assess career personality traits' },
    { key: 'skill_gap_analysis', label: 'Skill Gap Analysis', description: 'Identify missing skills' },
    { key: 'report_generation', label: 'Report Generation', description: 'Generate comprehensive reports' }
  ]

  useEffect(() => {
    fetchApiKeys()
  }, [user])

  const fetchApiKeys = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Ensure selected_models field exists for all keys
      const keysWithModels = (data || []).map(key => ({
        ...key,
        selected_models: key.selected_models || {}
      }))
      
      setApiKeys(keysWithModels)
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setError('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableModels = async (provider: string, apiKey: string) => {
    setLoadingModels(provider)
    
    try {
      // Simulate API call to get available models
      // In a real implementation, this would call the provider's API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const providerInfo = getProviderInfo(provider)
      const defaultModels: { [key: string]: string } = {}
      
      // Set default model for each capability
      if (providerInfo.models.length > 0) {
        const defaultModel = providerInfo.models[0].id
        usageFeatures.forEach(feature => {
          if (formData.usage_settings[feature.key as keyof typeof formData.usage_settings]) {
            defaultModels[feature.key] = defaultModel
          }
        })
      }
      
      setFormData(prev => ({
        ...prev,
        selected_models: defaultModels
      }))
      
      setSuccess(`Loaded ${providerInfo.models.length} available models for ${providerInfo.name}`)
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (error) {
      console.error('Error loading models:', error)
      setError('Failed to load available models')
    } finally {
      setLoadingModels(null)
    }
  }

  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.provider || !formData.api_key) return

    try {
      setError(null)
      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          provider: formData.provider,
          api_key: formData.api_key,
          usage_settings: formData.usage_settings,
          selected_models: formData.selected_models,
          is_active: true
        })

      if (error) throw error

      setSuccess('API key added successfully!')
      setFormData({ 
        provider: '', 
        api_key: '',
        usage_settings: {
          resume_parsing: true,
          job_matching: true,
          course_recommendations: true,
          personality_analysis: true,
          skill_gap_analysis: true,
          report_generation: true
        },
        selected_models: {}
      })
      setShowAddForm(false)
      fetchApiKeys()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error adding API key:', err)
      if (err.code === '23505') {
        setError('You already have an active API key for this provider')
      } else {
        setError('Failed to add API key')
      }
    }
  }

  const handleUpdateApiKey = async (id: string, newApiKey: string) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('api_keys')
        .update({ api_key: newApiKey })
        .eq('id', id)

      if (error) throw error

      setSuccess('API key updated successfully!')
      setEditingKey(null)
      fetchApiKeys()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error updating API key:', err)
      setError('Failed to update API key')
    }
  }

  const handleUpdateUsageSettings = async (id: string, newSettings: any) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('api_keys')
        .update({ usage_settings: newSettings })
        .eq('id', id)

      if (error) throw error

      setSuccess('Usage settings updated successfully!')
      setEditingSettings(null)
      fetchApiKeys()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error updating usage settings:', err)
      setError('Failed to update usage settings')
    }
  }

  const handleUpdateSelectedModels = async (id: string, newModels: { [key: string]: string }) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('api_keys')
        .update({ selected_models: newModels })
        .eq('id', id)

      if (error) throw error

      setSuccess('AI models updated successfully!')
      setEditingModels(null)
      fetchApiKeys()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error updating AI models:', err)
      setError('Failed to update AI models')
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      setError(null)
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccess('API key deleted successfully!')
      fetchApiKeys()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error deleting API key:', err)
      setError('Failed to delete API key')
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const toggleModelsExpanded = (keyId: string) => {
    const newExpanded = new Set(expandedModels)
    if (newExpanded.has(keyId)) {
      newExpanded.delete(keyId)
    } else {
      newExpanded.add(keyId)
    }
    setExpandedModels(newExpanded)
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length)
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

  const getProviderInfo = (providerId: string) => {
    return providers.find(p => p.id === providerId) || {
      id: providerId,
      name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
      description: 'AI Provider',
      icon: '🔑',
      color: 'from-gray-500 to-slate-500',
      placeholder: 'API Key',
      website: '#',
      features: [],
      models: []
    }
  }

  const updateFormUsageSetting = (feature: string, value: boolean) => {
    setFormData({
      ...formData,
      usage_settings: {
        ...formData.usage_settings,
        [feature]: value
      }
    })
  }

  const updateFormModelSelection = (feature: string, modelId: string) => {
    setFormData({
      ...formData,
      selected_models: {
        ...formData.selected_models,
        [feature]: modelId
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Key className="h-8 w-8 mr-3 text-blue-600" />
            API Key Management
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your AI provider API keys with granular control over models and feature usage
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add API Key
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-3" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-3" />
          {success}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Security & AI Model Selection</h3>
            <p className="text-blue-800 text-sm mb-3">
              Your API keys are encrypted and stored securely. You can now select specific AI models for each feature to optimize performance and costs.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Keys are encrypted at rest using industry-standard encryption</li>
              <li>• Select specific AI models for each feature (resume parsing, job matching, etc.)</li>
              <li>• Granular control over which features use which models</li>
              <li>• Only active features will consume API credits</li>
              <li>• You can revoke access at any time by deleting the keys</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add API Key Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Add New API Key</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleAddApiKey} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select AI Provider
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, provider: provider.id, selected_models: {} })}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      formData.provider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{provider.icon}</span>
                      <span className="font-semibold text-slate-900">{provider.name}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{provider.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {provider.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-blue-600 font-medium">
                        {provider.models.length} models
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {formData.provider && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={formData.api_key}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      placeholder={getProviderInfo(formData.provider).placeholder}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => loadAvailableModels(formData.provider, formData.api_key)}
                      disabled={!formData.api_key || loadingModels === formData.provider}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loadingModels === formData.provider ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Cpu className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Get your API key from{' '}
                    <a
                      href={getProviderInfo(formData.provider).website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {getProviderInfo(formData.provider).name} dashboard
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Feature Usage Settings & AI Model Selection
                  </label>
                  <p className="text-sm text-slate-600 mb-4">
                    Choose which features can use this API key and select specific AI models for each feature.
                  </p>
                  <div className="space-y-4">
                    {usageFeatures.map((feature) => {
                      const isEnabled = formData.usage_settings[feature.key as keyof typeof formData.usage_settings]
                      const providerInfo = getProviderInfo(formData.provider)
                      const selectedModel = formData.selected_models[feature.key]
                      
                      return (
                        <div key={feature.key} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-slate-900">{feature.label}</h4>
                              <p className="text-xs text-slate-600">{feature.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateFormUsageSetting(feature.key, !isEnabled)}
                              className="ml-3"
                            >
                              {isEnabled ? (
                                <ToggleRight className="h-6 w-6 text-blue-600" />
                              ) : (
                                <ToggleLeft className="h-6 w-6 text-slate-400" />
                              )}
                            </button>
                          </div>
                          
                          {isEnabled && providerInfo.models.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <label className="block text-xs font-medium text-slate-700 mb-2">
                                Select AI Model:
                              </label>
                              <select
                                value={selectedModel || ''}
                                onChange={(e) => updateFormModelSelection(feature.key, e.target.value)}
                                className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a model...</option>
                                {providerInfo.models.map((model) => (
                                  <option key={model.id} value={model.id}>
                                    {model.name} - {model.pricing}
                                  </option>
                                ))}
                              </select>
                              {selectedModel && (
                                <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                                  <p className="font-medium text-slate-900">
                                    {providerInfo.models.find(m => m.id === selectedModel)?.name}
                                  </p>
                                  <p className="text-slate-600">
                                    {providerInfo.models.find(m => m.id === selectedModel)?.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!formData.provider || !formData.api_key}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Save className="h-5 w-5 mr-2" />
                Save API Key
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Your API Keys</h2>
        
        {apiKeys.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <Key className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No API Keys Added</h3>
            <p className="text-slate-600 mb-6">
              Add your first API key to enable AI-powered resume analysis and career insights
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First API Key
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {apiKeys.map((apiKey) => {
              const provider = getProviderInfo(apiKey.provider)
              const isVisible = visibleKeys.has(apiKey.id)
              const isEditing = editingKey === apiKey.id
              const isEditingSettings = editingSettings === apiKey.id
              const isEditingModels = editingModels === apiKey.id
              const isModelsExpanded = expandedModels.has(apiKey.id)

              return (
                <div
                  key={apiKey.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className={`h-2 bg-gradient-to-r ${provider.color} rounded-t-xl -mx-6 -mt-6 mb-6`}></div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${provider.color}`}>
                        <span className="text-2xl">{provider.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{provider.name}</h3>
                        <p className="text-sm text-slate-600">{provider.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Added {new Date(apiKey.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apiKey.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {Object.keys(apiKey.selected_models || {}).length > 0 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          <Brain className="h-3 w-3 inline mr-1" />
                          AI Models
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* API Key Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-sm font-medium text-slate-700">API Key:</span>
                        {isEditing ? (
                          <input
                            type="password"
                            defaultValue={apiKey.api_key}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateApiKey(apiKey.id, (e.target as HTMLInputElement).value)
                              } else if (e.key === 'Escape') {
                                setEditingKey(null)
                              }
                            }}
                          />
                        ) : (
                          <code className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-sm font-mono">
                            {isVisible ? apiKey.api_key : maskApiKey(apiKey.api_key)}
                          </code>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => {
                                const input = document.querySelector(`input[defaultValue="${apiKey.api_key}"]`) as HTMLInputElement
                                if (input) handleUpdateApiKey(apiKey.id, input.value)
                              }}
                              className="p-2 text-green-600 hover:text-green-700 transition-colors"
                              title="Save"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="p-2 text-slate-600 hover:text-slate-700 transition-colors"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="p-2 text-slate-600 hover:text-slate-700 transition-colors"
                              title={isVisible ? 'Hide' : 'Show'}
                            >
                              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setEditingKey(apiKey.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingSettings(apiKey.id)}
                              className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
                              title="Usage Settings"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingModels(apiKey.id)}
                              className="p-2 text-green-600 hover:text-green-700 transition-colors"
                              title="AI Models"
                            >
                              <Brain className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* AI Models Section */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-purple-600" />
                          AI Models Configuration
                        </h4>
                        <div className="flex items-center space-x-2">
                          {!isEditingModels && (
                            <button
                              onClick={() => setEditingModels(apiKey.id)}
                              className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
                            >
                              Edit Models
                            </button>
                          )}
                          <button
                            onClick={() => toggleModelsExpanded(apiKey.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {isModelsExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {isEditingModels ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3">
                            {usageFeatures.map((feature) => {
                              const isEnabled = apiKey.usage_settings[feature.key as keyof typeof apiKey.usage_settings]
                              const selectedModel = apiKey.selected_models?.[feature.key] || ''
                              
                              if (!isEnabled) return null
                              
                              return (
                                <div key={feature.key} className="p-3 border border-slate-200 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-900">{feature.label}</span>
                                  </div>
                                  <select
                                    value={selectedModel}
                                    onChange={(e) => {
                                      const newModels = {
                                        ...apiKey.selected_models,
                                        [feature.key]: e.target.value
                                      }
                                      handleUpdateSelectedModels(apiKey.id, newModels)
                                    }}
                                    className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  >
                                    <option value="">Select a model...</option>
                                    {provider.models.map((model) => (
                                      <option key={model.id} value={model.id}>
                                        {model.name} - {model.pricing}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingModels(null)}
                              className="px-3 py-1 text-sm text-slate-600 hover:text-slate-700 transition-colors"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {Object.keys(apiKey.selected_models || {}).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(apiKey.selected_models || {}).map(([feature, modelId]) => {
                                const featureInfo = usageFeatures.find(f => f.key === feature)
                                const modelInfo = provider.models.find(m => m.id === modelId)
                                
                                if (!featureInfo || !modelInfo) return null
                                
                                return (
                                  <div key={feature} className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                                    <span className="font-medium text-slate-700">{featureInfo.label}</span>
                                    <span className="text-purple-600">{modelInfo.name}</span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic">No AI models configured</p>
                          )}
                          
                          {isModelsExpanded && provider.models.length > 0 && (
                            <div className="mt-4 space-y-3">
                              <h5 className="text-sm font-medium text-slate-700">Available Models:</h5>
                              {provider.models.map((model) => (
                                <div key={model.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-medium text-slate-900">{model.name}</h6>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {model.pricing}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{model.description}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {model.capabilities.map((capability, index) => (
                                      <span key={index} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                                        {capability}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-xs text-slate-500">
                                    Context: {model.context_length} • Recommended for: {model.recommended_for.join(', ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Usage Settings */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-900">Feature Usage Settings</h4>
                        {!isEditingSettings && (
                          <button
                            onClick={() => setEditingSettings(apiKey.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Edit Settings
                          </button>
                        )}
                      </div>
                      
                      {isEditingSettings ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {usageFeatures.map((feature) => (
                              <div key={feature.key} className="flex items-center justify-between p-2 border border-slate-200 rounded">
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-slate-900">{feature.label}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSettings = {
                                      ...apiKey.usage_settings,
                                      [feature.key]: !apiKey.usage_settings[feature.key as keyof typeof apiKey.usage_settings]
                                    }
                                    handleUpdateUsageSettings(apiKey.id, newSettings)
                                  }}
                                >
                                  {apiKey.usage_settings[feature.key as keyof typeof apiKey.usage_settings] ? (
                                    <ToggleRight className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <ToggleLeft className="h-5 w-5 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingSettings(null)}
                              className="px-3 py-1 text-sm text-slate-600 hover:text-slate-700 transition-colors"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {usageFeatures.map((feature) => (
                            <span
                              key={feature.key}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                apiKey.usage_settings[feature.key as keyof typeof apiKey.usage_settings]
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {feature.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Enhancement Notice */}
      {apiKeys.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-purple-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">AI-Enhanced Analysis Active</h3>
              <p className="text-purple-800 text-sm mb-3">
                Your API keys enable advanced AI analysis with granular model selection and feature control to optimize costs and performance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-700 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Enhanced Features:</h4>
                  <ul className="space-y-1">
                    <li>• AI model selection per feature</li>
                    <li>• Advanced resume content extraction</li>
                    <li>• Real-time job market analysis</li>
                    <li>• Intelligent skill categorization</li>
                    <li>• Personalized career path analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Cost Optimization:</h4>
                  <ul className="space-y-1">
                    <li>• Model-specific feature activation</li>
                    <li>• Provider-specific usage control</li>
                    <li>• Only active features consume credits</li>
                    <li>• Real-time usage monitoring</li>
                    <li>• Performance vs. cost optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeysPage