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
  ToggleRight
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
}

const ApiKeysPage: React.FC = () => {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingSettings, setEditingSettings] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
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
    }
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
      features: ['Resume Parsing', 'Job Matching', 'Personality Analysis', 'Course Recommendations']
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Access to multiple AI models through a single API',
      icon: '🔀',
      color: 'from-purple-500 to-violet-500',
      placeholder: 'sk-or-...',
      website: 'https://openrouter.ai/keys',
      features: ['Resume Parsing', 'Job Matching', 'Personality Analysis']
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude models for sophisticated reasoning and analysis',
      icon: '🧠',
      color: 'from-orange-500 to-red-500',
      placeholder: 'sk-ant-...',
      website: 'https://console.anthropic.com/',
      features: ['Resume Parsing', 'Personality Analysis', 'Report Generation']
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Real-time web search and analysis for up-to-date career insights',
      icon: '🔍',
      color: 'from-cyan-500 to-blue-500',
      placeholder: 'pplx-...',
      website: 'https://www.perplexity.ai/settings/api',
      features: ['Job Matching', 'Course Recommendations', 'Skill Gap Analysis']
    },
    {
      id: 'google',
      name: 'Google AI',
      description: 'Gemini and PaLM models for multimodal AI capabilities',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500',
      placeholder: 'AIza...',
      website: 'https://makersuite.google.com/app/apikey',
      features: ['Resume Parsing', 'Job Matching', 'Course Recommendations']
    },
    {
      id: 'cohere',
      name: 'Cohere',
      description: 'Enterprise-grade language models for text understanding',
      icon: '⚡',
      color: 'from-indigo-500 to-purple-500',
      placeholder: 'co-...',
      website: 'https://dashboard.cohere.ai/api-keys',
      features: ['Resume Parsing', 'Personality Analysis']
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      description: 'Access to thousands of open-source models',
      icon: '🤗',
      color: 'from-yellow-500 to-orange-500',
      placeholder: 'hf_...',
      website: 'https://huggingface.co/settings/tokens',
      features: ['Resume Parsing', 'Skill Gap Analysis']
    },
    {
      id: 'replicate',
      name: 'Replicate',
      description: 'Run machine learning models in the cloud',
      icon: '🔄',
      color: 'from-pink-500 to-rose-500',
      placeholder: 'r8_...',
      website: 'https://replicate.com/account/api-tokens',
      features: ['Resume Parsing', 'Report Generation']
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
      setApiKeys(data || [])
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setError('Failed to load API keys')
    } finally {
      setLoading(false)
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
        }
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
      features: []
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
            Manage your AI provider API keys with granular control over feature usage
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
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Security & Privacy</h3>
            <p className="text-blue-800 text-sm mb-3">
              Your API keys are encrypted and stored securely. You can control exactly which features use each API key to optimize costs and usage.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Keys are encrypted at rest using industry-standard encryption</li>
              <li>• Granular control over which features use which APIs</li>
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
                    onClick={() => setFormData({ ...formData, provider: provider.id })}
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
                    <div className="flex flex-wrap gap-1">
                      {provider.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {provider.features.length > 3 && (
                        <span className="text-xs text-slate-500">+{provider.features.length - 3} more</span>
                      )}
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
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder={getProviderInfo(formData.provider).placeholder}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
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
                    Feature Usage Settings
                  </label>
                  <p className="text-sm text-slate-600 mb-4">
                    Choose which features can use this API key. Only enabled features will consume API credits.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usageFeatures.map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-slate-900">{feature.label}</h4>
                          <p className="text-xs text-slate-600">{feature.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateFormUsageSetting(feature.key, !formData.usage_settings[feature.key as keyof typeof formData.usage_settings])}
                          className="ml-3"
                        >
                          {formData.usage_settings[feature.key as keyof typeof formData.usage_settings] ? (
                            <ToggleRight className="h-6 w-6 text-blue-600" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-400" />
                          )}
                        </button>
                      </div>
                    ))}
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

              return (
                <div
                  key={apiKey.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
                >
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

                    {/* Usage Settings */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-slate-900">Feature Usage Settings</h4>
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
            <Zap className="h-6 w-6 text-purple-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">AI-Enhanced Analysis Active</h3>
              <p className="text-purple-800 text-sm mb-3">
                Your API keys enable advanced AI analysis with granular control over feature usage to optimize costs and performance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-700 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Enhanced Features:</h4>
                  <ul className="space-y-1">
                    <li>• Advanced resume content extraction</li>
                    <li>• Real-time job market analysis (Perplexity)</li>
                    <li>• Intelligent skill categorization</li>
                    <li>• Personalized career path analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Cost Optimization:</h4>
                  <ul className="space-y-1">
                    <li>• Selective feature activation</li>
                    <li>• Provider-specific usage control</li>
                    <li>• Only active features consume credits</li>
                    <li>• Real-time usage monitoring</li>
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