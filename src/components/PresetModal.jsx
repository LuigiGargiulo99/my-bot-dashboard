import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BASE_MAX = 40;
const PRO_MAX = 60;
const MIN_RISK = 0.01;
const QUICK_SELECT = [0.1, 0.2, 0.3];

export function RiskModal({ isOpen, currentRisk, onApply, onClose, loading = false }) {
  const [tab, setTab] = useState('base');
  const [risk, setRisk] = useState(0.20);

  // Sync with current risk when modal opens
  useEffect(() => {
    if (isOpen && currentRisk != null) {
      setRisk(currentRisk);
      // Auto-select tab based on current risk
      setTab(currentRisk > BASE_MAX ? 'pro' : 'base');
    }
  }, [isOpen, currentRisk]);

  if (!isOpen) return null;

  const maxRisk = tab === 'pro' ? PRO_MAX : BASE_MAX;

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setRisk(Math.min(val, maxRisk));
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '' || raw === '.') return;
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      setRisk(Math.max(MIN_RISK, Math.min(val, maxRisk)));
    }
  };

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    const newMax = newTab === 'pro' ? PRO_MAX : BASE_MAX;
    if (risk > newMax) setRisk(newMax);
  };

  const handleApply = () => {
    onApply(parseFloat(risk.toFixed(2)));
  };

  // Slider gradient position
  const sliderPercent = ((risk - MIN_RISK) / (maxRisk - MIN_RISK)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 rounded-t-3xl p-6 w-full max-w-md border-t border-zinc-800 animate-slide-up safe-area-bottom">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-bold text-lg">Rischio per Trade</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

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

        {/* Quick Select (Base only) */}
        {tab === 'base' && (
          <div className="flex gap-2 mb-4">
            {QUICK_SELECT.map((val) => (
              <button
                key={val}
                onClick={() => setRisk(val)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                  Math.abs(risk - val) < 0.005
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        )}

        {/* Current Risk Display */}
        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-white">{risk.toFixed(2)}</span>
          <span className="text-xl text-zinc-500 ml-1">%</span>
        </div>

        {/* Slider */}
        <div className="px-1 mb-2">
          <input
            type="range"
            min={MIN_RISK}
            max={maxRisk}
            step={0.01}
            value={risk}
            onChange={handleSliderChange}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, ${tab === 'pro' ? '#ef4444' : '#f59e0b'} ${sliderPercent}%, #3f3f46 ${sliderPercent}%, #3f3f46 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>{MIN_RISK}%</span>
            <span>{maxRisk}%</span>
          </div>
        </div>

        {/* Numeric Input */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <input
            type="number"
            min={MIN_RISK}
            max={maxRisk}
            step={0.01}
            value={risk.toFixed(2)}
            onChange={handleInputChange}
            className="w-28 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-center text-white font-medium focus:outline-none focus:border-emerald-500/50"
          />
          <span className="text-zinc-500 text-sm">% equity</span>
        </div>

        {/* Max Risk Warning */}
        <p className="text-red-400 text-xs text-center font-medium mb-5">
          Rischio massimo per trade: {maxRisk}% dell'equity
        </p>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold py-3.5 rounded-2xl transition-all text-base"
        >
          {loading ? 'Applicando...' : 'Applica'}
        </button>

        {/* Info */}
        <p className="text-zinc-600 text-xs text-center mt-3">
          Effettivo dal prossimo trade
        </p>
      </div>
    </div>
  );
}

// Keep backward-compatible default export
export default RiskModal;
