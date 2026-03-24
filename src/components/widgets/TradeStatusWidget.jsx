import React from 'react';
import { ArrowUpRight, ArrowDownRight, Target, Shield, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBrokerToItalian } from '../../utils/time';

export default function TradeStatusWidget({ status, lastTrade }) {
    if (!status) return null;
    const hasPosition = status.position?.has_position || false;
    const pnlPositive = (status.position?.pnl || 0) >= 0;

    return (
        <div className="flex flex-col gap-3 md:gap-4 h-full">
            {/* ACTIVE POSITION CARD */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card flex-1 p-4 md:p-6 relative overflow-hidden flex flex-col justify-between"
            >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className="flex items-center gap-2.5 md:gap-3">
                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${hasPosition ? (status.position.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400') : 'bg-zinc-800 text-zinc-500'}`}>
                            <Crosshair size={18} />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-[10px] md:text-xs">Active Position</p>
                            <h3 className="text-white font-bold text-sm md:text-base">{hasPosition ? status.position.symbol : 'No Open Trades'}</h3>
                        </div>
                    </div>
                    {hasPosition && (
                        <span className={`px-2.5 py-0.5 text-[10px] md:text-xs font-bold rounded-full ${status.position.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {status.position.side}
                        </span>
                    )}
                </div>

                <AnimatePresence mode="popLayout">
                    {hasPosition ? (
                        <motion.div
                            key="active-trade"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3 md:space-y-4"
                        >
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-zinc-500 text-[10px] md:text-xs mb-1">Current PnL</p>
                                    <div className={`text-2xl md:text-4xl font-sans tracking-tight ${pnlPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {pnlPositive ? '+' : ''}${(status.position.pnl || 0).toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-500 text-[10px] md:text-xs mb-1">Size</p>
                                    <p className="text-white font-mono text-sm">{(status.position.size || 0).toFixed(2)}</p>
                                </div>
                            </div>

                            {(() => {
                                const entry = status.position.open_price || 0;
                                const sl = status.position.sl || 0;
                                const isLong = status.position.side === 'BUY';
                                const trailActive = entry > 0 && sl > 0 && (isLong ? sl >= entry : sl <= entry);
                                const lockedProfit = trailActive ? Math.abs(sl - entry).toFixed(2) : null;
                                return (
                                    <div className="grid grid-cols-2 gap-1.5 md:gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5">
                                        <div className="bg-[#09090b]/50 p-1.5 md:p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-500 text-[9px] md:text-[10px] uppercase block mb-0.5">Entry</span>
                                            <span className="text-white font-mono text-[11px] md:text-sm">{entry.toFixed(2)}</span>
                                        </div>
                                        <div className="bg-[#09090b]/50 p-1.5 md:p-2 rounded-lg border border-white/5">
                                            <span className="text-zinc-500 text-[9px] md:text-[10px] uppercase block mb-0.5">Aperto</span>
                                            <span className="text-white font-mono text-[11px] md:text-sm">{formatBrokerToItalian(status.position.open_time)}</span>
                                        </div>
                                        <div className={`bg-[#09090b]/50 p-1.5 md:p-2 rounded-lg border ${trailActive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'} flex flex-col`}>
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-zinc-500 text-[9px] md:text-[10px] uppercase">SL</span>
                                                {trailActive ? (
                                                    <span className="text-[8px] md:text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1 rounded">TRAIL</span>
                                                ) : (
                                                    <Shield size={9} className="text-red-400/50" />
                                                )}
                                            </div>
                                            <span className={`font-mono text-[11px] md:text-sm ${trailActive ? 'text-emerald-400' : 'text-white'}`}>{sl.toFixed(2)}</span>
                                            {lockedProfit && (
                                                <span className="text-emerald-400/70 font-mono text-[9px] mt-0.5">+{lockedProfit} locked</span>
                                            )}
                                        </div>
                                        <div className="bg-[#09090b]/50 p-1.5 md:p-2 rounded-lg border border-white/5 flex flex-col">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-zinc-500 text-[9px] md:text-[10px] uppercase">TP</span>
                                                <Target size={9} className="text-emerald-400/50" />
                                            </div>
                                            <span className="text-white font-mono text-[11px] md:text-sm">{(status.position.tp || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    ) : (
                        <motion.div key="no-trade" className="flex items-center justify-center py-4 md:py-6 text-zinc-600 text-xs md:text-sm">
                            Waiting for the next signal...
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* LAST CLOSED TRADE */}
            <motion.div className="glass-card p-4 md:p-5 border-t-0 bg-gradient-to-b from-[#11151a] to-[#0d1014]">
                <div className="flex justify-between items-center mb-2 md:mb-3">
                    <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest font-semibold">Last Closed</p>
                    {lastTrade?.side && (
                        <span className="text-zinc-600 text-[10px]">{lastTrade.exit_reason || 'Closed'}</span>
                    )}
                </div>

                {lastTrade?.side ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 md:gap-3">
                            <div className={`p-1.5 md:p-2 rounded-lg border ${(lastTrade.pnl || 0) >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                {lastTrade.side === 'BUY' ? (
                                    <ArrowUpRight size={14} className={(lastTrade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                                ) : (
                                    <ArrowDownRight size={14} className={(lastTrade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                                )}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{lastTrade.symbol || 'N/A'}</p>
                                <p className="text-zinc-500 text-[10px]">{lastTrade.side}</p>
                            </div>
                        </div>
                        <div className={`text-lg md:text-xl font-mono ${(lastTrade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {(lastTrade.pnl || 0) >= 0 ? '+' : ''}{(lastTrade.pnl || 0).toFixed(2)}$
                        </div>
                    </div>
                ) : (
                    <div className="text-zinc-600 text-xs md:text-sm py-2">No previous trades today.</div>
                )}
            </motion.div>
        </div>
    );
}
