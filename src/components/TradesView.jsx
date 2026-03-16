import React from 'react';
import { useBot } from '../context/BotContext';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { formatBrokerToItalian } from '../utils/time';

export default function TradesView() {
    const { trades, refreshTrades } = useBot();

    const closedTrades = (trades || [])
        .filter(t => t.status === 'CLOSED' && t.pnl != null)
        .sort((a, b) => new Date(b.exit_time || b.entry_time) - new Date(a.exit_time || a.entry_time));

    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const wins = closedTrades.filter(t => t.pnl > 0).length;
    const losses = closedTrades.filter(t => t.pnl <= 0).length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                    <h2 className="text-white text-lg font-semibold">Trade History</h2>
                    <p className="text-zinc-500 text-xs mt-0.5">
                        {closedTrades.length} operazioni chiuse
                        {closedTrades.length > 0 && (
                            <span>
                                {' '}&middot; {wins}W / {losses}L &middot; P&L:{' '}
                                <span className={totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                    {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
                                </span>
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={refreshTrades}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] border border-white/5 text-zinc-400 hover:text-white text-xs transition-colors"
                >
                    <RefreshCw size={12} />
                    Aggiorna
                </button>
            </div>

            {/* Table */}
            <div className="glass-card bg-[#11151a] overflow-hidden">
                {closedTrades.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                        <TrendingUp size={32} className="mb-3 text-zinc-700" />
                        <p className="text-sm">Nessun trade registrato</p>
                        <p className="text-xs text-zinc-700 mt-1">I trade appariranno qui dopo la prossima sessione</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-zinc-500 text-[10px] md:text-xs uppercase tracking-wider">
                                    <th className="text-left px-4 py-3 font-semibold">Apertura</th>
                                    <th className="text-left px-4 py-3 font-semibold">Side</th>
                                    <th className="text-right px-4 py-3 font-semibold">Entry</th>
                                    <th className="text-right px-4 py-3 font-semibold">SL</th>
                                    <th className="text-right px-4 py-3 font-semibold">TP</th>
                                    <th className="text-left px-4 py-3 font-semibold">Chiusura</th>
                                    <th className="text-left px-4 py-3 font-semibold">Motivo</th>
                                    <th className="text-right px-4 py-3 font-semibold">P&L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {closedTrades.map((trade) => {
                                    const isWin = (trade.pnl || 0) > 0;
                                    return (
                                        <tr
                                            key={trade.id || trade.ticket}
                                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                                                {formatBrokerToItalian(trade.entry_time)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold ${
                                                    trade.side === 'BUY'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                    {trade.side === 'BUY' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                    {trade.side}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-white font-mono text-xs text-right">
                                                {(trade.entry_price || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-red-400/70 font-mono text-xs text-right">
                                                {(trade.sl || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-emerald-400/70 font-mono text-xs text-right">
                                                {(trade.tp || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                                                {formatBrokerToItalian(trade.exit_time)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] md:text-xs font-mono px-1.5 py-0.5 rounded ${
                                                    trade.exit_reason === 'TP' ? 'text-emerald-400 bg-emerald-500/10' :
                                                    trade.exit_reason === 'SL' ? 'text-red-400 bg-red-500/10' :
                                                    'text-zinc-400 bg-zinc-500/10'
                                                }`}>
                                                    {trade.exit_reason || '--'}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 font-mono text-xs text-right font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {isWin ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
