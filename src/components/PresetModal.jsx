import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';

const BASE_MAX = 0.3;
const MIN_RISK = 0.1;
const QUICK_SELECT = [0.1, 0.2, 0.3];

const DD_MIN = 0.5;
const DD_MAX = 100.0;
const DD_STEP = 0.1;

const MIN_LOTS = 0.01;
const LOT_STEP = 0.01;

// SL/TP multipliers (must match EA Config.mqh)
const SL_TREND_MULT = 1.5;
const TP_TREND_MULT = 2.5;

export function RiskModal({
  isOpen, currentRisk, currentDrawdown, equity, activePreset, presets,
  onApply, onApplyDrawdown, onApplyLots, onClose, loading = false,
  currentPrice = 0, atrValue = 0, tickValue = 0, tickSize = 0, maxLots = 0, currentLots = 0
}) {
  const [tab, setTab] = useState('base');
  const [risk, setRisk] = useState(0.20);
  const [lots, setLots] = useState(0.01);
  const [drawdown, setDrawdown] = useState(1.0);
  const [ddMode, setDdMode] = useState('pct');
  const [initialDrawdown, setInitialDrawdown] = useState(1.0);
  const [initialLots, setInitialLots] = useState(0.01);

  // Sync with current values when modal opens
  useEffect(() => {
    if (isOpen && currentRisk != null) {
      setRisk(currentRisk);
      setTab(currentRisk > BASE_MAX ? 'pro' : 'base');
    }
    if (isOpen) {
      const dd = currentDrawdown || 1.0;
      setDrawdown(dd);
      setInitialDrawdown(dd);
      setDdMode('pct');
      const l = currentLots > 0 ? currentLots : MIN_LOTS;
      setLots(l);
      setInitialLots(currentLots);
    }
  }, [isOpen, currentRisk, currentDrawdown, currentLots]);

  if (!isOpen) return null;

  const eq = equity || 0;
  const effectiveMaxLots = maxLots > 0 ? maxLots : 10.0;

  // Drawdown conversions
  const ddDollar = eq * (drawdown / 100);
  const pctFromDollar = (eur) => eq > 0 ? (eur / eq) * 100 : 0;

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    if (newTab === 'base' && risk > BASE_MAX) setRisk(BASE_MAX);
  };

  const handleDdSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    const snapped = Math.round(val * 10) / 10;
    setDrawdown(Math.max(DD_MIN, Math.min(snapped, DD_MAX)));
  };

  const handleDdDollarChange = (e) => {
    const eur = parseFloat(e.target.value);
    if (isNaN(eur) || eur <= 0) return;
    const pct = pctFromDollar(eur);
    const clamped = Math.max(DD_MIN, Math.min(pct, DD_MAX));
    setDrawdown(Math.round(clamped * 10) / 10);
  };

  // Lots handlers
  const adjustLots = (delta) => {
    setLots(prev => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.max(MIN_LOTS, Math.min(next, effectiveMaxLots));
    });
  };

  const adjustDrawdown = (delta) => {
    setDrawdown(prev => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.max(DD_MIN, Math.min(next, DD_MAX));
    });
  };

  // P&L calculator for lots
  const calcLotsPnL = (lotSize) => {
    if (!atrValue || !tickSize || !tickValue || tickSize === 0) return null;
    const slDistance = SL_TREND_MULT * atrValue;
    const tpDistance = TP_TREND_MULT * atrValue;
    const lossAtSL = lotSize * (slDistance / tickSize) * tickValue;
    const gainAtTP = lotSize * (tpDistance / tickSize) * tickValue;
    return { lossAtSL, gainAtTP };
  };

  // P&L calculator for risk% (BASE tab)
  const calcRiskPnL = (riskPct) => {
    const preset = presets?.[activePreset];
    if (!preset || !eq) return null;
    const riskDollar = eq * (riskPct / 100);
    const gainDollar = riskDollar * ((preset.tp_atr_mult || 1) / (preset.sl_atr_mult || 1));
    return { riskDollar, gainDollar };
  };

  const PnLDisplay = ({ riskPct }) => {
    const pnl = calcRiskPnL(riskPct);
    if (!pnl) return null;
    return (
      <div className="flex justify-between items-center px-1 mt-2 mb-1">
        <span className="font-mono text-red-400/80" style={{ fontSize: '11px' }}>
          SL: -€{pnl.riskDollar.toFixed(2)}
        </span>
        <span className="font-mono text-emerald-400/80" style={{ fontSize: '11px' }}>
          TP: +€{pnl.gainDollar.toFixed(2)}
        </span>
      </div>
    );
  };

  const riskChanged = tab === 'base' && Math.abs(risk - (currentRisk || 0)) > 0.005;
  const lotsChanged = tab === 'pro' && Math.abs(lots - initialLots) > 0.005;
  const ddChanged = Math.abs(drawdown - initialDrawdown) > 0.05;
  const hasChanges = riskChanged || lotsChanged || ddChanged;

  const handleApply = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    if (riskChanged) {
      await onApply(parseFloat(risk.toFixed(2)));
    }
    if (lotsChanged && onApplyLots) {
      await onApplyLots(parseFloat(lots.toFixed(2)));
    }
    if (ddChanged && onApplyDrawdown) {
      await onApplyDrawdown(parseFloat(drawdown.toFixed(1)));
    }
    onClose();
  };

  const ddSliderPercent = ((drawdown - DD_MIN) / (DD_MAX - DD_MIN)) * 100;

  // Button label
  const getButtonLabel = () => {
    if (loading) return 'Applicando...';
    const parts = [];
    if (riskChanged) parts.push('Rischio');
    if (lotsChanged) parts.push('Lotti');
    if (ddChanged) parts.push('Drawdown');
    if (parts.length === 0) return 'Nessuna modifica';
    return `Applica ${parts.join(' + ')}`;
  };

  const lotsPnl = calcLotsPnL(lots);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 rounded-t-3xl w-full max-w-md border-t border-zinc-800 animate-slide-up flex flex-col" style={{ maxHeight: '85dvh' }}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0">
          <h3 className="text-white font-bold text-lg">Impostazioni Trade</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 flex-1 min-h-0">
          {/* Tab Selector */}
          <div className="flex bg-zinc-800 rounded-xl p-1 mb-5">
            <button
              onClick={() => handleTabSwitch('base')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'base'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Base
            </button>
            <button
              onClick={() => handleTabSwitch('pro')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'pro'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Pro
            </button>
          </div>

          {/* BASE: Risk % with 3 buttons */}
          {tab === 'base' && (
            <div className="mb-4">
              <div className="text-center mb-5">
                <span className="text-4xl font-bold text-white">{risk.toFixed(1)}</span>
                <span className="text-xl text-zinc-500 ml-1">%</span>
              </div>
              <div className="flex gap-2">
                {QUICK_SELECT.map((val) => (
                  <button
                    key={val}
                    onClick={() => setRisk(val)}
                    className={`flex-1 py-3 rounded-xl text-base font-semibold transition-all border ${
                      Math.abs(risk - val) < 0.005
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              <PnLDisplay riskPct={risk} />
            </div>
          )}

          {/* PRO: Fixed Lots */}
          {tab === 'pro' && (
            <div className="mb-4">
              <h4 className="text-zinc-400 text-sm font-semibold mb-3">Lotti Fissi</h4>

              {/* Lots display */}
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-white">{lots.toFixed(2)}</span>
                <span className="text-xl text-zinc-500 ml-1">lots</span>
              </div>

              {/* +/- buttons */}
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => adjustLots(-LOT_STEP)}
                  className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-all flex items-center justify-center active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="range"
                  min={MIN_LOTS}
                  max={effectiveMaxLots}
                  step={LOT_STEP}
                  value={lots}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const snapped = Math.round(val * 100) / 100;
                    setLots(Math.max(MIN_LOTS, Math.min(snapped, effectiveMaxLots)));
                  }}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #ef4444 ${((lots - MIN_LOTS) / (effectiveMaxLots - MIN_LOTS)) * 100}%, #3f3f46 ${((lots - MIN_LOTS) / (effectiveMaxLots - MIN_LOTS)) * 100}%, #3f3f46 100%)`
                  }}
                />
                <button
                  onClick={() => adjustLots(LOT_STEP)}
                  className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-all flex items-center justify-center active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>{MIN_LOTS}</span>
                <span>Max: {effectiveMaxLots.toFixed(2)}</span>
              </div>

              {/* P&L Estimator */}
              {lotsPnl && (
                <div className="mt-3 bg-zinc-800/50 rounded-xl px-4 py-3">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Stima P&L</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-zinc-500 text-xs">@ SL ({SL_TREND_MULT}x ATR)</span>
                      <p className="font-mono text-red-400 text-sm">-€{lotsPnl.lossAtSL.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500 text-xs">@ TP ({TP_TREND_MULT}x ATR)</span>
                      <p className="font-mono text-emerald-400 text-sm">+€{lotsPnl.gainAtTP.toFixed(2)}</p>
                    </div>
                  </div>
                  {atrValue > 0 && (
                    <p className="text-zinc-600 text-[10px] mt-2 text-center">
                      ATR: {atrValue.toFixed(2)} | Prezzo: {currentPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
              {!lotsPnl && (
                <div className="mt-3 bg-zinc-800/50 rounded-xl px-4 py-3 text-center">
                  <p className="text-zinc-600 text-xs">In attesa dati dal bot...</p>
                </div>
              )}
            </div>
          )}

          {/* === DRAWDOWN SECTION === */}
          <div className="border-t border-zinc-800 mt-2 pt-4 mb-4">
            <h4 className="text-zinc-400 text-sm font-semibold mb-3">Max Perdita Giornaliera</h4>

            {tab === 'base' && (
              /* Base: read-only display */
              <div className="bg-zinc-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-white font-mono text-lg">{drawdown.toFixed(1)}%</span>
                <span className="text-zinc-500 font-mono text-sm">€{ddDollar.toFixed(2)}</span>
              </div>
            )}

            {tab === 'pro' && (
              /* Pro: editable with toggle */
              <div>
                {/* Mode toggle pills */}
                <div className="flex bg-zinc-800 rounded-lg p-0.5 mb-3 w-fit">
                  <button
                    onClick={() => setDdMode('pct')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      ddMode === 'pct'
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    %
                  </button>
                  <button
                    onClick={() => setDdMode('eur')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      ddMode === 'eur'
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    €
                  </button>
                </div>

                {ddMode === 'pct' ? (
                  /* Percentage mode: slider + buttons */
                  <div className="px-1">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-2xl font-bold text-white">{drawdown.toFixed(1)}%</span>
                      <span className="text-zinc-500 font-mono text-sm">€{ddDollar.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => adjustDrawdown(-0.1)}
                        className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-all flex items-center justify-center active:scale-95"
                      >
                        <Minus size={18} />
                      </button>
                      <input
                        type="range"
                        min={DD_MIN}
                        max={DD_MAX}
                        step={DD_STEP}
                        value={drawdown}
                        onChange={handleDdSliderChange}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #f59e0b 0%, #ef4444 ${ddSliderPercent}%, #3f3f46 ${ddSliderPercent}%, #3f3f46 100%)`
                        }}
                      />
                      <button
                        onClick={() => adjustDrawdown(0.1)}
                        className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-all flex items-center justify-center active:scale-95"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-600 mt-1">
                      <span>{DD_MIN}%</span>
                      <span>{DD_MAX}%</span>
                    </div>
                  </div>
                ) : (
                  /* Euro mode: input */
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">€</span>
                        <input
                          type="number"
                          step="0.5"
                          min={(eq * DD_MIN / 100).toFixed(2)}
                          max={(eq * DD_MAX / 100).toFixed(2)}
                          value={ddDollar.toFixed(2)}
                          onChange={handleDdDollarChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-7 pr-3 py-3 text-white font-mono text-lg focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                      <span className="text-zinc-500 font-mono text-sm whitespace-nowrap">{drawdown.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pt-4 pb-6 shrink-0 safe-area-bottom">
          <button
            onClick={handleApply}
            disabled={loading || !hasChanges}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold py-3.5 rounded-2xl transition-all text-base"
          >
            {getButtonLabel()}
          </button>
          <p className="text-zinc-600 text-xs text-center mt-3">
            Effettivo dal prossimo trade
          </p>
        </div>
      </div>
    </div>
  );
}

// Keep backward-compatible default export
export default RiskModal;
