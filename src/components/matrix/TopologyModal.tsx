import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatrixStore } from '../../store/useMatrixStore';
import { X, Network } from 'lucide-react';

interface TopologyModalProps {
    onClose: () => void;
}

export const TopologyModal: React.FC<TopologyModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { config } = useMatrixStore();

    const nodes = useMemo(() => {
        const groups = Array.from(new Set(config.services.map(s => s.group || 'Ungrouped')));

        const groupNodes = groups.map((g, i) => {
            const angle = (i / groups.length) * 2 * Math.PI;
            const r = 200;
            return {
                id: `g-${g}`,
                label: g,
                type: 'group',
                x: 400 + r * Math.cos(angle),
                y: 350 + r * Math.sin(angle)
            };
        });

        const serviceNodes = config.services.map((s) => {
            const groupIndex = groups.indexOf(s.group || 'Ungrouped');
            const groupNode = groupNodes[groupIndex];

            // Better distribution
            const angle = Math.random() * 2 * Math.PI;
            const r = 50 + Math.random() * 40;

            return {
                id: s.id,
                label: s.name,
                type: 'service',
                x: groupNode.x + r * Math.cos(angle),
                y: groupNode.y + r * Math.sin(angle),
                group: s.group
            };
        });

        return [...groupNodes, ...serviceNodes];
    }, [config.services]);

    const links = useMemo(() => {
        return config.services.map(s => ({
            source: s.id,
            target: `g-${s.group || 'Ungrouped'}`
        }));
    }, [config.services]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[95vw] h-[85vh] bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden relative flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
                    <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-amber-500" />
                        <h2 className="font-mono text-sm text-[var(--foreground)] uppercase tracking-widest">{t('app.topology')}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-sm text-slate-500 hover:text-[var(--foreground)] transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative bg-[var(--background)]">
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>

                    <svg width="100%" height="100%" viewBox="0 0 800 700" className="pointer-events-none relative z-10">
                        {/* Links */}
                        {links.map((link, i) => {
                            const source = nodes.find(n => n.id === link.source);
                            const target = nodes.find(n => n.id === link.target);
                            if (!source || !target) return null;
                            return (
                                <line
                                    key={i}
                                    x1={source.x} y1={source.y}
                                    x2={target.x} y2={target.y}
                                    style={{ stroke: 'var(--border)' }}
                                    strokeWidth="1.5"
                                />
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map(node => (
                            <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                                {node.type === 'group' ? (
                                    <>
                                        <circle r="40" style={{ fill: 'var(--surface)', stroke: 'var(--border)' }} strokeWidth="1" />
                                        <text y="55" textAnchor="middle" style={{ fill: 'var(--foreground)' }} fontSize="11" fontFamily="monospace" fontWeight="bold">{node.label}</text>
                                    </>
                                ) : (
                                    <>
                                        <circle r="4" style={{ fill: 'var(--foreground-muted)', stroke: 'var(--background)' }} strokeWidth="1" />
                                        <text y="14" textAnchor="middle" style={{ fill: 'var(--foreground-muted)' }} fontSize="9" fontFamily="monospace">{node.label}</text>
                                    </>
                                )}
                            </g>
                        ))}
                    </svg>

                    <div className="absolute bottom-4 left-4 p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[10px] text-slate-500 font-mono">
                        <div>NODES: {nodes.length}</div>
                        <div>GROUPS: {nodes.filter(n => n.type === 'group').length}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
