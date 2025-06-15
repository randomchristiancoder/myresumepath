import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Trash2, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Settings,
  Brain,
  Search,
  Filter,
  Star,
  Zap,
  Globe,
  Lock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Info,
  Crown,
  Gift,
  Cpu,
  Database,
  Code,
  MessageSquare,
  Image,
  FileText,
  BarChart3,
  Target,
  Award,
  BookOpen,
  Users,
  Lightbulb,
  Rocket,
  Shield,
  ChevronDown,
  ChevronUp,
  X
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

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  capabilities: string[]
  pricing: 'free' | 'paid' | 'freemium'
  contextWindow: number
  category: 'text' | 'code' | 'multimodal' | 'embedding' | 'image'
  performance: 'basic' | 'good' | 'excellent'
  recommended?: boolean
  inputCost?: string
  outputCost?: string
}

interface GlobalAISettings {
  defaultModel: string
  fallbackModel: string
  useGlobalSettings: boolean
  featureModels: {
    resume_parsing: string
    job_matching: string
    course_recommendations: string
    personality_analysis: string
    skill_gap_analysis: string
    report_generation: string
  }
}

const ApiKeysPage: React.FC = () => {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [expandedApiKeys, setExpandedApiKeys] = useState<Record<string, boolean>>({})
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({})
  const [selectedPricing, setSelectedPricing] = useState<Record<string, string>>({})
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)
  const [globalSettings, setGlobalSettings] = useState<GlobalAISettings>({
    defaultModel: '',
    fallbackModel: '',
    useGlobalSettings: true,
    featureModels: {
      resume_parsing: '',
      job_matching: '',
      course_recommendations: '',
      personality_analysis: '',
      skill_gap_analysis: '',
      report_generation: ''
    }
  })

  const [newApiKey, setNewApiKey] = useState({
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

  // Comprehensive AI Models Database
  const aiModels: AIModel[] = [
    // OpenAI Models
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      description: 'Most advanced multimodal model with excellent reasoning capabilities',
      capabilities: ['Text Generation', 'Code', 'Analysis', 'Reasoning', 'Vision'],
      pricing: 'paid',
      contextWindow: 128000,
      category: 'multimodal',
      performance: 'excellent',
      recommended: true,
      inputCost: '$5.00/1M tokens',
      outputCost: '$15.00/1M tokens'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      description: 'Fast and capable model for complex tasks',
      capabilities: ['Text Generation', 'Code', 'Analysis', 'Reasoning'],
      pricing: 'paid',
      contextWindow: 128000,
      category: 'text',
      performance: 'excellent',
      inputCost: '$10.00/1M tokens',
      outputCost: '$30.00/1M tokens'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Fast and efficient model for most tasks',
      capabilities: ['Text Generation', 'Code', 'Analysis'],
      pricing: 'paid',
      contextWindow: 16385,
      category: 'text',
      performance: 'good',
      inputCost: '$0.50/1M tokens',
      outputCost: '$1.50/1M tokens'
    },

    // Anthropic Models
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      description: 'Most powerful Claude model for complex reasoning',
      capabilities: ['Text Generation', 'Analysis', 'Reasoning', 'Code'],
      pricing: 'paid',
      contextWindow: 200000,
      category: 'text',
      performance: 'excellent',
      recommended: true,
      inputCost: '$15.00/1M tokens',
      outputCost: '$75.00/1M tokens'
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      description: 'Balanced performance and speed',
      capabilities: ['Text Generation', 'Analysis', 'Code'],
      pricing: 'paid',
      contextWindow: 200000,
      category: 'text',
      performance: 'excellent',
      inputCost: '$3.00/1M tokens',
      outputCost: '$15.00/1M tokens'
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      description: 'Fast and efficient for quick tasks',
      capabilities: ['Text Generation', 'Analysis'],
      pricing: 'paid',
      contextWindow: 200000,
      category: 'text',
      performance: 'good',
      inputCost: '$0.25/1M tokens',
      outputCost: '$1.25/1M tokens'
    },

    // Google Models
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      description: 'Google\'s most capable multimodal model',
      capabilities: ['Text Generation', 'Code', 'Analysis', 'Vision'],
      pricing: 'freemium',
      contextWindow: 32768,
      category: 'multimodal',
      performance: 'excellent',
      inputCost: 'Free tier available',
      outputCost: '$0.50/1M tokens'
    },
    {
      id: 'gemini-pro-vision',
      name: 'Gemini Pro Vision',
      provider: 'google',
      description: 'Specialized for image and text understanding',
      capabilities: ['Vision', 'Text Generation', 'Analysis'],
      pricing: 'freemium',
      contextWindow: 16384,
      category: 'multimodal',
      performance: 'excellent',
      inputCost: 'Free tier available',
      outputCost: '$0.50/1M tokens'
    },

    // OpenRouter Models (Free)
    {
      id: 'mistralai/mistral-7b-instruct:free',
      name: 'Mistral 7B Instruct (Free)',
      provider: 'openrouter',
      description: 'Free high-quality instruction-following model',
      capabilities: ['Text Generation', 'Analysis', 'Code'],
      pricing: 'free',
      contextWindow: 32768,
      category: 'text',
      performance: 'good',
      recommended: true,
      inputCost: 'FREE',
      outputCost: 'FREE'
    },
    {
      id: 'microsoft/phi-3-mini-128k-instruct:free',
      name: 'Phi-3 Mini (Free)',
      provider: 'openrouter',
      description: 'Microsoft\'s efficient small model',
      capabilities: ['Text Generation', 'Code', 'Analysis'],
      pricing: 'free',
      contextWindow: 128000,
      category: 'text',
      performance: 'good',
      inputCost: 'FREE',
      outputCost: 'FREE'
    },
    {
      id: 'google/gemma-7b-it:free',
      name: 'Gemma 7B IT (Free)',
      provider: 'openrouter',
      description: 'Google\'s open-source instruction-tuned model',
      capabilities: ['Text Generation', 'Analysis'],
      pricing: 'free',
      contextWindow: 8192,
      category: 'text',
      performance: 'good',
      inputCost: 'FREE',
      outputCost: 'FREE'
    },
    {
      id: 'meta-llama/llama-3-8b-instruct:free',
      name: 'Llama 3 8B Instruct (Free)',
      provider: 'openrouter',
      description: 'Meta\'s latest open-source model',
      capabilities: ['Text Generation', 'Code', 'Analysis'],
      pricing: 'free',
      contextWindow: 8192,
      category: 'text',
      performance: 'good',
      inputCost: 'FREE',
      outputCost: 'FREE'
    },
    {
      id: 'openchat/openchat-7b:free',
      name: 'OpenChat 7B (Free)',
      provider: 'openrouter',
      description: 'High-performance open-source chat model',
      capabilities: ['Text Generation', 'Conversation', 'Analysis'],
      pricing: 'free',
      contextWindow: 8192,
      category: 'text',
      performance: 'good',
      inputCost: 'FREE',
      outputCost: 'FREE'
    },
    {
      id: 'nousresearch/nous-capybara-7b:free',
      name: 'Nous Capybara 7B (Free)',
      provider: 'openrouter',
      description: 'Fine-tuned model for instruction following',
      capabilities: ['Text Generation', 'Analysis', 'Code'],
      pricing: 'free',
      contextWindow: 4096,
      category: 'text',
      performance: 'good',
      inputCost: 'FREE',
      outputCost: 'FREE'
    },

    // Cohere Models
    {
      id: 'command-r-plus',
      name: 'Command R+',
      provider: 'cohere',
      description: 'Advanced model for complex reasoning and analysis',
      capabilities: ['Text Generation', 'Analysis', 'RAG'],
      pricing: 'paid',
      contextWindow: 128000,
      category: 'text',
      performance: 'excellent',
      inputCost: '$3.00/1M tokens',
      outputCost: '$15.00/1M tokens'
    },
    {
      id: 'command-r',
      name: 'Command R',
      provider: 'cohere',
      description: 'Efficient model for retrieval-augmented generation',
      capabilities: ['Text Generation', 'RAG', 'Analysis'],
      pricing: 'paid',
      contextWindow: 128000,
      category: 'text',
      performance: 'good',
      inputCost: '$0.50/1M tokens',
      outputCost: '$1.50/1M tokens'
    },

    // Hugging Face Models (Free)
    {
      id: 'microsoft/DialoGPT-medium',
      name: 'DialoGPT Medium (Free)',
      provider: 'huggingface',
      description: 'Conversational AI model',
      capabilities: ['Conversation', 'Text Generation'],
      pricing: 'free',
      contextWindow: 1024,
      category: 'text',
      performance: 'basic',
      inputCost: 'FREE',
      outputCost: 'FREE'
    },
    {
      id: 'facebook/blenderbot-400M-distill',
      name: 'BlenderBot 400M (Free)',
      provider: 'huggingface',
      description: 'Open-domain chatbot',
      capabilities: ['Conversation', 'Text Generation'],
      pricing: 'free',
      contextWindow: 512,
      category: 'text',
      performance: 'basic',
      inputCost: 'FREE',
      outputCost: 'FREE'
    },

    // Replicate Models
    {
      id: 'meta/llama-2-70b-chat',
      name: 'Llama 2 70B Chat',
      provider: 'replicate',
      description: 'Large language model for chat applications',
      capabilities: ['Text Generation', 'Conversation', 'Code'],
      pricing: 'paid',
      contextWindow: 4096,
      category: 'text',
      performance: 'excellent',
      inputCost: '$0.65/1M tokens',
      outputCost: '$2.75/1M tokens'
    },

    // Perplexity Models
    {
      id: 'llama-3-sonar-large-32k-online',
      name: 'Llama 3 Sonar Large',
      provider: 'perplexity',
      description: 'Search-augmented language model',
      capabilities: ['Text Generation', 'Search', 'Analysis'],
      pricing: 'paid',
      contextWindow: 32768,
      category: 'text',
      performance: 'excellent',
      inputCost: '$1.00/1M tokens',
      outputCost: '$1.00/1M tokens'
    }
  ]

  const providers = [
    { 
      id: 'openai', 
      name: 'OpenAI', 
      icon: Brain,
      description: 'GPT models for advanced AI capabilities',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'openrouter', 
      name: 'OpenRouter', 
      icon: Globe,
      description: 'Access to multiple AI models through a single API',
      color: 'from-purple-500 to-violet-500'
    },
    { 
      id: 'anthropic', 
      name: 'Anthropic', 
      icon: Shield,
      description: 'Claude models focused on safety and helpfulness',
      color: 'from-orange-500 to-red-500'
    },
    { 
      id: 'google', 
      name: 'Google', 
      icon: Sparkles,
      description: 'Gemini models with multimodal capabilities',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'cohere', 
      name: 'Cohere', 
      icon: Cpu,
      description: 'Enterprise-focused language models',
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      id: 'huggingface', 
      name: 'Hugging Face', 
      icon: Star,
      description: 'Open-source models and transformers',
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      id: 'replicate', 
      name: 'Replicate', 
      icon: Rocket,
      description: 'Run machine learning models in the cloud',
      color: 'from-pink-500 to-rose-500'
    },
    { 
      id: 'perplexity', 
      name: 'Perplexity', 
      icon: Search,
      description: 'AI-powered search and research',
      color: 'from-teal-500 to-green-500'
    }
  ]

  const featureLabels = {
    resume_parsing: { label: 'Resume Parsing', icon: FileText, description: 'Extract and analyze resume content' },
    job_matching: { label: 'Job Matching', icon: Target, description: 'Find relevant job opportunities' },
    course_recommendations: { label: 'Course Recommendations', icon: BookOpen, description: 'Suggest learning paths' },
    personality_analysis: { label: 'Personality Analysis', icon: Users, description: 'Assess personality traits' },
    skill_gap_analysis: { label: 'Skill Gap Analysis', icon: BarChart3, description: 'Identify missing skills' },
    report_generation: { label: 'Report Generation', icon: Award, description: 'Generate comprehensive reports' }
  }

  useEffect(() => {
    loadApiKeys()
    loadGlobalSettings()
  }, [user])

  const loadApiKeys = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApiKeys(data || [])
    } catch (err: any) {
      setError('Failed to load API keys')
      console.error('Error loading API keys:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGlobalSettings = () => {
    const saved = localStorage.getItem('globalAISettings')
    if (saved) {
      setGlobalSettings(JSON.parse(saved))
    }
  }

  const saveGlobalSettings = () => {
    localStorage.setItem('globalAISettings', JSON.stringify(globalSettings))
    setSuccess('Global AI settings saved successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const saveApiKey = async () => {
    if (!user || !newApiKey.provider || !newApiKey.api_key) {
      setError('Please fill in all required fields')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          provider: newApiKey.provider,
          api_key: newApiKey.api_key,
          usage_settings: newApiKey.usage_settings
        })

      if (error) throw error

      setSuccess('API key added successfully!')
      setNewApiKey({
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
      await loadApiKeys()
    } catch (err: any) {
      setError(err.message || 'Failed to save API key')
    } finally {
      setSaving(false)
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      setSuccess('API key deleted successfully!')
      await loadApiKeys()
    } catch (err: any) {
      setError('Failed to delete API key')
    }
  }

  const updateUsageSettings = async (id: string, settings: any) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ usage_settings: settings })
        .eq('id', id)

      if (error) throw error

      setSuccess('Usage settings updated!')
      await loadApiKeys()
    } catch (err: any) {
      setError('Failed to update settings')
    }
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const toggleApiKeyExpansion = (id: string) => {
    setExpandedApiKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getProviderInfo = (providerId: string) => {
    return providers.find(p => p.id === providerId) || { 
      name: providerId, 
      icon: Key, 
      description: 'AI Provider',
      color: 'from-slate-500 to-slate-600'
    }
  }

  const getModelsForProvider = (providerId: string) => {
    return aiModels.filter(model => model.provider === providerId)
  }

  const getFilteredModels = (providerId: string) => {
    const models = getModelsForProvider(providerId)
    const searchTerm = searchTerms[providerId] || ''
    const category = selectedCategories[providerId] || 'all'
    const pricing = selectedPricing[providerId] || 'all'

    return models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = category === 'all' || model.category === category
      const matchesPricing = pricing === 'all' || model.pricing === pricing
      
      return matchesSearch && matchesCategory && matchesPricing
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'text': return MessageSquare
      case 'code': return Code
      case 'multimodal': return Image
      case 'embedding': return Database
      case 'image': return Image
      default: return Brain
    }
  }

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'text-green-600 bg-green-100'
      case 'paid': return 'text-blue-600 bg-blue-100'
      case 'freemium': return 'text-purple-600 bg-purple-100'
      default: return 'text-slate-600 bg-slate-100'
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
          <h1 className="text-3xl font-bold text-slate-900">AI Configuration</h1>
          <p className="text-slate-600 mt-2">
            Manage your AI API keys and explore available models for each provider
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add API Key
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-3" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-3" />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Global AI Settings */}
      {showGlobalSettings && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Brain className="h-6 w-6 mr-3 text-purple-600" />
              Global AI Model Configuration
            </h2>
            <button
              onClick={() => setShowGlobalSettings(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                id="useGlobalSettings"
                checked={globalSettings.useGlobalSettings}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  useGlobalSettings: e.target.checked
                }))}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="useGlobalSettings" className="text-purple-900 font-medium">
                Use global model settings for all features
              </label>
              <Info className="h-4 w-4 text-purple-600" />
            </div>

            {globalSettings.useGlobalSettings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Model
                  </label>
                  <select
                    value={globalSettings.defaultModel}
                    onChange={(e) => setGlobalSettings(prev => ({
                      ...prev,
                      defaultModel: e.target.value
                    }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select default model...</option>
                    {aiModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                        {model.pricing === 'free' && ' - FREE'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fallback Model
                  </label>
                  <select
                    value={globalSettings.fallbackModel}
                    onChange={(e) => setGlobalSettings(prev => ({
                      ...prev,
                      fallbackModel: e.target.value
                    }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select fallback model...</option>
                    {aiModels.filter(model => model.pricing === 'free').map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider}) - FREE
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Feature-Specific Models</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(featureLabels).map(([key, feature]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                        <feature.icon className="h-4 w-4 mr-2" />
                        {feature.label}
                      </label>
                      <select
                        value={globalSettings.featureModels[key as keyof typeof globalSettings.featureModels]}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          featureModels: {
                            ...prev.featureModels,
                            [key]: e.target.value
                          }
                        }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select model...</option>
                        {aiModels.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name} ({model.provider})
                            {model.pricing === 'free' && ' - FREE'}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={saveGlobalSettings}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Global Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <Key className="h-6 w-6 mr-3 text-blue-600" />
          Your API Keys ({apiKeys.length})
        </h2>

        {apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No API keys configured</h3>
            <p className="text-slate-600 mb-6">Add your first API key to start using AI features</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First API Key
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {apiKeys.map((apiKey) => {
              const providerInfo = getProviderInfo(apiKey.provider)
              const IconComponent = providerInfo.icon
              const isExpanded = expandedApiKeys[apiKey.id]
              const filteredModels = getFilteredModels(apiKey.provider)
              const freeModels = filteredModels.filter(model => model.pricing === 'free')
              const paidModels = filteredModels.filter(model => model.pricing !== 'free')
              
              return (
                <div key={apiKey.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* API Key Header */}
                  <div className="p-6 bg-slate-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${providerInfo.color}`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{providerInfo.name}</h3>
                          <p className="text-slate-600 text-sm">{providerInfo.description}</p>
                          <p className="text-slate-500 text-xs mt-1">
                            Added {new Date(apiKey.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Active
                        </span>
                        <button
                          onClick={() => toggleApiKeyExpansion(apiKey.id)}
                          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => deleteApiKey(apiKey.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type={showPasswords[apiKey.id] ? 'text' : 'password'}
                          value={apiKey.api_key}
                          readOnly
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-mono text-sm"
                        />
                        <button
                          onClick={() => togglePasswordVisibility(apiKey.id)}
                          className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          {showPasswords[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Feature Usage Settings</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(featureLabels).map(([key, feature]) => (
                          <label key={key} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={apiKey.usage_settings[key as keyof typeof apiKey.usage_settings]}
                              onChange={(e) => {
                                const newSettings = {
                                  ...apiKey.usage_settings,
                                  [key]: e.target.checked
                                }
                                updateUsageSettings(apiKey.id, newSettings)
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <feature.icon className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-700">{feature.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Models Browser */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-semibold text-slate-900 flex items-center">
                          <Brain className="h-5 w-5 mr-2 text-purple-600" />
                          Available AI Models
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {filteredModels.length} models
                          </span>
                          {freeModels.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {freeModels.length} FREE
                            </span>
                          )}
                        </h4>
                      </div>

                      {/* Search and Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search models..."
                            value={searchTerms[apiKey.provider] || ''}
                            onChange={(e) => setSearchTerms(prev => ({
                              ...prev,
                              [apiKey.provider]: e.target.value
                            }))}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <select
                          value={selectedCategories[apiKey.provider] || 'all'}
                          onChange={(e) => setSelectedCategories(prev => ({
                            ...prev,
                            [apiKey.provider]: e.target.value
                          }))}
                          className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Categories</option>
                          <option value="text">Text Generation</option>
                          <option value="code">Code Generation</option>
                          <option value="multimodal">Multimodal</option>
                          <option value="embedding">Embeddings</option>
                          <option value="image">Image Generation</option>
                        </select>

                        <select
                          value={selectedPricing[apiKey.provider] || 'all'}
                          onChange={(e) => setSelectedPricing(prev => ({
                            ...prev,
                            [apiKey.provider]: e.target.value
                          }))}
                          className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Pricing</option>
                          <option value="free">Free Only</option>
                          <option value="paid">Paid Only</option>
                          <option value="freemium">Freemium</option>
                        </select>
                      </div>

                      {/* Free Models Section */}
                      {freeModels.length > 0 && (
                        <div className="mb-8">
                          <div className="flex items-center mb-4">
                            <Gift className="h-5 w-5 text-green-600 mr-2" />
                            <h5 className="text-lg font-semibold text-green-900">Free Models</h5>
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {freeModels.length} available
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {freeModels.map(model => {
                              const CategoryIcon = getCategoryIcon(model.category)
                              
                              return (
                                <div key={model.id} className="border border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <CategoryIcon className="h-5 w-5 text-green-600" />
                                      <h6 className="font-semibold text-slate-900">{model.name}</h6>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
                                        FREE
                                      </span>
                                      {model.recommended && (
                                        <Crown className="h-4 w-4 text-yellow-500" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-slate-600 text-sm mb-3">{model.description}</p>
                                  
                                  <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-500">Context:</span>
                                      <span className="font-medium text-slate-700">{model.contextWindow.toLocaleString()} tokens</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-500">Performance:</span>
                                      <span className={`font-medium ${getPerformanceColor(model.performance)}`}>
                                        {model.performance}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-500">Cost:</span>
                                      <span className="font-bold text-green-600">FREE</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {model.capabilities.slice(0, 3).map(cap => (
                                      <span key={cap} className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">
                                        {cap}
                                      </span>
                                    ))}
                                    {model.capabilities.length > 3 && (
                                      <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                                        +{model.capabilities.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                  
                                  <button className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Use This Model
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Paid Models Section */}
                      {paidModels.length > 0 && (
                        <div>
                          <div className="flex items-center mb-4">
                            <Crown className="h-5 w-5 text-blue-600 mr-2" />
                            <h5 className="text-lg font-semibold text-blue-900">Premium Models</h5>
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {paidModels.length} available
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paidModels.map(model => {
                              const CategoryIcon = getCategoryIcon(model.category)
                              
                              return (
                                <div key={model.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <CategoryIcon className="h-5 w-5 text-blue-600" />
                                      <h6 className="font-semibold text-slate-900">{model.name}</h6>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPricingColor(model.pricing)}`}>
                                        {model.pricing.toUpperCase()}
                                      </span>
                                      {model.recommended && (
                                        <Crown className="h-4 w-4 text-yellow-500" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-slate-600 text-sm mb-3">{model.description}</p>
                                  
                                  <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-500">Context:</span>
                                      <span className="font-medium text-slate-700">{model.contextWindow.toLocaleString()} tokens</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-500">Performance:</span>
                                      <span className={`font-medium ${getPerformanceColor(model.performance)}`}>
                                        {model.performance}
                                      </span>
                                    </div>
                                    {model.inputCost && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Input Cost:</span>
                                        <span className="font-medium text-slate-700">{model.inputCost}</span>
                                      </div>
                                    )}
                                    {model.outputCost && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Output Cost:</span>
                                        <span className="font-medium text-slate-700">{model.outputCost}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {model.capabilities.slice(0, 3).map(cap => (
                                      <span key={cap} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                                        {cap}
                                      </span>
                                    ))}
                                    {model.capabilities.length > 3 && (
                                      <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                                        +{model.capabilities.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                  
                                  <button className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Use This Model
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {filteredModels.length === 0 && (
                        <div className="text-center py-12">
                          <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No models found</h3>
                          <p className="text-slate-600">Try adjusting your search criteria</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add API Key Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Add New API Key</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">AI Provider</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {providers.map((provider) => {
                    const IconComponent = provider.icon
                    return (
                      <button
                        key={provider.id}
                        onClick={() => setNewApiKey(prev => ({ ...prev, provider: provider.id }))}
                        className={`p-4 border-2 rounded-xl transition-all duration-200 text-left ${
                          newApiKey.provider === provider.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${provider.color}`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{provider.name}</h3>
                            <p className="text-slate-600 text-sm">{provider.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={newApiKey.api_key}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Enter your API key..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Enable for Features</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(featureLabels).map(([key, feature]) => (
                    <label key={key} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newApiKey.usage_settings[key as keyof typeof newApiKey.usage_settings]}
                        onChange={(e) => setNewApiKey(prev => ({
                          ...prev,
                          usage_settings: {
                            ...prev.usage_settings,
                            [key]: e.target.checked
                          }
                        }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <feature.icon className="h-5 w-5 text-slate-500" />
                      <div>
                        <span className="text-sm font-medium text-slate-900">{feature.label}</span>
                        <p className="text-xs text-slate-600">{feature.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveApiKey}
                disabled={saving || !newApiKey.provider || !newApiKey.api_key}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save API Key
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeysPage