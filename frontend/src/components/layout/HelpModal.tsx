import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const { t } = useTranslation();

    const shortcuts = [
        { key: '⌘K', description: t('shortcuts.quick_search') },
        { key: '⌘E', description: t('shortcuts.env_selector') },
        { key: '⌘,', description: t('shortcuts.settings') },
        { key: 'ESC', description: t('shortcuts.close') },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-md bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <Keyboard className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-bold text-white font-display">{t('shortcuts.title')}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                    {shortcuts.map((shortcut) => (
                        <div
                            key={shortcut.key}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                        >
                            <span className="text-sm text-slate-300">{shortcut.description}</span>
                            <kbd className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-sm font-mono text-white">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-slate-900/50">
                    <p className="text-xs text-slate-500 text-center">
                        {t('shortcuts.footer')}
                    </p>
                </div>
            </div>
        </div>
    );
};
