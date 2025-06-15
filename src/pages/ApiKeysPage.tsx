import React, { useState } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import ApiKeyManager from '../components/ApiKeyManager'
import { 
  Key, 
  Brain, 
  Shield, 
  Globe, 
  Star, 
  Zap, 
  Cpu, 
  Code, 
  MessageSquare, 
  Search,
  Settings,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Plus,
  Crown,
  Gift,
  ExternalLink
} from 'lucide-react'

const ApiKeysPage: React.FC = () => {
  const { apiKeys, clearAllKeys, globalSettings, updateGlobalSettings } = useSettingsStore()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)

  const handleSuccess = (message: string) => {
    setSuccess(message)
    setError(null)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleError = (message: string) => {
    setError(message)
    setSuccess(null)
    setTimeout(() => setError(null), 3000)
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all API keys? This action cannot be undone.')) {
      clearAllKeys()
      handleSuccess('All API keys cleared successfully!')
    }
  }

  const configuredProviders = apiKeys.map(key => key.provider)
  const totalModelsAvailable = apiKeys.length * 10 // Rough estimate

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Provider Configuration</h1>
          <p className="text-slate-600 mt-2">
            Configure your AI provider API keys and select models for different features
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
          {apiKeys.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </button>
          )}
        </div>
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

      {/* Global Settings */}
      {showGlobalSettings && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Settings className="h-6 w-6 mr-3 text-purple-600" />
              Global AI Configuration
            </h2>
            <button
              onClick={() => setShowGlobalSettings(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                id="useGlobalSettings"
                checked={globalSettings.useGlobalSettings}
                onChange={(e) => updateGlobalSettings({ useGlobalSettings: e.target.checked })}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="useGlobalSettings" className="text-purple-900 font-medium">
                Use global model settings for all features
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Default Provider
                </label>
                <select
                  value={globalSettings.defaultProvider}
                  onChange={(e) => updateGlobalSettings({ defaultProvider: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="openrouter">OpenRouter</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="cohere">Cohere</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fallback Model
                </label>
                <select
                  value={globalSettings.fallbackModel}
                  onChange={(e) => updateGlobalSettings({ fallbackModel: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (Free)</option>
                  <option value="deepseek/deepseek-r1:free">DeepSeek R1 (Free)</option>
                  <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</option>
                  <option value="microsoft/phi-3-mini-128k-instruct:free">Phi-3 Mini (Free)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Configured Providers</p>
              <p className="text-3xl font-bold text-slate-900">{apiKeys.length}</p>
            </div>
            <Key className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Available Models</p>
              <p className="text-3xl font-bold text-slate-900">{totalModelsAvailable}+</p>
            </div>
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Free Models</p>
              <p className="text-3xl font-bold text-slate-900">15+</p>
            </div>
            <Gift className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Premium Models</p>
              <p className="text-3xl font-bold text-slate-900">50+</p>
            </div>
            <Crown className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Unified Provider Configuration */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Provider Configuration</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Shield className="h-4 w-4" />
            <span>Stored locally and securely</span>
          </div>
        </div>

        <ApiKeyManager
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>

      {/* Getting Started */}
      {apiKeys.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Key className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Get Started with AI</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Configure your first API key to unlock AI-powered features. We recommend starting with 
              OpenRouter for access to multiple models including free options like DeepSeek R1.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <Gift className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-slate-900 mb-1">Free Models</h4>
                <p className="text-slate-600 text-sm">Start with free models like DeepSeek R1, Llama 3.2, and Mistral 7B</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-slate-900 mb-1">Secure Storage</h4>
                <p className="text-slate-600 text-sm">Keys stored locally in your browser, never on our servers</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-slate-900 mb-1">Instant Setup</h4>
                <p className="text-slate-600 text-sm">Configure once and use across all platform features</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeysPage