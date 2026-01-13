'use client';

export default function ColorComponent() {
    return (
        <div className="mt-20">
              {/* Manual Color Palette Display Boxes */}
            <div className="pt-32 flex flex-wrap items-center justify-center gap-2 py-4 " >
                {[
                    { name: 'Primary 1', class: 'bg-primary' },
                    { name: 'Primary 2', class: 'bg-primary-2' },
                    { name: 'Secondary 1', class: 'bg-secondary' },
                    { name: 'Secondary 2', class: 'bg-secondary-2' },
                    { name: 'Secondary 3', class: 'bg-accent' },
                    { name: 'White Text', class: 'bg-white-text' }
                ].map((color) => (
                    <div 
                        key={color.class}
                        className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                            navigator.clipboard.writeText(color.class);
                            
                        }}
                        title="Click to copy"
                    >
                        <div className={`w-10 h-10 rounded-xl shadow-lg ${color.class} border ${color.class === 'bg-white-text' ? 'border-zinc-200' : 'border-white/10'}`} />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                            {color.name} - {color.class}
                        </span>
                    </div>
                ))}
            </div>

        </div>
    );
}