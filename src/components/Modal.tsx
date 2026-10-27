'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  isConfirming?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  isConfirming = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            {confirmVariant === 'danger' && (
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {description && <p className="mt-3 text-sm text-slate-400 leading-relaxed">{description}</p>}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirming}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md ${
                confirmVariant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
              } disabled:opacity-50`}
            >
              {isConfirming ? 'Processing...' : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
