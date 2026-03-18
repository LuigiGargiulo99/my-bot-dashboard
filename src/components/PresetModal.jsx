import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BASE_MAX = 0.3;
const PRO_MAX = 1.0;
const MIN_RISK = 0.1;
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
    // Snap to nearest 0.1
    const snapped = Math.round(val * 10) / 10;
    setRisk(Math.max(MIN_RISK, Math.min(snapped, maxRisk)));
  };

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    const newMax = newTab === 'pro' ? PRO_MAX : BASE_MAX;
    if (risk > newMax) setRisk(newMax);
    // When switching to PRO, snap to nearest 0.1
    if (newTab === 'pro') {
      setRisk(prev => Math.round(Math.max(MIN_RISK, Math.min(prev, newMax)) * 10) / 10);
    }
  };

  const handleApply = () => {
    onApply(parseFloat(risk.toFixed(2)));
  };

  // Slider gradient position
  const sliderPercent = ((risk - MIN_RISK) / (maxRisk - MIN_RISK)) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — max 85dvh, scrollable body, sticky footer */}
      <div className="relative bg-zinc-900 rounded-t-3xl w-full max-w-md border-t border-zinc-800 animate-slide-up flex flex-col" style={{ maxHeight: '85dvh' }}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0">
          <h3 className="text-white font-bold text-lg">Rischio per Trade</h3>
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

          {/* Current Risk Display */}
          <div className="text-center mb-5">
            <span className="text-4xl font-bold text-white">{risk.toFixed(1)}</span>
            <span className="text-xl text-zinc-500 ml-1">%</span>
          </div>

          {/* BASE: only 3 buttons */}
          {tab === 'base' && (
            <div className="flex gap-2 mb-4">
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
          )}

          {/* PRO: slider 0.1 - 1.0, step 0.1 */}
          {tab === 'pro' && (
            <div className="px-1 mb-4">
              <input
                type="range"
                min={MIN_RISK}
                max={PRO_MAX}
                step={0.1}
                value={risk}
                onChange={handleSliderChange}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #ef4444 ${sliderPercent}%, #3f3f46 ${sliderPercent}%, #3f3f46 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>{MIN_RISK}%</span>
                <span>{PRO_MAX}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer — always visible, never hidden behind bottom nav */}
        <div className="px-6 pt-4 pb-6 shrink-0 safe-area-bottom">
          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold py-3.5 rounded-2xl transition-all text-base"
          >
            {loading ? 'Applicando...' : 'Applica'}
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
