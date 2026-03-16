import React from 'react';
import { Play, Pause, XCircle, Power, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ControlPanelWidget({ isRunning, isPaused, isDailyStop, pause, resume, forceClose, kill, onPresetClick, commandPending, hasPosition }) {

    const canToggle = !commandPending && !isDailyStop;

    const handleToggle = async () => {
        if (isRunning) await pause();
        else await resume();
    };

    return (
        <div className="glass-panel p-4 md:p-6 flex flex-col h-full">
            <div className="mb-4 md:mb-6">
                <h3 className="text-zinc-400 text-sm font-medium">Control Terminal</h3>
                <p className="text-zinc-600 text-xs">Manage local execution state</p>
            </div>

            <div className="flex-1 flex flex-col gap-2.5 md:gap-3 justify-center">
                {/* Toggle Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleToggle}
                    disabled={!canToggle}
                    className={`relative overflow-hidden w-full p-3.5 md:p-4 rounded-2xl border flex items-center justify-between transition-colors min-h-[56px] active:scale-[0.98] ${isRunning
                            ? 'bg-[#11151a] border-emerald-500/30 hover:bg-[#161b22]'
                            : isDailyStop
                                ? 'bg-orange-500/5 border-orange-500/30 opacity-50 cursor-not-allowed'
                                : 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isRunning && <div className="absolute inset-0 glow-green-bg opacity-30" />}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className={`p-2 rounded-full ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>
                            {isRunning ? <Pause size={20} /> : <Play size={20} />}
                        </div>
                        <div className="text-left flex flex-col">
                            <span className={`font-bold text-sm ${isRunning ? 'text-white' : isDailyStop ? 'text-orange-400' : 'text-emerald-400'}`}>
                                {isDailyStop ? 'Daily Stop' : isRunning ? 'Running' : 'Paused'}
                            </span>
                            <span className="text-zinc-500 text-[10px] uppercase">
                                {isDailyStop ? 'Trading halted' : isRunning ? 'Click to Pause' : 'Click to Start'}
                            </span>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className={`w-2 h-2 rounded-full ${isDailyStop ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} style={{ opacity: isRunning ? 1 : 0.2 }} />
                    </div>
                </motion.button>

                {/* Preset Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onPresetClick}
                    disabled={commandPending}
                    className="w-full p-3.5 md:p-4 rounded-2xl bg-[#11151a] hover:bg-[#161b22] border border-white/5 flex items-center justify-between transition-colors min-h-[52px] active:scale-[0.98] disabled:opacity-50"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-zinc-800 text-zinc-400">
                            <Settings2 size={18} />
                        </div>
                        <span className="text-white font-medium text-sm">Preset Target</span>
                    </div>
                </motion.button>

                <div className="h-px bg-white/5 w-full my-1 md:my-2" />

                {/* Force Close */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={forceClose}
                    disabled={commandPending || !hasPosition}
                    className="w-full p-3.5 md:p-4 rounded-2xl bg-[#11151a] border border-red-500/20 hover:bg-red-500/10 flex items-center gap-3 transition-colors min-h-[52px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <div className="p-2 rounded-full bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
                        <XCircle size={18} />
                    </div>
                    <div className="text-left flex flex-col">
                        <span className="text-red-400 font-medium text-sm">Force Close Position</span>
                        <span className="text-red-500/50 text-[10px] uppercase">Closes active trade</span>
                    </div>
                </motion.button>

                {/* Kill Switch */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={kill}
                    disabled={commandPending}
                    className="relative overflow-hidden w-full p-3.5 md:p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 flex items-center gap-3 transition-colors min-h-[52px] active:scale-[0.98] group disabled:opacity-50"
                >
                    <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                    <div className="p-2 rounded-full bg-red-500 text-white relative z-10 shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.8)] transition-shadow">
                        <Power size={18} />
                    </div>
                    <div className="text-left flex flex-col relative z-10">
                        <span className="text-red-400 font-bold text-sm">Kill Switch</span>
                        <span className="text-red-400/70 text-[10px] uppercase tracking-widest">Emergency Pause & Close</span>
                    </div>
                </motion.button>

            </div>
        </div>
    );
}
