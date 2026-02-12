
export const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
};

export const generateColorFromHash = (str: string) => {
    const hash = hashString(str);
    const colors = [
        'text-blue-500 bg-blue-500/10 border-blue-500/20',
        'text-purple-500 bg-purple-500/10 border-purple-500/20',
        'text-pink-500 bg-pink-500/10 border-pink-500/20',
        'text-orange-500 bg-orange-500/10 border-orange-500/20',
        'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
        'text-rose-500 bg-rose-500/10 border-rose-500/20',
        'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    ];
    return colors[Math.abs(hash) % colors.length];
};
