'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  HelpCircle,
  LogIn,
  X,
  Sparkles,
  Check,
} from 'lucide-react';

import { ToastItem, ToastItemData } from '@/components/ui/ToastItem';
import { parseErrorMessages } from '@/lib/utils';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'question';

export interface AlertOptions {
  title: string;
  text?: string;
  type?: AlertType;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'emerald' | 'gold' | 'outline' | 'ghost';
  showLoginAction?: boolean;
  autoCloseMs?: number;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface PromptOptions {
  title: string;
  text?: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'number' | 'email' | 'password';
  inputLabel?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  type?: AlertType;
  required?: boolean;
  onConfirm: (inputValue: string) => void | Promise<void>;
  onCancel?: () => void;
}

export interface ConfirmOptions {
  title: string;
  text?: string;
  type?: AlertType;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'emerald' | 'gold';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ToastOptions {
  id?: string;
  title?: string;
  text?: string;
  messages?: string[] | string;
  type?: AlertType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SweetAlertContextType {
  showAlert: (options: AlertOptions) => void;
  showPrompt: (options: PromptOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  showLoginPrompt: (customMessage?: string) => void;
  showToast: (options: ToastOptions | string, type?: AlertType) => void;
  showErrorToast: (error: any, customTitle?: string, duration?: number) => void;
  showSuccessToast: (text: string, customTitle?: string, duration?: number) => void;
  showWarningToast: (text: string, customTitle?: string, duration?: number) => void;
  showInfoToast: (text: string, customTitle?: string, duration?: number) => void;
  toast: {
    error: (error: any, customTitle?: string, duration?: number) => void;
    success: (text: string, customTitle?: string, duration?: number) => void;
    warning: (text: string, customTitle?: string, duration?: number) => void;
    info: (text: string, customTitle?: string, duration?: number) => void;
    dismiss: (id?: string) => void;
  };
  closeAlert: () => void;
  /** SweetAlert2 compatible fire() helper */
  fire: (
    titleOrOptions: string | (AlertOptions & { isPrompt?: boolean; promptOptions?: PromptOptions }),
    text?: string,
    type?: AlertType
  ) => void;
}

const SweetAlertContext = createContext<SweetAlertContextType | undefined>(undefined);

export function SweetAlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
  const [promptOptions, setPromptOptions] = useState<PromptOptions | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [promptError, setPromptError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Modern Animated Toast state
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const promptInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const locale = useLocale();

  const isBn = locale === 'bn';

  useEffect(() => {
    if (isPromptOpen) {
      setTimeout(() => {
        promptInputRef.current?.focus();
      }, 50);
    }
  }, [isPromptOpen]);

  const showAlert = (opts: AlertOptions) => {
    setIsPromptOpen(false);
    setAlertOptions(opts);
    setIsOpen(true);

    if (opts.autoCloseMs && opts.autoCloseMs > 0) {
      setTimeout(() => {
        setIsOpen(false);
      }, opts.autoCloseMs);
    }
  };

  const showPrompt = (opts: PromptOptions) => {
    setAlertOptions(null);
    setPromptOptions(opts);
    setPromptValue(opts.defaultValue || '');
    setPromptError('');
    setIsPromptOpen(true);
  };

  const showConfirm = (opts: ConfirmOptions) => {
    showAlert({
      title: opts.title,
      text: opts.text,
      type: opts.type || 'question',
      showCancelButton: true,
      confirmButtonText: opts.confirmButtonText || (isBn ? 'নিশ্চিত করুন' : 'Confirm'),
      cancelButtonText: opts.cancelButtonText || (isBn ? 'বাতিল' : 'Cancel'),
      confirmButtonVariant: opts.confirmButtonVariant || 'default',
      onConfirm: opts.onConfirm,
      onCancel: opts.onCancel,
    });
  };

  const showLoginPrompt = (customMessage?: string) => {
    showAlert({
      title: isBn ? 'লগইন প্রয়োজন' : 'Sign In Required',
      text:
        customMessage ||
        (isBn
          ? 'এই ফিচারটি ব্যবহার করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।'
          : 'Please sign in to your account to continue.'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: isBn ? 'লগইন করুন' : 'Sign In Now',
      cancelButtonText: isBn ? 'পরে করব' : 'Cancel',
      showLoginAction: true,
      onConfirm: () => {
        router.push('/login');
      },
    });
  };

  const dismissToast = (id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  };

  const showToast = (opts: ToastOptions | string, type?: AlertType) => {
    const id = Math.random().toString(36).substring(2, 9);
    if (typeof opts === 'string') {
      const toastType = (type === 'question' ? 'info' : type) || 'info';
      setToasts((prev) => [...prev, { id, title: isBn ? 'বিজ্ঞপ্তি' : 'Notice', text: opts, type: toastType }]);
    } else {
      const toastType = (opts.type === 'question' ? 'info' : opts.type) || 'info';
      setToasts((prev) => [...prev, { ...opts, id, type: toastType }]);
    }
  };

  const showErrorToast = (error: any, customTitle?: string, duration: number = 5500) => {
    const id = Math.random().toString(36).substring(2, 9);
    const parsed = parseErrorMessages(error);
    const title = customTitle || (isBn ? 'ত্রুটি পরিলক্ষিত হয়েছে' : 'Validation Error');

    setToasts((prev) => [
      ...prev,
      {
        id,
        type: 'error',
        title,
        messages: parsed.length > 0 ? parsed : [isBn ? 'একটি সমস্যা দেখা দিয়েছে' : 'Something went wrong'],
        duration,
      },
    ]);
  };

  const showSuccessToast = (text: string, customTitle?: string, duration: number = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        type: 'success',
        title: customTitle || (isBn ? 'সফল হয়েছে' : 'Success'),
        text,
        duration,
      },
    ]);
  };

  const showWarningToast = (text: string, customTitle?: string, duration: number = 4500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        type: 'warning',
        title: customTitle || (isBn ? 'সতর্কতা' : 'Warning'),
        text,
        duration,
      },
    ]);
  };

  const showInfoToast = (text: string, customTitle?: string, duration: number = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        type: 'info',
        title: customTitle || (isBn ? 'তথ্য' : 'Info'),
        text,
        duration,
      },
    ]);
  };

  const toast = {
    error: (err: any, customTitle?: string, duration?: number) => showErrorToast(err, customTitle, duration),
    success: (msg: string, customTitle?: string, duration?: number) => showSuccessToast(msg, customTitle, duration),
    warning: (msg: string, customTitle?: string, duration?: number) => showWarningToast(msg, customTitle, duration),
    info: (msg: string, customTitle?: string, duration?: number) => showInfoToast(msg, customTitle, duration),
    dismiss: dismissToast,
  };

  const fire = (
    titleOrOptions: string | (AlertOptions & { isPrompt?: boolean; promptOptions?: PromptOptions }),
    text?: string,
    type?: AlertType
  ) => {
    if (typeof titleOrOptions === 'string') {
      showAlert({
        title: titleOrOptions,
        text,
        type: type || 'info',
      });
    } else if (titleOrOptions.isPrompt && titleOrOptions.promptOptions) {
      showPrompt(titleOrOptions.promptOptions);
    } else {
      showAlert(titleOrOptions);
    }
  };

  const closeAlert = () => {
    setIsOpen(false);
    if (alertOptions?.onCancel) {
      alertOptions.onCancel();
    }
  };

  const closePrompt = () => {
    setIsPromptOpen(false);
    if (promptOptions?.onCancel) {
      promptOptions.onCancel();
    }
  };

  const handleAlertConfirm = async () => {
    if (alertOptions?.onConfirm) {
      setIsProcessing(true);
      try {
        await alertOptions.onConfirm();
      } finally {
        setIsProcessing(false);
      }
    }
    setIsOpen(false);
  };

  const handlePromptSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (promptOptions?.required && !promptValue.trim()) {
      setPromptError(isBn ? 'এই তথ্যটি প্রদান করা বাধ্যতামূলক' : 'This field is required');
      return;
    }

    setIsProcessing(true);
    try {
      if (promptOptions?.onConfirm) {
        await promptOptions.onConfirm(promptValue);
      }
      setIsPromptOpen(false);
    } catch (err: any) {
      setPromptError(err?.message || 'Error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderIcon = (type?: AlertType) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5 animate-in zoom-in-75 duration-300 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9 animate-in spin-in-12 duration-300" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto ring-8 ring-rose-500/5 animate-in zoom-in-75 duration-300 shadow-lg shadow-rose-500/10">
            <XCircle className="w-9 h-9" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-8 ring-amber-500/5 animate-in zoom-in-75 duration-300 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-9 h-9" />
          </div>
        );
      case 'question':
        return (
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5 animate-in zoom-in-75 duration-300 shadow-lg shadow-primary/10">
            <HelpCircle className="w-9 h-9" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto ring-8 ring-slate-100/50 dark:ring-slate-800/50 duration-300">
            <Info className="w-9 h-9" />
          </div>
        );
    }
  };

  return (
    <SweetAlertContext.Provider
      value={{
        showAlert,
        showPrompt,
        showConfirm,
        showLoginPrompt,
        showToast,
        showErrorToast,
        showSuccessToast,
        showWarningToast,
        showInfoToast,
        toast,
        closeAlert,
        fire,
      }}
    >
      {children}

      {/* Modern Alert & Confirm Modal */}
      {isOpen && alertOptions && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 xs:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeAlert}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeAlert();
            if (e.key === 'Enter') handleAlertConfirm();
          }}
          tabIndex={-1}
        >
          <div
            className="relative w-full max-w-md p-5 xs:p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4 xs:space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeAlert}
              className="absolute top-3.5 right-3.5 xs:top-4 xs:right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon with animated halo */}
            {renderIcon(alertOptions.type)}

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-lg xs:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {alertOptions.title}
              </h3>
              {alertOptions.text && (
                <p className="text-xs xs:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {alertOptions.text}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2.5 xs:gap-3 pt-2">
              {alertOptions.showCancelButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={closeAlert}
                  className="w-full text-xs font-semibold rounded-xl"
                >
                  {alertOptions.cancelButtonText || (isBn ? 'বাতিল' : 'Cancel')}
                </Button>
              )}

              <Button
                type="button"
                variant={alertOptions.confirmButtonVariant || 'default'}
                size="default"
                isLoading={isProcessing}
                onClick={handleAlertConfirm}
                className="w-full text-xs font-bold gap-2 rounded-xl shadow-md"
              >
                {alertOptions.showLoginAction && <LogIn className="w-4 h-4" />}
                <span>{alertOptions.confirmButtonText || (isBn ? 'ঠিক আছে' : 'OK')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Interactive SweetAlert Prompt Modal */}
      {isPromptOpen && promptOptions && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 xs:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closePrompt}
          tabIndex={-1}
        >
          <div
            className="relative w-full max-w-md p-5 xs:p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 text-left space-y-4 xs:space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closePrompt}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            {renderIcon(promptOptions.type || 'question')}

            {/* Title & Description */}
            <div className="space-y-1 text-center">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {promptOptions.title}
              </h3>
              {promptOptions.text && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {promptOptions.text}
                </p>
              )}
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handlePromptSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                {promptOptions.inputLabel && (
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {promptOptions.inputLabel}
                  </label>
                )}
                <div className="relative">
                  <Input
                    ref={promptInputRef}
                    type={promptOptions.inputType || 'text'}
                    value={promptValue}
                    onChange={(e) => {
                      setPromptValue(e.target.value);
                      if (promptError) setPromptError('');
                    }}
                    placeholder={promptOptions.placeholder || (isBn ? 'এখানে লিখুন...' : 'Type here...')}
                    className="w-full pr-8 text-sm font-medium"
                    required={promptOptions.required}
                  />
                  {promptValue && (
                    <button
                      type="button"
                      onClick={() => setPromptValue('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {promptError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {promptError}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={closePrompt}
                  className="w-1/2 text-xs font-semibold rounded-xl"
                >
                  {promptOptions.cancelButtonText || (isBn ? 'বাতিল' : 'Cancel')}
                </Button>

                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  isLoading={isProcessing}
                  className="w-1/2 text-xs font-bold rounded-xl shadow-md"
                >
                  {promptOptions.confirmButtonText || (isBn ? 'নিশ্চিত করুন' : 'Submit')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Modern Custom Animated Toasts */}
      {toasts.length > 0 && (
        <div
          className="fixed top-5 right-5 z-[9999] pointer-events-none flex flex-col gap-3 max-w-md w-[calc(100vw-2.5rem)] sm:w-[420px]"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={dismissToast}
            />
          ))}
        </div>
      )}
    </SweetAlertContext.Provider>
  );
}

export function useSweetAlert() {
  const context = useContext(SweetAlertContext);
  if (!context) {
    throw new Error('useSweetAlert must be used within a SweetAlertProvider');
  }
  return context;
}

export function useToast() {
  const { showToast, showErrorToast, showSuccessToast, showWarningToast, showInfoToast, toast } = useSweetAlert();
  return {
    showToast,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    showInfoToast,
    toast,
  };
}
