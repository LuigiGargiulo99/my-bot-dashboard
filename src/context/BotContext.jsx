import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const BotContext = createContext(null);

export function BotProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [trades, setTrades] = useState([]);
  const [events, setEvents] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commandPending, setCommandPending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());

  // Fetch status
  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await api.getStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('fetchStatus failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch trades
  const fetchTrades = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await api.getTrades({ limit: 1000 });
      setTrades(data);
    } catch (err) {
      console.error('Failed to fetch trades:', err);
    }
  }, [isAuthenticated]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await api.getEvents({ limit: 50 });
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }, [isAuthenticated]);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await api.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  }, [isAuthenticated]);

  // Poll status every 5 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchStatus();
    fetchTrades();
    fetchEvents();
    fetchConfig();

    const statusInterval = setInterval(fetchStatus, 5000);
    const tradesInterval = setInterval(fetchTrades, 30000);
    const eventsInterval = setInterval(fetchEvents, 15000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(tradesInterval);
      clearInterval(eventsInterval);
    };
  }, [isAuthenticated, fetchStatus, fetchTrades, fetchEvents, fetchConfig]);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setIsAuthenticated(false);
      setStatus(null);
      setTrades([]);
      setEvents([]);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  // Command wrapper
  const sendCommand = async (commandFn) => {
    setCommandPending(true);
    try {
      await commandFn();
      // Immediately fetch new status
      await fetchStatus();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCommandPending(false);
    }
  };

  // Command handlers
  const pause = () => sendCommand(() => api.pause());
  const resume = () => sendCommand(() => api.resume());
  const switchPreset = (preset) => sendCommand(() => api.switchPreset(preset));
  const setRisk = (riskPercent) => sendCommand(() => api.setRisk(riskPercent));
  const setDrawdown = (pct) => sendCommand(() => api.setDrawdown(pct));
  const kill = () => sendCommand(() => api.kill());
  const forceClose = () => sendCommand(() => api.forceClose());

  // Auth handlers
  const login = async (username, password) => {
    setLoading(true);
    try {
      await api.login(username, password);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setIsAuthenticated(false);
    setStatus(null);
    setTrades([]);
    setEvents([]);
    setError(null);
  };

  const value = {
    // State
    status,
    trades,
    events,
    config,
    loading,
    error,
    commandPending,
    isAuthenticated,
    // Commands
    pause,
    resume,
    switchPreset,
    setRisk,
    setDrawdown,
    kill,
    forceClose,
    // Auth
    login,
    logout,
    // Refresh
    refreshStatus: fetchStatus,
    refreshTrades: fetchTrades,
    refreshEvents: fetchEvents,
  };

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
}

export function useBot() {
  const context = useContext(BotContext);
  if (!context) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
}
