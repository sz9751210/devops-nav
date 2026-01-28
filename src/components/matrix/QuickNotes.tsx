import React, { useState, useEffect } from 'react';
import { StickyNote, X } from 'lucide-react';

interface QuickNotesProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QuickNotes: React.FC<QuickNotesProps> = ({ isOpen, onClose }) => {
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
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-yellow-100/10 backdrop-blur-md border border-yellow-200/20 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center justify-between px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/10">
                <div className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                    <StickyNote className="w-4 h-4" />
                    <span>Scratchpad</span>
                </div>
                <button onClick={onClose} className="text-yellow-500/50 hover:text-yellow-500 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <textarea
                autoFocus
                value={note}
                onChange={handleChange}
                placeholder="Type your temporary notes here..."
                className="w-full h-64 p-3 bg-slate-900/80 text-slate-200 text-sm font-mono resize-none focus:outline-none placeholder-slate-600"
            />
            <div className="px-3 py-1.5 bg-black/20 text-[10px] text-slate-500 text-right">
                Auto-saved to local browser
            </div>
        </div>
    );
};
