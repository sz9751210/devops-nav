import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationStore } from '../../store/useMatrixStore';
import { FileCode, Upload, Download, Copy, Check, Sparkles } from 'lucide-react';

export const ImportExport: React.FC = () => {
    const { t } = useTranslation();
    const { exportConfig, parseConfig } = useNavigationStore();
    const [yamlContent, setYamlContent] = useState('');
    const [copied, setCopied] = useState(false);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const yaml = exportConfig();
        setYamlContent(yaml);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(yamlContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleImport = () => {
        try {
            parseConfig(yamlContent);
            setImportStatus('success');
            setTimeout(() => setImportStatus('idle'), 2000);
        } catch {
            setImportStatus('error');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setYamlContent(content);
            };
            reader.readAsText(file);
        }
    };

    const handleDownload = () => {
        const yaml = exportConfig();
        const blob = new Blob([yaml], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'opsbridge-config.yaml';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 font-mono">
                    <FileCode className="w-5 h-5 text-amber-500" />
                    {t('settings.import_export.title')}
                </h2>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    {t('settings.import_export.subtitle')}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] rounded text-sm transition-colors flex items-center gap-2 font-mono"
                >
                    <Download className="w-4 h-4 text-[var(--foreground-muted)]" />
                    {t('actions.load_current')}
                </button>
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded text-sm font-semibold transition-colors flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    {t('actions.download')}
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] rounded text-sm transition-colors flex items-center gap-2 font-mono"
                >
                    <Upload className="w-4 h-4 text-[var(--foreground-muted)]" />
                    {t('actions.upload')}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".yaml,.yml,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {/* Editor */}
            <div className="relative group">
                <textarea
                    value={yamlContent}
                    onChange={(e) => setYamlContent(e.target.value)}
                    placeholder={t('settings.import_export.editor_placeholder')}
                    spellCheck={false}
                    className="w-full h-[500px] px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] font-mono text-xs leading-relaxed placeholder-[var(--foreground-muted)]/50 focus:outline-none focus:border-amber-500/50 resize-none transition-all shadow-inner"
                />
                {yamlContent && (
                    <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 p-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded transition-colors border border-[var(--border)]"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {/* Import Button */}
            <div className="flex items-center gap-4 py-2">
                <button
                    onClick={handleImport}
                    disabled={!yamlContent}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[var(--surface)] disabled:text-[var(--foreground-muted)] disabled:opacity-50 text-white rounded font-semibold transition-colors flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    {t('actions.apply')}
                </button>
                {importStatus === 'success' && (
                    <span className="text-emerald-500 text-sm font-mono flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <Check className="w-4 h-4" /> CONFIG_APPLIED_SUCCESSFULLY
                    </span>
                )}
                {importStatus === 'error' && (
                    <span className="text-red-500 text-sm font-mono animate-in fade-in slide-in-from-left-2">
                        ERR: FAILED_TO_PARSE_YAML
                    </span>
                )}
            </div>

            {/* Snippets / Smart Import */}
            <div className="pt-6 border-t border-[var(--border)]">
                <h3 className="text-sm font-bold text-[var(--foreground-muted)] opacity-70 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {t('settings.import_export.smart_snippets')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                        onClick={() => setYamlContent(prev => prev + `
# Added Monitoring Stack
services:
  - id: prometheus
    name: Prometheus
    group: Monitoring
    tags: [infra, monitoring]
    links: []
  - id: grafana
    name: Grafana
    group: Monitoring
    tags: [infra, monitoring]
    links: []
`)}
                        className="p-3 text-left bg-[var(--surface)] border border-[var(--border)] rounded hover:border-amber-500/50 hover:bg-[var(--surface-hover)] transition-all group"
                    >
                        <div className="text-sm font-bold text-[var(--foreground)] group-hover:text-amber-600 dark:group-hover:text-amber-500 font-mono">{t('settings.import_export.snippets.monitoring_title')}</div>
                        <div className="text-sm text-[var(--foreground-muted)] opacity-60 mt-1 font-mono">{t('settings.import_export.snippets.monitoring_desc')}</div>
                    </button>

                    <button
                        onClick={() => setYamlContent(prev => prev + `
# Added Logging Stack
services:
  - id: elasticsearch
    name: Elasticsearch
    group: Logging
    tags: [data, logging]
    links: []
  - id: kibana
    name: Kibana
    group: Logging
    tags: [data, logging]
    links: []
`)}
                        className="p-3 text-left bg-[var(--surface)] border border-[var(--border)] rounded hover:border-blue-500/50 hover:bg-[var(--surface-hover)] transition-all group"
                    >
                        <div className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-600 dark:group-hover:text-blue-500 font-mono">{t('settings.import_export.snippets.logging_title')}</div>
                        <div className="text-sm text-[var(--foreground-muted)] opacity-60 mt-1 font-mono">{t('settings.import_export.snippets.logging_desc')}</div>
                    </button>

                    <button
                        onClick={() => setYamlContent(prev => prev + `
# Common Tags Config
theme:
  primaryColor: amber
announcement:
  active: true
  level: info
  message: "Maintenance Window: Sunday 2AM - 4AM UTC"
`)}
                        className="p-3 text-left bg-[var(--surface)] border border-[var(--border)] rounded hover:border-green-500/50 hover:bg-[var(--surface-hover)] transition-all group"
                    >
                        <div className="text-sm font-bold text-[var(--foreground)] group-hover:text-green-600 dark:group-hover:text-green-500 font-mono">{t('settings.import_export.snippets.standard_title')}</div>
                        <div className="text-sm text-[var(--foreground-muted)] opacity-60 mt-1 font-mono">{t('settings.import_export.snippets.standard_desc')}</div>
                    </button>
                </div>
            </div>
        </div>
    );
};
