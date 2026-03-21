// API Service for Bot Trading Control Plane
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',  // Bypass ngrok "Visit Site" banner
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.token = null;
        localStorage.removeItem('authToken');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error('Session expired');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      // Guard against ngrok returning HTML instead of JSON
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response (ngrok interstitial?)');
      }

      return response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server');
      }
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true',  // Bypass ngrok banner
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('authToken', this.token);
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Status (Dashboard)
  async getStatus() {
    return this.request('/api/v1/status');
  }

  // Commands
  async sendCommand(commandType, payload = null) {
    return this.request('/api/v1/command', {
      method: 'POST',
      body: JSON.stringify({ type: commandType, payload }),
    });
  }

  async pause() {
    return this.sendCommand('pause');
  }

  async resume() {
    return this.sendCommand('resume');
  }

  async switchPreset(preset) {
    return this.sendCommand('switch_profile', { preset });
  }

  async setRisk(riskPercent) {
    return this.sendCommand('set_risk', { risk_percent: riskPercent });
  }

  async setDrawdown(pct) {
    return this.sendCommand('set_drawdown', { max_daily_loss_pct: pct });
  }

  async kill() {
    return this.sendCommand('kill');
  }

  async forceClose() {
    return this.sendCommand('force_close');
  }

  // Trades
  async getTrades(params = {}) {
    const query = new URLSearchParams();
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);

    const queryStr = query.toString();
    return this.request(`/api/v1/trades${queryStr ? '?' + queryStr : ''}`);
  }

  // Events
  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.level) query.append('level', params.level);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);

    const queryStr = query.toString();
    return this.request(`/api/v1/events${queryStr ? '?' + queryStr : ''}`);
  }

  // Config
  async getConfig() {
    return this.request('/api/v1/config');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService();
export default api;
