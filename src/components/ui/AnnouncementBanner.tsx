import React, { useState } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { AlertCircle, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

export const AnnouncementBanner: React.FC = () => {
    const { config } = useMatrixStore();
    const [isVisible, setIsVisible] = useState(true);

    if (!config.announcement?.active || !isVisible) return null;

    const { message, level, closable } = config.announcement;

    const styles = {
        info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        error: "bg-rose-500/10 border-rose-500/20 text-rose-400",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    };

    const icons = {
        info: <Info className="w-4 h-4" />,
        warning: <AlertTriangle className="w-4 h-4" />,
        error: <AlertCircle className="w-4 h-4" />,
        success: <CheckCircle className="w-4 h-4" />,
    };

    return (
        <div className={clsx(
            "flex items-center justify-between px-4 py-2 border-b backdrop-blur-md transition-all",
            styles[level || 'info']
        )}>
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
                {icons[level || 'info']}
                <span className="text-sm font-medium leading-tight">
                    {message}
                </span>
            </div>
            {closable && (
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
