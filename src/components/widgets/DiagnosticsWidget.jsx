import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiagnosticsWidget({ status, config }) {
    if (!status) return null;

    // Map last_signal to human-readable blocking reason with details
    const getSignalReason = (signal, spread, atr) => {
        if (!signal || signal === 'NONE' || signal === 'LONG' || signal === 'SHORT' ||
            signal === 'LONG_V2' || signal === 'SHORT_V2') return null;
        const map = {
            'OUT_OF_WINDOW': 'Fuori orario di trading',
            'SPREAD_HIGH': `Spread troppo alto (${(spread || 0).toFixed(1)} pts)`,
            'BLOCKED_SPREAD': `Spread troppo alto (${(spread || 0).toFixed(1)} pts)`,
            'VOLATILITY_OUT': `Volatilita fuori range (ATR: ${(atr || 0).toFixed(1)} pts)`,
            'BLOCKED_VOLATILITY': `Volatilita troppo bassa (ATR: ${(atr || 0).toFixed(1)} pts)`,
            'BLOCKED_SPIKE_TR': 'Spike rilevato (True Range elevato)',
            'BLOCKED_ATR_RATIO': `Rapporto ATR anomalo (ATR: ${(atr || 0).toFixed(1)} pts)`,
            'BLOCKED_TREND': 'Filtro trend: discordanza EMA/DI',
            'BLOCKED_RISK': 'Limite rischio giornaliero raggiunto',
            'NO_OPERATION_ZONE': 'Zona NO_OPERATION: ADX in zona neutra',
            'BLOCKED_EXTENSION': 'Prezzo troppo esteso dalla media',
            'BLOCKED_DISCORDANCE': 'Discordanza tra +DI/-DI e EMA',
            'RISK_LIMIT': 'Max trade giornalieri raggiunto',
        };
        return map[signal] || signal;
    };

    const parseBlockReasons = (filters, lastSignal, spread, atr) => {
        if (!filters) return ["Dati filtri non disponibili"];
        const reasons = [];
        const covered = new Set();
        if (!filters.in_window) { reasons.push("Fuori orario di trading"); covered.add('window'); }
        if (!filters.spread_ok) { reasons.push(`Spread troppo alto (${(spread || 0).toFixed(1)} pts)`); covered.add('spread'); }
        if (!filters.volatility_ok) { reasons.push(`Volatilita fuori range (ATR: ${(atr || 0).toFixed(1)} pts)`); covered.add('volatility'); }
        if (!filters.trend_ok) { reasons.push("Filtro trend: discordanza EMA/DI"); covered.add('trend'); }
        if (filters.in_cooldown) { reasons.push("Cooldown attivo"); covered.add('cooldown'); }
        if (filters.daily_stop) { reasons.push("Daily stop raggiunto"); covered.add('dailystop'); }
        // Add signal-specific reason only if its category not already covered
        const signalCategory = {
            'OUT_OF_WINDOW': 'window', 'SPREAD_HIGH': 'spread', 'BLOCKED_SPREAD': 'spread',
            'VOLATILITY_OUT': 'volatility', 'BLOCKED_VOLATILITY': 'volatility',
            'BLOCKED_TREND': 'trend', 'BLOCKED_RISK': 'risk', 'RISK_LIMIT': 'risk',
        };
        const signalReason = getSignalReason(lastSignal, spread, atr);
        const cat = signalCategory[lastSignal];
        if (signalReason && (!cat || !covered.has(cat))) {
            reasons.push(signalReason);
        }
        return reasons;
    };

    const blockReasons = parseBlockReasons(
        status.filters, status.last_signal, status.spread_points, status.atr_points
    );
    const isInTrade = status.status === 'IN_TRADE' && status.position?.has_position;
    const isBlocked = !isInTrade && blockReasons.length > 0;

    // Detect custom (PRO) risk: risk_percent differs from preset's default
    const presetConfig = config?.presets?.[status.active_preset];
    const isProRisk = presetConfig
        && Math.abs((status.risk_percent || 0) - (presetConfig.risk_percent || 0)) > 0.001;

    const formatTime = (isoString) => {
        if (!isoString) return '--:--:--';
        const date = new Date(isoString);
        return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="glass-card flex flex-col h-full bg-[#11151a]">
            <div className="p-4 md:p-5 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-zinc-500" />
                    <span className="text-zinc-400 font-medium text-xs md:text-sm">System Diagnostics</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-mono border ${status.heartbeat_ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    Ping: {formatTime(status.last_heartbeat)}
                </div>
            </div>

            <div className="p-4 md:p-5 flex-1 flex gap-3 md:gap-4 flex-col justify-between">

                <div className="flex justify-between items-center p-2.5 md:p-3 rounded-xl bg-black/40 border border-white/5">
                    <div>
                        <p className="text-zinc-500 text-[9px] md:text-[10px] uppercase font-semibold mb-0.5">Bot Engine</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isInTrade ? 'bg-blue-400 animate-pulse' : status.status === 'RUNNING' ? 'bg-emerald-400 animate-pulse' : status.status === 'COOLDOWN' ? 'bg-cyan-400' : status.status === 'ERROR' ? 'bg-red-400' : 'bg-amber-400'}`} />
                            <span className="text-white font-mono text-xs md:text-sm">
                                {isInTrade ? 'IN TRADE' : status.status}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-zinc-500 text-[9px] md:text-[10px] uppercase font-semibold mb-0.5">Preset</p>
                        {isProRisk ? (
                            <span className="text-violet-400 font-mono text-xs md:text-sm border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 rounded">
                                PRO {(status.risk_percent || 0).toFixed(2)}%
                            </span>
                        ) : (
                            <span className="text-emerald-400 font-mono text-xs md:text-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">
                                {status.active_preset}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-1 md:mt-2">
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <ShieldAlert size={13} className={isBlocked ? "text-amber-400" : "text-emerald-400"} />
                        <span className="text-zinc-400 text-[10px] md:text-xs">Filter Status</span>
                    </div>

                    <div className="max-h-[130px] md:max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                        <AnimatePresence>
                            {isInTrade ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center h-full min-h-[48px] text-blue-400 text-[10px] md:text-xs font-mono bg-blue-500/10 rounded-lg border border-blue-500/20"
                                >
                                    Posizione aperta - {status.position?.side} {status.position?.symbol}
                                </motion.div>
                            ) : isBlocked ? (
                                <div className="flex flex-col gap-1.5 md:gap-2">
                                    {blockReasons.map((reason, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={idx}
                                            className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-1.5 md:p-2 rounded-lg"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                                            <p className="text-amber-400/90 text-[10px] md:text-xs font-mono leading-tight">{reason}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center h-full min-h-[48px] text-emerald-500 text-[10px] md:text-xs font-mono bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                                >
                                    [ OK ] Tutti i filtri passano - In attesa segnale
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
}
