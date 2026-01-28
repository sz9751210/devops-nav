import React, { useMemo } from 'react';
import { useMatrixStore } from '../../store/useMatrixStore';
import { X, Network } from 'lucide-react';

interface TopologyModalProps {
    onClose: () => void;
}

// Simple topological visualizer (Force-directed mock using fixed circular layout for now for simplicity)
export const TopologyModal: React.FC<TopologyModalProps> = ({ onClose }) => {
    const { config } = useMatrixStore();

    // In a real app, 'dependsOn' would be in the schema. For this demo, we can mock it 
    // or just display relationships based on Groups.
    // Let's visualize Groups as Hubs and Services as Nodes.

    const nodes = useMemo(() => {
        const groups = Array.from(new Set(config.services.map(s => s.group || 'Ungrouped')));

        // Calculate Group Positions (Circle)
        const groupNodes = groups.map((g, i) => {
            const angle = (i / groups.length) * 2 * Math.PI;
            const r = 150;
            return {
                id: `g-${g}`,
                label: g,
                type: 'group',
                x: 400 + r * Math.cos(angle),
                y: 300 + r * Math.sin(angle)
            };
        });

        // Calculate Service Positions (Cluster around group)
        const serviceNodes = config.services.map((s) => {
            const groupIndex = groups.indexOf(s.group || 'Ungrouped');
            const groupNode = groupNodes[groupIndex];

            // Random offset from group center
            const angle = Math.random() * 2 * Math.PI;
            const r = 40 + Math.random() * 30;

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-[90vw] h-[80vh] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden relative flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-amber-500" />
                        <h2 className="font-bold text-white">Service Topology (Group View)</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative cursor-move bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                    <svg width="100%" height="100%" viewBox="0 0 800 600" className="pointer-events-none">
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
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map(node => (
                            <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                                {node.type === 'group' ? (
                                    <>
                                        <circle r="30" fill="rgba(245, 158, 11, 0.1)" stroke="rgba(245, 158, 11, 0.4)" />
                                        <text y="45" textAnchor="middle" fill="#fbbf24" fontSize="10">{node.label}</text>
                                    </>
                                ) : (
                                    <>
                                        <circle r="6" fill="#64748b" stroke="#0f172a" strokeWidth="2" />
                                        <text y="16" textAnchor="middle" fill="#94a3b8" fontSize="8">{node.label}</text>
                                    </>
                                )}
                            </g>
                        ))}
                    </svg>

                    <div className="absolute bottom-4 left-4 p-3 bg-black/40 backdrop-blur rounded-lg border border-white/5 text-xs text-slate-400">
                        <p>Visualizing {config.services.length} services in {nodes.filter(n => n.type === 'group').length} groups.</p>
                        <p className="mt-1 text-[10px] text-slate-600">Drag & Drop not implemented in this lightweight view.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
