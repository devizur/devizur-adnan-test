'use client';

import { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

const COLORS = [
    { id: 'p1', name: 'Primary 1', variable: '--primary-1', class: 'bg-primary-1', description: 'Main Brand Accent' },
    { id: 'p2', name: 'Primary 2', variable: '--primary-2', class: 'bg-primary-2', description: 'Subtle Brand Shade' },
    { id: 's1', name: 'Secondary 1', variable: '--secondary', class: 'bg-secondary', description: 'System Secondary' },
    { id: 's2', name: 'Secondary 2', variable: '--secondary-2', class: 'bg-secondary-2', description: 'Card Backgrounds' },
    { id: 's3', name: 'Secondary 3', variable: '--accent', class: 'bg-accent', description: 'Accent Highlights' },
    { id: 'pr', name: 'Primary Text', variable: '--primary', class: 'bg-primary', description: 'Main Typography' },
];

export default function ColorComponent() {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show if NEXT_PUBLIC_ENV is set to 'dev'
        if (process.env.NEXT_PUBLIC_ENV === 'dev') {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 bg-zinc-950/80 p-2 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center -space-x-2 px-2">
                    {COLORS.map((color) => {
                        const isCopied = copiedId === color.id;
                        return (
                            <button
                                key={color.id}
                                onClick={() => handleCopy(color.id, color.class)}
                                className={`w-8 h-8 rounded-full transition-all duration-300 hover:scale-125 hover:z-10 shadow-2xl ${color.class} border ${color.id === 'pr' ? 'border-zinc-700' : 'border-white/10'} flex items-center justify-center relative group`}
                            >
                                {isCopied ? (
                                    <Check className="w-3 h-3 text-white drop-shadow-md" />
                                ) : (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-[10px] font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50 capitalize">
                                        {color.name}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex flex-col pr-4 pl-1 leading-none">
                    <span className="text-[9px] font-black text-primary-1 uppercase tracking-tighter">Dev Mode</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Palette</span>
                </div>
            </div>
        </div>
    );
}
