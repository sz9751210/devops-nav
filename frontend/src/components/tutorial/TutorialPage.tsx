import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, Command, Globe, Layers, Server, Filter,
    Settings, GitFork, Link2, LayoutGrid,
    Download, Keyboard, MousePointerClick, Zap, Tags
} from 'lucide-react';

export const TutorialPage: React.FC = () => {
    const { t } = useTranslation();

    const quickStartSteps = [
        {
            step: 1,
            icon: Globe,
            titleKey: 'tutorial.steps.env.title',
            descKey: 'tutorial.steps.env.desc',
            pathKey: 'tutorial.steps.env.path',
        },
        {
            step: 2,
            icon: Layers,
            titleKey: 'tutorial.steps.columns.title',
            descKey: 'tutorial.steps.columns.desc',
            pathKey: 'tutorial.steps.columns.path',
        },
        {
            step: 3,
            icon: Server,
            titleKey: 'tutorial.steps.services.title',
            descKey: 'tutorial.steps.services.desc',
            pathKey: 'tutorial.steps.services.path',
        },
        {
            step: 4,
            icon: Link2,
            titleKey: 'tutorial.steps.links.title',
            descKey: 'tutorial.steps.links.desc',
            pathKey: 'tutorial.steps.links.path',
        },
    ];

    const featureCards = [
        {
            icon: LayoutGrid,
            titleKey: 'tutorial.features.views.title',
            descKey: 'tutorial.features.views.desc',
        },
        {
            icon: GitFork,
            titleKey: 'tutorial.features.hierarchy.title',
            descKey: 'tutorial.features.hierarchy.desc',
        },
        {
            icon: Filter,
            titleKey: 'tutorial.features.filtering.title',
            descKey: 'tutorial.features.filtering.desc',
        },
        {
            icon: Tags,
            titleKey: 'tutorial.features.bilingual.title',
            descKey: 'tutorial.features.bilingual.desc',
        },
        {
            icon: MousePointerClick,
            titleKey: 'tutorial.features.inline_edit.title',
            descKey: 'tutorial.features.inline_edit.desc',
        },
        {
            icon: Download,
            titleKey: 'tutorial.features.yaml.title',
            descKey: 'tutorial.features.yaml.desc',
        },
    ];

    const shortcuts = [
        { keys: 'Ctrl + K', descKey: 'tutorial.shortcuts.search' },
        { keys: 'Ctrl + E', descKey: 'tutorial.shortcuts.env' },
        { keys: 'Ctrl + ,', descKey: 'tutorial.shortcuts.settings' },
        { keys: 'Esc', descKey: 'tutorial.shortcuts.close' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero */}
            <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                    <BookOpen className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    {t('tutorial.welcome_title')}
                </h1>
                <p className="text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed">
                    {t('tutorial.welcome_desc')}
                </p>
            </div>

            {/* Quick Start Steps */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    {t('tutorial.quick_start_title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickStartSteps.map((item) => (
                        <div
                            key={item.step}
                            className="relative p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-amber-500/30 transition-all group overflow-hidden"
                        >
                            {/* Step Number */}
                            <div className="absolute -top-2 -right-2 w-14 h-14 bg-amber-500/5 rounded-full flex items-end justify-start p-3 text-3xl font-black text-amber-500/20 group-hover:text-amber-500/40 transition-colors">
                                {item.step}
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-[var(--surface-hover)] rounded-lg group-hover:bg-amber-500/10 transition-colors shrink-0">
                                    <item.icon className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-amber-500 transition-colors" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
                                        {t(item.titleKey)}
                                    </h3>
                                    <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-2">
                                        {t(item.descKey)}
                                    </p>
                                    <span className="inline-block text-[10px] font-bold text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                                        {t(item.pathKey)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    {t('tutorial.features_title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featureCards.map((card, idx) => (
                        <div
                            key={idx}
                            className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-amber-500/30 transition-all group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-[var(--surface-hover)] rounded-lg group-hover:bg-amber-500/10 transition-colors shrink-0">
                                    <card.icon className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-amber-500 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">
                                        {t(card.titleKey)}
                                    </h3>
                                    <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                        {t(card.descKey)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-amber-500" />
                    {t('tutorial.shortcuts_title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shortcuts.map((shortcut, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <kbd className="inline-flex items-center px-2.5 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs font-mono font-bold text-[var(--foreground)] min-w-[90px] justify-center">
                                {shortcut.keys}
                            </kbd>
                            <span className="text-sm text-[var(--foreground-muted)]">
                                {t(shortcut.descKey)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pro Tips */}
            <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <Command className="w-5 h-5 text-amber-500" />
                    {t('tutorial.pro_tips.title')}
                </h3>
                <ul className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                            <span>{t(`tutorial.pro_tips.tip${i}`)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
