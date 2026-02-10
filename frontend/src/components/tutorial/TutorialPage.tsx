import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Command, Server, Layers, Globe, Filter } from 'lucide-react';

export const TutorialPage: React.FC = () => {
    const { t } = useTranslation();

    const sections = [
        {
            icon: Globe,
            titleKey: 'tutorial.environments.title',
            descKey: 'tutorial.environments.desc'
        },
        {
            icon: Layers,
            titleKey: 'tutorial.columns.title',
            descKey: 'tutorial.columns.desc'
        },
        {
            icon: Server,
            titleKey: 'tutorial.services.title',
            descKey: 'tutorial.services.desc'
        },
        {
            icon: Filter,
            titleKey: 'tutorial.filtering.title',
            descKey: 'tutorial.filtering.desc'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-amber-500/30 transition-all group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[var(--surface-hover)] rounded-lg group-hover:bg-amber-500/10 transition-colors">
                                <section.icon className="w-6 h-6 text-[var(--foreground-muted)] group-hover:text-amber-500 transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 font-display">
                                    {t(section.titleKey)}
                                </h3>
                                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                                    {t(section.descKey)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl mt-8">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <Command className="w-5 h-5 text-amber-500" />
                    {t('tutorial.pro_tips.title')}
                </h3>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{t('tutorial.pro_tips.tip1')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{t('tutorial.pro_tips.tip2')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{t('tutorial.pro_tips.tip3')}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
