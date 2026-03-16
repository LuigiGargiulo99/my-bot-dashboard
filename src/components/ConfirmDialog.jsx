import React from 'react';
import { AlertTriangle, XOctagon, Pause, X } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) {
  if (!isOpen) return null;

  const icons = {
    danger: <XOctagon size={32} className="text-red-400" />,
    warning: <AlertTriangle size={32} className="text-orange-400" />,
    primary: <Pause size={32} className="text-emerald-400" />,
  };

  const buttonStyles = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-orange-500 hover:bg-orange-600 text-black',
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-black',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-zinc-900 rounded-3xl p-6 max-w-sm w-full border border-zinc-800 shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-2xl ${
            variant === 'danger' ? 'bg-red-500/10' :
            variant === 'warning' ? 'bg-orange-500/10' :
            'bg-emerald-500/10'
          }`}>
            {icons[variant]}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-white font-bold text-lg text-center mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm text-center mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${buttonStyles[variant]}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Wait...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
