import React, { useState, useEffect } from 'react'
import { 
  Eye, 
  EyeOff, 
  Type, 
  Contrast, 
  Volume2, 
  VolumeX,
  Keyboard,
  MousePointer,
  Settings,
  Sun,
  Moon,
  Minus,
  Plus,
  RotateCcw,
  Accessibility,
  X
} from 'lucide-react'

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  darkMode: boolean
  fontSize: number
  soundEnabled: boolean
}

const AccessibilityFeatures: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    darkMode: false,
    fontSize: 16,
    soundEnabled: true
  })

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      applySettings(parsed)
    }

    // Check for system preferences
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersDark && !savedSettings) {
      updateSetting('darkMode', true)
    }
    if (prefersReducedMotion && !savedSettings) {
      updateSetting('reducedMotion', true)
    }
  }, [])

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings))
    applySettings(newSettings)
  }

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Dark mode
    if (settings.darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Font size
    root.style.fontSize = `${settings.fontSize}px`

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation')
    } else {
      root.classList.remove('keyboard-navigation')
    }
  }

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      darkMode: false,
      fontSize: 16,
      soundEnabled: true
    }
    setSettings(defaultSettings)
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings))
    applySettings(defaultSettings)
  }

  const announceToScreenReader = (message: string) => {
    if (settings.screenReader) {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = message
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 1000)
    }
  }

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    updateSetting(key, value)
    announceToScreenReader(`${key} ${value ? 'enabled' : 'disabled'}`)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Accessibility className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Accessibility className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Accessibility Settings</h1>
                <p className="text-purple-100 text-sm">Customize your experience</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-purple-200 transition-colors"
              aria-label="Close accessibility settings"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Visual Settings */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-purple-600" />
              Visual Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Contrast className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">High Contrast</p>
                    <p className="text-sm text-slate-600">Increase contrast for better visibility</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('highContrast', !settings.highContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.highContrast ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                  aria-label={`${settings.highContrast ? 'Disable' : 'Enable'} high contrast`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Type className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">Large Text</p>
                    <p className="text-sm text-slate-600">Increase text size for better readability</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('largeText', !settings.largeText)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.largeText ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                  aria-label={`${settings.largeText ? 'Disable' : 'Enable'} large text`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.largeText ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {settings.darkMode ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-slate-600" />}
                  <div>
                    <p className="font-medium text-slate-900">Dark Mode</p>
                    <p className="text-sm text-slate-600">Reduce eye strain in low light</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                  aria-label={`${settings.darkMode ? 'Disable' : 'Enable'} dark mode`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size Control */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Type className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">Font Size</p>
                      <p className="text-sm text-slate-600">Adjust text size: {settings.fontSize}px</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleSettingChange('fontSize', Math.max(12, settings.fontSize - 2))}
                    className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    aria-label="Decrease font size"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((settings.fontSize - 12) / (24 - 12)) * 100}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('fontSize', Math.min(24, settings.fontSize + 2))}
                    className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    aria-label="Increase font size"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Motion & Animation */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <MousePointer className="h-5 w-5 mr-2 text-purple-600" />
              Motion & Animation
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">Reduced Motion</p>
                    <p className="text-sm text-slate-600">Minimize animations and transitions</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('reducedMotion', !settings.reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                  aria-label={`${settings.reducedMotion ? 'Disable' : 'Enable'} reduced motion`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation & Input */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Keyboard className="h-5 w-5 mr-2 text-purple-600" />
              Navigation & Input
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Keyboard className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">Keyboard Navigation</p>
                    <p className="text-sm text-slate-600">Enhanced keyboard focus indicators</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('keyboardNavigation', !settings.keyboardNavigation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.keyboardNavigation ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                  aria-label={`${settings.keyboardNavigation ? 'Disable' : 'Enable'} keyboard navigation`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {settings.soundEnabled ? <Volume2 className="h-5 w-5 text-slate-600" /> : <VolumeX className="h-5 w-5 text-slate-600" />}
                  <div>
                    <p className="font-medium text-slate-900">Sound Feedback</p>
                    <p className="text-sm text-slate-600">Audio cues for interactions</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                  aria-label={`${settings.soundEnabled ? 'Disable' : 'Enable'} sound feedback`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Screen Reader Support */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Volume2 className="h-5 w-5 mr-2 text-purple-600" />
              Screen Reader Support
            </h2>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Volume2 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Screen Reader Optimized</p>
                  <p className="text-sm text-blue-800 mb-3">
                    This application is fully compatible with screen readers including NVDA, JAWS, and VoiceOver.
                    All interactive elements have proper ARIA labels and descriptions.
                  </p>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>• Use Tab to navigate between elements</p>
                    <p>• Use Space or Enter to activate buttons</p>
                    <p>• Use arrow keys to navigate within components</p>
                    <p>• Use Escape to close dialogs and menus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 flex items-center justify-between">
          <button
            onClick={resetSettings}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>

      {/* Screen reader only announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true"></div>
    </div>
  )
}

export default AccessibilityFeatures