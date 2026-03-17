import React from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { useBot } from '../context/BotContext';

export default function Topbar() {
    const { status } = useBot();
    const botLabel = import.meta.env.VITE_BOT_LABEL;

    return (
        <header className="h-14 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-[#1e2329]/50 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 shrink-0">

            {/* LEFT: EA Status (always visible) */}
            <div className="flex items-center gap-2 bg-[#11151a] border border-white/5 rounded-full px-3 py-1.5">
                {status?.heartbeat_ok ? (
                    <Wifi size={14} className="text-emerald-400" />
                ) : (
                    <WifiOff size={14} className="text-red-400" />
                )}
                <span className="text-zinc-400 text-xs font-mono truncate max-w-[140px] sm:max-w-none">
                    {status?.ea_id || 'Connecting...'}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${status?.heartbeat_ok ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            </div>

            {/* CENTER: Bot Label (if configured via VITE_BOT_LABEL) */}
            {botLabel && (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-full px-4 py-1.5">
                    <span className="text-amber-400 text-xs md:text-sm font-bold tracking-wide uppercase">{botLabel}</span>
                </div>
            )}

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2 md:gap-4">

                {/* Notifications */}
                <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#11151a] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors relative active:scale-95">
                    <Bell size={18} />
                    {status?.status === 'ERROR' && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#11151a]" />
                    )}
                </button>

                {/* Bot Status Badge (hidden on very small screens) */}
                <div className="hidden sm:flex items-center gap-2 bg-[#11151a] border border-white/5 rounded-full px-3 py-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                        status?.status === 'RUNNING' || status?.status === 'IN_TRADE' ? 'bg-emerald-500 animate-pulse' :
                        status?.status === 'ERROR' ? 'bg-red-500' :
                        status?.status === 'DAILY_STOP' ? 'bg-orange-500' :
                        'bg-zinc-500'
                    }`} />
                    <span className="text-zinc-400 text-xs font-mono">{status?.status || '...'}</span>
                </div>

                {/* Admin label - desktop only */}
                <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/5 ml-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                        A
                    </div>
                    <span className="text-zinc-400 text-sm">Admin</span>
                </div>
            </div>
        </header>
    );
}
