import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import OnboardingFlow from './components/OnboardingFlow'
import HelpSystem from './components/HelpSystem'
import AccessibilityFeatures from './components/AccessibilityFeatures'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportsPage from './pages/ReportsPage'
import ApiKeysPage from './pages/ApiKeysPage'
import AdminPage from './pages/AdminPage'
import ProgressTracker from './components/ProgressTracker'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                  <OnboardingFlow />
                  <HelpSystem />
                  <AccessibilityFeatures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UploadPage />
                  </Layout>
                  <HelpSystem />
                  <AccessibilityFeatures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalysisPage />
                  </Layout>
                  <HelpSystem />
                  <AccessibilityFeatures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                  <HelpSystem />
                  <AccessibilityFeatures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProgressTracker />
                  </Layout>
                  <HelpSystem />
                  <AccessibilityFeatures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/api-keys"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ApiKeysPage />
                  </Layout>
                  <HelpSystem />
                  <AccessibilityFeatures />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout>
                    <AdminPage />
                  </Layout>
                  <HelpSystem />
                  <AccessibilityFeatures />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App