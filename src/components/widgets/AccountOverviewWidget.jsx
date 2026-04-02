import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountOverviewWidget({ status, trades, winRate }) {
    if (!status) return null;
    const pnlPositive = (status.daily_pnl || 0) >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel relative overflow-hidden p-5 md:p-8 flex flex-col justify-between h-full"
        >
            {/* Background Glow */}
            <div className={`absolute -top-20 -right-20 w-48 md:w-64 h-48 md:h-64 rounded-full blur-[80px] pointer-events-none ${pnlPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} />

            <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#161b22] border border-white/5 flex items-center justify-center">
                            <Activity size={14} className="text-zinc-400" />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-zinc-400">Account Overview</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#161b22] border border-white/5 rounded-full px-2.5 py-1">
                        <span className="text-[10px] md:text-xs text-zinc-400">Today</span>
                    </div>
                </div>

                <p className="text-zinc-500 text-xs mb-1">Current Balance</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-sans font-medium text-white metric-value tracking-tighter mb-3 md:mb-4">
                    €{(status.equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-base md:text-xl text-zinc-500 font-normal ml-1.5">EUR</span>
                </h1>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 ${pnlPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnlPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        <span className="text-lg md:text-xl font-medium">
                            {pnlPositive ? '+' : ''}€{(status.daily_pnl || 0).toFixed(2)}
                        </span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-md text-xs md:text-sm font-medium ${pnlPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {pnlPositive ? '+' : ''}{(status.daily_pnl_percent || 0).toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/5">
                <div>
                    <p className="text-zinc-500 text-[10px] md:text-xs mb-1">Trades Today</p>
                    <div className="text-xl md:text-2xl font-mono text-white">{status.trades_today || 0}</div>
                </div>
                <div>
                    <p className="text-zinc-500 text-[10px] md:text-xs mb-1">Win Rate</p>
                    <div className="text-xl md:text-2xl font-mono text-white">{winRate}%</div>
                </div>
            </div>
        </motion.div>
    );
}
