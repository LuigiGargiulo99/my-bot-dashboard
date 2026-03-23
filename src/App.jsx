import React, { useState, useMemo, Component } from 'react';
import { BotProvider, useBot } from './context/BotContext';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import ConfirmDialog from './components/ConfirmDialog';
import RiskModal from './components/PresetModal';

import AccountOverviewWidget from './components/widgets/AccountOverviewWidget';
import TradeStatusWidget from './components/widgets/TradeStatusWidget';
import DiagnosticsWidget from './components/widgets/DiagnosticsWidget';
import ControlPanelWidget from './components/widgets/ControlPanelWidget';
import TradesView from './components/TradesView';

// --- Loading & Error + Mobile Nav Icons ---
import { RefreshCw, AlertTriangle, Activity, History, Settings } from 'lucide-react';

// --- Error Boundary: catches React rendering crashes ---
class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('React crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-lg font-bold mb-2">Dashboard Crashed</h2>
            <p className="text-red-400 text-sm font-mono mb-4 break-all">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingOverlay = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
  </div>
);

const ErrorBanner = ({ message, onRetry }) => (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <AlertTriangle size={18} className="text-red-400" />
      <span className="text-red-400 text-sm">{message}</span>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="text-red-400 hover:text-red-300">
        <RefreshCw size={18} />
      </button>
    )}
  </div>
);

// --- VIEWS ---

const DashboardView = () => {
  const { status, config, trades, commandPending, pause, resume, setRisk, setDrawdown, kill, forceClose, error, refreshStatus } = useBot();
  const [showKillConfirm, setShowKillConfirm] = useState(false);
  const [showForceCloseConfirm, setShowForceCloseConfirm] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);

  // ALL hooks must be called before any early return
  const closedTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    return trades.filter(t => t.status === 'CLOSED' && t.pnl != null);
  }, [trades]);

  const winRate = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    const profitable = closedTrades.filter(t => t.pnl > 0).length;
    const rate = (profitable / closedTrades.length) * 100;
    return rate.toFixed(0);
  }, [closedTrades]);

  // Derive last closed trade from trades array (fallback for when trade_event POST fails)
  const lastClosedTrade = useMemo(() => {
    if (closedTrades.length === 0) return null;
    return closedTrades[0]; // Already sorted by exit_time desc from backend
  }, [closedTrades]);

  if (!status) return <LoadingOverlay />;

  const isRunning = status.status === 'RUNNING' || status.status === 'IN_TRADE' || status.status === 'COOLDOWN';
  const hasPosition = status.position?.has_position || false;

  return (
    <div className="animate-fade-in">
      {error && <ErrorBanner message={error} onRetry={refreshStatus} />}

      {/* Bento Grid Layout - stacks vertically on mobile, 3-4 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">

        {/* Account Overview - full width on mobile */}
        <div className="lg:col-span-1 xl:col-span-2">
          <AccountOverviewWidget
            status={status}
            trades={trades}
            winRate={winRate}
          />
        </div>

        {/* Position + Diagnostics */}
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-1 xl:col-span-1">
          <div className="flex-1">
            <TradeStatusWidget
              status={status}
              lastTrade={status.last_trade?.side ? status.last_trade : lastClosedTrade}
            />
          </div>
          <div className="min-h-[256px]">
            <DiagnosticsWidget status={status} config={config} />
          </div>
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-1 xl:col-span-1">
          <ControlPanelWidget
            isRunning={isRunning}
            isPaused={status.status === 'PAUSED'}
            isDailyStop={status.status === 'DAILY_STOP'}
            hasPosition={hasPosition}
            commandPending={commandPending}
            pause={pause}
            resume={resume}
            kill={() => setShowKillConfirm(true)}
            forceClose={() => setShowForceCloseConfirm(true)}
            onPresetClick={() => setShowPresetModal(true)}
          />
        </div>

      </div>

      {/* Modals */}
      <ConfirmDialog
        isOpen={showForceCloseConfirm}
        title="Force Close Position"
        message="This will immediately close the current open position. Are you sure?"
        variant="warning"
        confirmText="Close Position"
        onConfirm={async () => { await forceClose(); setShowForceCloseConfirm(false); }}
        onCancel={() => setShowForceCloseConfirm(false)}
        loading={commandPending}
      />

      <ConfirmDialog
        isOpen={showKillConfirm}
        title="Kill Switch"
        message="This will immediately close all open positions and pause the bot."
        variant="danger"
        confirmText="Kill All"
        onConfirm={async () => { await kill(); setShowKillConfirm(false); }}
        onCancel={() => setShowKillConfirm(false)}
        loading={commandPending}
      />

      <RiskModal
        isOpen={showPresetModal}
        currentRisk={status.risk_percent}
        currentDrawdown={status.max_daily_loss_pct}
        equity={status.equity}
        activePreset={status.active_preset}
        presets={config?.presets}
        onApply={async (riskPercent) => { await setRisk(riskPercent); }}
        onApplyDrawdown={async (pct) => { await setDrawdown(pct); }}
        onClose={() => setShowPresetModal(false)}
        loading={commandPending}
      />
    </div>
  );
};

// Placeholder for tabs not yet implemented
const PlaceholderView = ({ title }) => (
  <div className="flex items-center justify-center min-h-[50vh] text-zinc-600 border border-white/5 bg-[#11151a] rounded-3xl">
    {title}
  </div>
);

// --- MAIN APP SHELL ---
function AppContent() {
  const { isAuthenticated, logout } = useBot();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b] text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />

      <div className="flex-1 flex flex-col relative overflow-hidden pb-20 md:pb-0">
        <Topbar />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'trades' && <TradesView />}
            {activeTab === 'settings' && <PlaceholderView title="Settings" />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - 44px min touch targets */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
        <div className="flex justify-around items-center px-2 py-1">
          {[
            { id: 'dashboard', icon: Activity, label: 'Dashboard' },
            { id: 'trades', icon: History, label: 'Trades' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] rounded-xl transition-colors active:scale-95 ${activeTab === id ? 'text-emerald-400' : 'text-zinc-500'}`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundaryClass>
      <BotProvider>
        <AppContent />
      </BotProvider>
    </ErrorBoundaryClass>
  );
}
