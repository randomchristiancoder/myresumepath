import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ApiKeyConfig {
  id: string
  provider: string
  apiKey: string
  selectedModel: string
  isActive: boolean
  createdAt: string
  lastUsed?: string
}

interface SettingsState {
  apiKeys: ApiKeyConfig[]
  globalSettings: {
    defaultProvider: string
    fallbackModel: string
    useGlobalSettings: boolean
  }
  // Actions
  addApiKey: (provider: string, apiKey: string, selectedModel?: string) => void
  updateApiKey: (id: string, updates: Partial<ApiKeyConfig>) => void
  deleteApiKey: (id: string) => void
  getApiKey: (provider: string) => ApiKeyConfig | undefined
  setSelectedModel: (id: string, model: string) => void
  updateGlobalSettings: (settings: Partial<SettingsState['globalSettings']>) => void
  clearAllKeys: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKeys: [],
      globalSettings: {
        defaultProvider: 'openrouter',
        fallbackModel: 'meta-llama/llama-3.2-3b-instruct:free',
        useGlobalSettings: false
      },

      addApiKey: (provider: string, apiKey: string, selectedModel?: string) => {
        const newKey: ApiKeyConfig = {
          id: `${provider}-${Date.now()}`,
          provider,
          apiKey,
          selectedModel: selectedModel || '',
          isActive: true,
          createdAt: new Date().toISOString()
        }

        set((state) => ({
          apiKeys: [...state.apiKeys.filter(key => key.provider !== provider), newKey]
        }))
      },

      updateApiKey: (id: string, updates: Partial<ApiKeyConfig>) => {
        set((state) => ({
          apiKeys: state.apiKeys.map(key =>
            key.id === id ? { ...key, ...updates, lastUsed: new Date().toISOString() } : key
          )
        }))
      },

      deleteApiKey: (id: string) => {
        set((state) => ({
          apiKeys: state.apiKeys.filter(key => key.id !== id)
        }))
      },

      getApiKey: (provider: string) => {
        return get().apiKeys.find(key => key.provider === provider && key.isActive)
      },

      setSelectedModel: (id: string, model: string) => {
        get().updateApiKey(id, { selectedModel: model })
      },

      updateGlobalSettings: (settings: Partial<SettingsState['globalSettings']>) => {
        set((state) => ({
          globalSettings: { ...state.globalSettings, ...settings }
        }))
      },

      clearAllKeys: () => {
        set({ apiKeys: [] })
      }
    }),
    {
      name: 'api-settings-storage',
      version: 1
    }
  )
)