import React from 'react'
import { Save, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react'

interface ApiKeyActionsProps {
  onSave: () => void
  onDelete?: () => void
  onRefresh?: () => void
  isSaving?: boolean
  isDeleting?: boolean
  canSave?: boolean
  canDelete?: boolean
  saveText?: string
  deleteText?: string
}

const ApiKeyActions: React.FC<ApiKeyActionsProps> = ({
  onSave,
  onDelete,
  onRefresh,
  isSaving = false,
  isDeleting = false,
  canSave = true,
  canDelete = false,
  saveText = 'Save API Key',
  deleteText = 'Delete Key'
}) => {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
      <div className="flex items-center space-x-3">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Models
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {onDelete && canDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteText}
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || isSaving}
          className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {saveText}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ApiKeyActions