import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, TerminalSquare } from 'lucide-react';

interface QuickNotesProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QuickNotes: React.FC<QuickNotesProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [note, setNote] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('ops-matrix-scratchpad');
        if (saved) setNote(saved);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setNote(newVal);
        localStorage.setItem('ops-matrix-scratchpad', newVal);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface-hover)] border-b border-[var(--border)] text-[var(--foreground)]">
                <div className="flex items-center gap-2 font-medium text-xs font-mono">
                    <TerminalSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('app.scratchpad')}</span>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-[var(--foreground)] transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            <textarea
                autoFocus
                value={note}
                onChange={handleChange}
                placeholder="// Type your temporary notes here..."
                className="w-full h-80 p-3 bg-[var(--surface)] text-[var(--foreground)] text-xs font-mono resize-none focus:outline-none placeholder-slate-600 leading-relaxed"
            />
            <div className="px-3 py-1 bg-[var(--background)] border-t border-[var(--border)] text-[10px] text-slate-500 font-mono flex justify-between">
                <span>Markdown (Simple)</span>
                <span>Auto-saved</span>
            </div>
        </div>
    );
};
