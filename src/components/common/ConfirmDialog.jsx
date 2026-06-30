import React, { useEffect } from 'react';
import { AlertCircle, Trash2, CheckCircle, Info } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'danger', // 'danger', 'warning', 'info', 'success'
  isLoading = false
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'warning': return <AlertCircle className="w-6 h-6 text-amber-600" />;
      case 'success': return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      case 'info':
      default: return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'success': return 'bg-emerald-100 dark:bg-emerald-900/30';
      case 'info':
      default: return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 focus:ring-red-500';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 focus:ring-amber-500';
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 focus:ring-emerald-500';
      case 'info':
      default: return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 focus:ring-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onCancel : undefined}
      />
      
      {/* Dialog Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md overflow-hidden transform transition-all z-10 border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-6 sm:p-8 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mx-auto sm:mx-0 ${getIconBgColor()}`}>
            {getIcon()}
          </div>
          
          <div className="text-center sm:text-left mt-3 sm:mt-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            disabled={isLoading}
            className={`w-full inline-flex justify-center rounded-xl border border-transparent px-5 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:ml-3 sm:w-auto transition-all ${getConfirmButtonColor()} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={onConfirm}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : confirmText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            className={`mt-3 w-full inline-flex justify-center rounded-xl bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
