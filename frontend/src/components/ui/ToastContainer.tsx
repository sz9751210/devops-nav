import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
};

const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500'
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => {
                const Icon = icons[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={clsx(
                            "pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-right-full fade-in duration-300",
                            "bg-[var(--surface)]/90 border-[var(--border)]"
                        )}
                    >
                        <div className={clsx("p-1 rounded-full shrink-0", colors[toast.type])}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            {toast.title && (
                                <h4 className="font-semibold text-sm text-[var(--foreground)] mb-0.5">
                                    {toast.title}
                                </h4>
                            )}
                            <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
