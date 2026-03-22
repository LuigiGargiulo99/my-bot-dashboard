import React from 'react';
import { SquaresFour, ChartLineUp, FileText, ChartPieSlice, Sun } from '@phosphor-icons/react';
import { LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: SquaresFour },
        { id: 'trades', label: 'Trade History', icon: ChartLineUp },
        { id: 'settings', label: 'User Setting', icon: FileText },
    ];

    return (
        <aside className="w-64 bg-[#09090b] border-r border-[#1e2329] hidden md:flex flex-col h-full sticky top-0 left-0">

            {/* BRANDING */}
            <div className="p-6 flex items-center gap-3 border-b border-[#1e2329]/50">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ChartPieSlice size={18} className="text-emerald-400" />
                </div>
                <span className="text-white font-bold tracking-wide">{import.meta.env.VITE_BOT_LABEL || 'Trading Bot'}</span>
            </div>

            {/* NAVIGATION */}
            <div className="flex-1 px-4 py-8">
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-4 px-2">Navigation</div>

                <nav className="flex flex-col gap-1">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-[#161b22] text-emerald-400 font-medium border border-white/5'
                                    : 'text-zinc-500 hover:text-white hover:bg-[#11151a]'
                                    }`}
                            >
                                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                                <span className="text-sm">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-4 bg-emerald-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-4 border-t border-[#1e2329]/50 flex flex-col gap-2">
                {/* Theme Toggle (Mock) */}
                <button className="flex items-center justify-between px-4 py-2 rounded-xl text-zinc-500 hover:text-white hover:bg-[#11151a] transition-all">
                    <div className="flex items-center gap-3">
                        <Sun size={18} />
                        <span className="text-sm">Dark Mode</span>
                    </div>
                    <div className="w-8 h-4 rounded-full bg-emerald-500 flex items-center justify-end px-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                </button>

                <button onClick={onLogout} className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-400 transition-all mt-4">
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                </button>
            </div>

        </aside>
    );
}
