import React, { useEffect, useState } from 'react';

export interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'error' | 'loading';
  title: string;
  message?: string;
  duration?: number; // ミリ秒（0の場合は自動で消えない）
}

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastItem; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // アニメーション時間
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'loading':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'loading':
        return (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        );
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-sm
        ${getTypeStyles()}
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {typeof getIcon() === 'string' ? (
          <span className="text-lg">{getIcon()}</span>
        ) : (
          getIcon()
        )}
      </div>
      
      <div className="flex-1">
        <p className="font-semibold">{toast.title}</p>
        {toast.message && (
          <p className="text-sm mt-1 opacity-90">{toast.message}</p>
        )}
      </div>
      
      {toast.type !== 'loading' && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 hover:opacity-80 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// カスタムフック
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'loading' ? 0 : 5000),
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateToast = (id: string, updates: Partial<ToastItem>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  return { toasts, addToast, removeToast, updateToast };
};

export default Toast;