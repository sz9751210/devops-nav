import React, { useState, useRef } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { FileCode, Upload, Download, Copy, Check, Sparkles } from 'lucide-react';

export const ImportExport: React.FC = () => {
    const { exportConfig, parseConfig } = useMatrixStore();
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
                <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                    <FileCode className="w-5 h-5 text-indigo-400" />
                    Import / Export Configuration
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Export your configuration to YAML for version control, or import from an existing file.
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 border border-white/5 rounded-xl font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                    <Download className="w-4 h-4" />
                    Load Current Config
                </button>
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Download className="w-4 h-4" />
                    Download YAML
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 border border-white/5 rounded-xl font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                    <Upload className="w-4 h-4" />
                    Upload File
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
                    placeholder="# Paste or load your YAML configuration here..."
                    className="w-full h-[400px] px-6 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-slate-200 font-mono text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none backdrop-blur-sm transition-all shadow-xl"
                />
                {yamlContent && (
                    <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5 backdrop-blur-md"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {/* Import Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleImport}
                    disabled={!yamlContent}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <Upload className="w-4 h-4" />
                    Apply Configuration
                </button>
                {importStatus === 'success' && (
                    <span className="text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <Check className="w-4 h-4" /> Configuration applied successfully!
                    </span>
                )}
                {importStatus === 'error' && (
                    <span className="text-red-400 text-sm animate-in fade-in slide-in-from-left-2">
                        Failed to parse YAML. Please check the format.
                    </span>
                )}
            </div>
            {/* Snippets / Smart Import */}
            <div className="pt-4 border-t border-white/5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Quick Snippets (Smart Import)
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
                        className="p-3 text-left bg-slate-900 border border-white/10 rounded-lg hover:border-amber-500/50 hover:bg-slate-800 transition-all group"
                    >
                        <div className="font-medium text-slate-200 group-hover:text-amber-400">Add Monitoring Stack</div>
                        <div className="text-xs text-slate-500 mt-1">Adds Prometheus & Grafana services</div>
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
                        className="p-3 text-left bg-slate-900 border border-white/10 rounded-lg hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
                    >
                        <div className="font-medium text-slate-200 group-hover:text-blue-400">Add EFK Stack</div>
                        <div className="text-xs text-slate-500 mt-1">Adds Elasticsearch & Kibana</div>
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
                        className="p-3 text-left bg-slate-900 border border-white/10 rounded-lg hover:border-green-500/50 hover:bg-slate-800 transition-all group"
                    >
                        <div className="font-medium text-slate-200 group-hover:text-green-400">Apply Standard Config</div>
                        <div className="text-xs text-slate-500 mt-1">Sets theme and standard announcements</div>
                    </button>
                </div>
            </div>

            <div className="h-8"></div>
        </div>
    );
};
