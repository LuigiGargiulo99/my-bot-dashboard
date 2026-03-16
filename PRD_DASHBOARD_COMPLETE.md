# PRD - Dashboard Trading Bot - Documentazione Completa

**Versione**: 3.0.0
**Data**: 2026-02-26
**Progetto**: MT5 Trading Bot Control Panel
**Obiettivo**: Documentazione dettagliata della dashboard per rigenerazione completa

---

## 📑 INDICE

1. [Overview Generale](#1-overview-generale)
2. [Architettura Sistema](#2-architettura-sistema)
3. [Backend API - Dettaglio Completo](#3-backend-api---dettaglio-completo)
4. [Frontend Dashboard - Dettaglio Completo](#4-frontend-dashboard---dettaglio-completo)
5. [Flussi di Dati](#5-flussi-di-dati)
6. [Database Schema](#6-database-schema)
7. [File Listing Completo](#7-file-listing-completo)
8. [Specifiche UI/UX](#8-specifiche-uiux)
9. [Esempi API Request/Response](#9-esempi-api-requestresponse)

---

## 1. OVERVIEW GENERALE

### 1.1 Scopo della Dashboard

La dashboard è un'applicazione web **real-time** per monitorare e controllare remotamente un Expert Advisor (EA) di trading su MetaTrader 5. Permette di:

- **Monitorare** lo stato del bot in tempo reale (status, equity, PnL, posizioni)
- **Controllare** il bot (pause/resume, cambio preset, force close, kill switch)
- **Visualizzare** lo storico trade e gli eventi di sistema
- **Autenticare** l'utente tramite JWT token
- **Ricevere notifiche** sullo stato del bot (heartbeat check)

### 1.2 Stack Tecnologico

**Frontend**:
- React 19.2.0
- Vite (build tool)
- Vanilla CSS con Tailwind-like utility classes
- lucide-react (icone)
- Context API per state management
- Fetch API per chiamate HTTP

**Backend**:
- FastAPI 0.109.0 (Python)
- SQLAlchemy 2.0.25 (async)
- SQLite database (bot.db)
- JWT authentication (python-jose)
- Telegram notifications (python-telegram-bot 20.7)
- Uvicorn (ASGI server)

**Comunicazione**:
- REST API (JSON)
- Polling ogni 5 secondi per status
- JWT Bearer token per autenticazione
- CORS abilitato per sviluppo locale

### 1.3 Flusso Operativo

```
┌──────────────┐         HTTP/JSON          ┌──────────────┐
│              │  ←───────────────────────→  │              │
│   Frontend   │     Polling (5s)            │   Backend    │
│   (React)    │     JWT Auth                │  (FastAPI)   │
│              │                             │              │
└──────────────┘                             └──────┬───────┘
                                                    │
                                                    ↓
                                             ┌──────────────┐
                                             │   SQLite     │
                                             │   (bot.db)   │
                                             └──────────────┘
                                                    ↑
                                                    │ HTTP
                                             ┌──────┴───────┐
                                             │   MT5 EA     │
                                             │ (Heartbeat)  │
                                             └──────────────┘
```

---

## 2. ARCHITETTURA SISTEMA

### 2.1 Componenti Principali

#### Backend (Control Plane)
- **main.py**: FastAPI app, CORS, lifespan management, heartbeat monitor
- **routers/gui.py**: Endpoints per la dashboard (status, commands, trades, events)
- **routers/ea.py**: Endpoints per l'EA (heartbeat, commands, trade_event)
- **routers/auth.py**: Login JWT
- **models/**: SQLAlchemy ORM models (bot_state, commands, trades, events)
- **services/telegram.py**: Notifiche Telegram
- **services/events.py**: Logging eventi di sistema

#### Frontend (Dashboard)
- **App.jsx**: Main component, routing tra views, bottom navigation
- **BotContext.jsx**: State management globale, polling status
- **api.js**: Service layer per chiamate API
- **components/**: LoginForm, ConfirmDialog, PresetModal
- **views**: Dashboard, Trades, Events, Settings (embedded in App.jsx)

### 2.2 Pattern Architetturali

**Backend**:
- REST API con routing modulare
- Dependency injection (FastAPI)
- Async/await per database e HTTP
- Singleton pattern per BotState (id=1)
- Background task per heartbeat monitoring

**Frontend**:
- Component-based architecture
- Context API per state sharing
- Controlled components
- Custom hooks (useBot)
- Polling pattern con cleanup

---

## 3. BACKEND API - DETTAGLIO COMPLETO

### 3.1 Struttura File Backend

```
my-bot-backend/
├── app/
│   ├── main.py                    # FastAPI app, CORS, lifespan, heartbeat monitor
│   ├── config.py                  # Settings da env vars
│   ├── database.py                # SQLAlchemy async engine
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── bot_state.py           # BotState model (singleton id=1)
│   │   ├── commands.py            # Command model
│   │   ├── trades.py              # Trade model
│   │   ├── events.py              # Event model
│   │   ├── user.py                # User model
│   │   └── tenant.py              # Tenant model (multi-tenancy)
│   │
│   ├── schemas/
│   │   ├── auth.py                # LoginRequest, TokenResponse
│   │   ├── command.py             # CommandRequest, CommandResponse, CommandAckRequest
│   │   ├── heartbeat.py           # HeartbeatRequest, HeartbeatResponse
│   │   ├── status.py              # StatusResponse, FiltersStatus, PositionInfo, LastTradeInfo
│   │   ├── trade.py               # TradeEventRequest, TradeResponse
│   │   └── event.py               # EventResponse
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                # POST /api/v1/auth/login
│   │   ├── gui.py                 # Endpoints dashboard
│   │   └── ea.py                  # Endpoints EA
│   │
│   ├── services/
│   │   ├── telegram.py            # TelegramService
│   │   └── events.py              # EventService
│   │
│   └── utils/
│       └── auth.py                # JWT helpers, get_current_user
│
├── .env                           # Environment variables
├── requirements.txt
├── bot.db                         # SQLite database (generato al runtime)
└── README.md
```

### 3.2 Database Models

#### BotState (models/bot_state.py)

Tabella **singleton** (id=1) che contiene lo stato corrente del bot.

```python
class BotState(Base):
    __tablename__ = "bot_state"

    # Identification
    id = Column(Integer, primary_key=True, default=1)
    ea_id = Column(String(50), default="EURUSD_M5_MVP_01")

    # Status
    status = Column(String(20), default="INIT")  # INIT, RUNNING, IN_TRADE, COOLDOWN, PAUSED, DAILY_STOP, ERROR
    active_preset = Column(String(10), default="MED")  # LOW, MED, HIGH

    # Account metrics
    equity = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    daily_pnl = Column(Float, default=0.0)
    daily_pnl_percent = Column(Float, default=0.0)

    # Trade counters
    trades_today = Column(Integer, default=0)
    max_trades_today = Column(Integer, default=8)

    # Current market data
    spread_points = Column(Float, default=0.0)
    atr_points = Column(Float, default=0.0)
    last_signal = Column(String(20), default="NONE")

    # Filters status
    in_window = Column(Boolean, default=False)
    spread_ok = Column(Boolean, default=True)
    volatility_ok = Column(Boolean, default=True)
    trend_ok = Column(Boolean, default=True)
    in_cooldown = Column(Boolean, default=False)
    daily_stop_hit = Column(Boolean, default=False)
    cooldown_end = Column(DateTime, nullable=True)

    # Position info (if in trade)
    has_position = Column(Boolean, default=False)
    position_side = Column(String(10), nullable=True)  # BUY, SELL
    position_ticket = Column(Integer, nullable=True)
    position_symbol = Column(String(20), nullable=True)
    position_open_price = Column(Float, nullable=True)
    position_size = Column(Float, nullable=True)
    position_sl = Column(Float, nullable=True)
    position_tp = Column(Float, nullable=True)
    position_open_time = Column(DateTime, nullable=True)
    position_pnl = Column(Float, nullable=True)

    # Last trade info
    last_trade_side = Column(String(10), nullable=True)
    last_trade_symbol = Column(String(20), nullable=True)
    last_trade_time = Column(DateTime, nullable=True)
    last_trade_pnl = Column(Float, nullable=True)
    last_trade_exit_reason = Column(String(30), nullable=True)

    # Heartbeat
    last_heartbeat = Column(DateTime, server_default=func.now())
    ea_version = Column(String(20), default="1.0.0")

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
```

**Aggiornamento**: Ogni 30 secondi l'EA invia un heartbeat POST /api/v1/ea/heartbeat che aggiorna questa tabella.

#### Trade (models/trades.py)

Registra ogni trade aperto e chiuso.

```python
class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket = Column(Integer, unique=True, index=True)
    symbol = Column(String(20), default="EURUSD")

    # Trade details
    side = Column(String(10))  # BUY, SELL
    size = Column(Float)
    entry_price = Column(Float)
    exit_price = Column(Float, nullable=True)
    sl = Column(Float)
    tp = Column(Float)

    # P&L
    pnl = Column(Float, nullable=True)
    pnl_pips = Column(Float, nullable=True)
    pnl_percent = Column(Float, nullable=True)

    # Timing
    entry_time = Column(DateTime)
    exit_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Context
    exit_reason = Column(String(30), nullable=True)  # TP, SL, TIME_STOP, FORCE_CLOSE, KILL
    entry_signal = Column(String(100), nullable=True)
    entry_context = Column(JSON, nullable=True)
    preset_used = Column(String(10))  # LOW, MED, HIGH

    # Status
    status = Column(String(20), default="OPEN")  # OPEN, CLOSED

    created_at = Column(DateTime, server_default=func.now())
```

#### Event (models/events.py)

Log eventi di sistema.

```python
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, server_default=func.now(), index=True)
    level = Column(String(10), index=True)  # INFO, WARN, ERROR, SUCCESS
    source = Column(String(20), default="BACKEND")  # EA, BACKEND, GUI
    code = Column(String(50), index=True)
    message = Column(String(500))
    context = Column(JSON, nullable=True)

    # Related entities
    trade_ticket = Column(Integer, nullable=True)
    command_id = Column(Integer, nullable=True)
```

#### Command (models/commands.py)

Coda comandi inviati dalla GUI all'EA.

```python
class Command(Base):
    __tablename__ = "commands"

    id = Column(Integer, primary_key=True, autoincrement=True)
    command_type = Column(String(30))  # pause, resume, switch_profile, kill, force_close
    payload = Column(JSON, nullable=True)  # es. {"preset": "LOW"}

    status = Column(String(20), default="pending")  # pending, sent, acked, failed

    created_at = Column(DateTime, server_default=func.now())
    sent_at = Column(DateTime, nullable=True)
    acked_at = Column(DateTime, nullable=True)

    ack_result = Column(String(20), nullable=True)  # success, error
    ack_reason = Column(String(200), nullable=True)
```

### 3.3 API Endpoints - GUI Router (routers/gui.py)

Tutti gli endpoint richiedono JWT authentication (header: `Authorization: Bearer <token>`).

#### GET /api/v1/status

**Scopo**: Recupera lo stato corrente del bot (polled ogni 5 secondi dalla dashboard).

**Auth**: Requires JWT token

**Query params**: Nessuno

**Response**: `StatusResponse`

```json
{
  "ea_id": "EURUSD_M5_MVP_01",
  "status": "RUNNING",
  "active_preset": "MED",
  "equity": 10245.67,
  "balance": 10000.00,
  "daily_pnl": 245.67,
  "daily_pnl_percent": 2.46,
  "trades_today": 3,
  "max_trades_today": 8,
  "spread_points": 1.2,
  "atr_points": 8.5,
  "last_signal": "LONG",
  "filters": {
    "in_window": true,
    "spread_ok": true,
    "volatility_ok": true,
    "trend_ok": true,
    "in_cooldown": false,
    "daily_stop": false,
    "cooldown_end": null
  },
  "position": {
    "has_position": true,
    "side": "BUY",
    "ticket": 123456789,
    "symbol": "EURUSD",
    "open_price": 1.08523,
    "size": 0.05,
    "sl": 1.08400,
    "tp": 1.08650,
    "open_time": "2026-02-26T10:15:00Z",
    "pnl": 15.50
  },
  "last_trade": {
    "side": "SELL",
    "symbol": "EURUSD",
    "time": "2026-02-26T09:45:00Z",
    "pnl": 12.30,
    "exit_reason": "TP"
  },
  "last_heartbeat": "2026-02-26T10:30:45Z",
  "heartbeat_ok": true,
  "ea_version": "2.0.0"
}
```

**Logica**:
1. Query `BotState` con id=1
2. Se non esiste, ritorna default status (NOT_CONNECTED)
3. Calcola `heartbeat_ok` confrontando `last_heartbeat` con threshold (120 secondi)
4. Costruisce `StatusResponse` con tutti i campi

#### POST /api/v1/command

**Scopo**: Invia un comando all'EA (pause, resume, switch_profile, kill, force_close).

**Auth**: Requires JWT token

**Body**: `CommandRequest`

```json
{
  "type": "pause",
  "payload": null
}
```

O per switch_profile:

```json
{
  "type": "switch_profile",
  "payload": {
    "preset": "HIGH"
  }
}
```

**Tipi validi**:
- `pause`: Ferma il trading (mantiene posizioni aperte)
- `resume`: Riprende il trading
- `switch_profile`: Cambia preset (LOW, MED, HIGH)
- `kill`: Chiude tutte le posizioni e mette in pausa
- `force_close`: Chiude la posizione corrente

**Response**: `CommandResponse`

```json
{
  "id": 42,
  "command_type": "pause",
  "payload": null,
  "status": "pending",
  "created_at": "2026-02-26T10:31:00Z",
  "acked_at": null,
  "ack_result": null,
  "ack_reason": null
}
```

**Logica**:
1. Valida `type` (deve essere uno dei 5 validi)
2. Se `switch_profile`, valida `payload.preset` (LOW, MED, HIGH)
3. Crea record `Command` con status "pending"
4. Salva su database
5. Logga evento con `EventService.info()`
6. Ritorna il comando creato

**Note**: L'EA recupera i comandi pending nel prossimo heartbeat (ogni 30s).

#### GET /api/v1/trades

**Scopo**: Recupera lo storico trade con filtri e paginazione.

**Auth**: Requires JWT token

**Query params**:
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)
- `status` (optional): Filter by status (OPEN, CLOSED)
- `limit` (default: 50, max: 200): Numero di risultati
- `offset` (default: 0): Offset per paginazione

**Response**: `list[TradeResponse]`

```json
[
  {
    "id": 123,
    "ticket": 987654321,
    "symbol": "EURUSD",
    "side": "BUY",
    "size": 0.05,
    "entry_price": 1.08500,
    "exit_price": 1.08620,
    "sl": 1.08380,
    "tp": 1.08650,
    "pnl": 12.50,
    "pnl_pips": 12.0,
    "pnl_percent": 0.12,
    "entry_time": "2026-02-26T09:30:00Z",
    "exit_time": "2026-02-26T09:50:00Z",
    "duration_seconds": 1200,
    "exit_reason": "TP",
    "preset_used": "MED",
    "status": "CLOSED"
  }
]
```

**Logica**:
1. Query `Trade` table con filtri opzionali
2. Order by `entry_time DESC`
3. Apply pagination (offset, limit)
4. Mappa a `TradeResponse` schema

#### GET /api/v1/events

**Scopo**: Recupera log eventi di sistema.

**Auth**: Requires JWT token

**Query params**:
- `level` (optional): Filter by level (INFO, WARN, ERROR, SUCCESS)
- `limit` (default: 50, max: 200)
- `offset` (default: 0)

**Response**: `list[EventResponse]`

```json
[
  {
    "id": 456,
    "timestamp": "2026-02-26T10:30:00Z",
    "level": "SUCCESS",
    "source": "EA",
    "code": "TRADE_OPEN",
    "message": "Opened BUY 0.05 lots EURUSD @ 1.08500",
    "context": {
      "entry_signal": "RSI<30 + BB_lower",
      "atr": 8.5
    }
  }
]
```

**Logica**:
1. Chiama `EventService.get_recent()` con filtri
2. Order by `timestamp DESC`
3. Apply pagination
4. Mappa a `EventResponse`

#### GET /api/v1/config

**Scopo**: Restituisce configurazione read-only (presets, trading window, limits).

**Auth**: Requires JWT token

**Response**:

```json
{
  "presets": {
    "LOW": {
      "risk_percent": 0.10,
      "max_trades": 20,
      "cooldown_minutes": 20,
      "sl_atr_mult": 1.5,
      "tp_atr_mult": 1.5
    },
    "MED": {
      "risk_percent": 0.20,
      "max_trades": 20,
      "cooldown_minutes": 20,
      "sl_atr_mult": 1.4,
      "tp_atr_mult": 1.5
    },
    "HIGH": {
      "risk_percent": 0.35,
      "max_trades": 20,
      "cooldown_minutes": 20,
      "sl_atr_mult": 1.3,
      "tp_atr_mult": 1.5
    }
  },
  "trading_window": {
    "morning_start": "09:00",
    "morning_end": "12:00",
    "afternoon_start": "14:30",
    "afternoon_end": "23:00",
    "force_close": "22:55",
    "timezone": "Europe/Rome"
  },
  "limits": {
    "max_daily_loss_percent": 1.0,
    "max_open_positions": 1,
    "max_spread_points": 15
  },
  "symbol": "EURUSD",
  "timeframe": "M5"
}
```

**Logica**: Ritorna configurazione hardcoded (non modificabile da GUI).

### 3.4 API Endpoints - Auth Router (routers/auth.py)

#### POST /api/v1/auth/login

**Scopo**: Autenticazione utente e generazione JWT token.

**Auth**: None (public endpoint)

**Body**: `application/x-www-form-urlencoded`

```
username=admin
password=changeme
```

**Response**: `TokenResponse`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Logica**:
1. Verifica username/password vs database (user table)
2. Se valido, genera JWT token con `python-jose`
3. Token include: `{"sub": username, "exp": timestamp}`
4. Ritorna token

**Error response** (401):

```json
{
  "detail": "Invalid credentials"
}
```

### 3.5 Background Tasks (main.py)

#### heartbeat_monitor()

Task asincrono che monitora il heartbeat dell'EA.

**Funzionamento**:
1. Esegue ogni 60 secondi (loop infinito)
2. Query `BotState` id=1
3. Se `last_heartbeat` < (now - 120 secondi):
   - Invia notifica Telegram
   - Crea Event (level=ERROR, code=HEARTBEAT_MISSING)
   - Alert rate-limited (cooldown 5 minuti)
4. Se heartbeat ritorna: logga ripristino

**Codice**:

```python
async def heartbeat_monitor():
    last_alert_sent = None
    alert_cooldown = 300  # 5 minutes

    while True:
        await asyncio.sleep(60)

        try:
            async with async_session() as session:
                result = await session.execute(select(BotState).where(BotState.id == 1))
                state = result.scalar_one_or_none()

                if state and state.last_heartbeat:
                    threshold = datetime.utcnow() - timedelta(seconds=120)

                    if state.last_heartbeat < threshold:
                        should_alert = (
                            last_alert_sent is None or
                            (datetime.utcnow() - last_alert_sent).total_seconds() > alert_cooldown
                        )

                        if should_alert:
                            await telegram_service.notify_heartbeat_missing(...)
                            # Create event
                            last_alert_sent = datetime.utcnow()
        except Exception as e:
            logger.error(f"Heartbeat monitor error: {e}")
```

### 3.6 Servizi

#### TelegramService (services/telegram.py)

Invia notifiche Telegram per eventi importanti.

**Metodi**:
- `notify_trade_open(data)`: Trade aperto
- `notify_trade_close(data)`: Trade chiuso
- `notify_daily_stop(equity, pnl, pnl_pct)`: Daily stop raggiunto
- `notify_heartbeat_missing(last_heartbeat)`: EA disconnesso
- `notify_order_error(msg, context)`: Errore ordine

**Configurazione** (.env):
```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
```

#### EventService (services/events.py)

Logging unificato eventi.

**Metodi**:
- `log(db, level, code, message, source="BACKEND", **kwargs)`
- `info(db, code, message, **kwargs)`: Wrapper per level=INFO
- `warn(db, code, message, **kwargs)`: Wrapper per level=WARN
- `error(db, code, message, **kwargs)`: Wrapper per level=ERROR
- `success(db, code, message, **kwargs)`: Wrapper per level=SUCCESS
- `get_recent(db, limit, offset, level=None)`: Query eventi

**Esempio**:

```python
await EventService.info(
    db,
    "COMMAND_SENT",
    f"Command '{type}' queued",
    source="GUI",
    command_id=cmd.id,
    context={"payload": payload}
)
```

### 3.7 Environment Variables (.env)

```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./bot.db

# Auth
SECRET_KEY=your-secret-key-here-change-me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme

# EA Authentication
EA_API_TOKEN=your-ea-api-token-here

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Heartbeat
EA_HEARTBEAT_TIMEOUT_SECONDS=120
```

---

## 4. FRONTEND DASHBOARD - DETTAGLIO COMPLETO

### 4.1 Struttura File Frontend

```
my-bot-dashboard/
├── src/
│   ├── main.jsx                   # React entry point
│   ├── App.jsx                    # Main component (700+ righe)
│   ├── App.css                    # (Unused, default Vite)
│   ├── index.css                  # Global styles
│   │
│   ├── components/
│   │   ├── LoginForm.jsx          # Form di login con JWT
│   │   ├── ConfirmDialog.jsx      # Dialog conferma azioni (kill, force_close)
│   │   └── PresetModal.jsx        # Modal cambio preset (LOW/MED/HIGH)
│   │
│   ├── context/
│   │   └── BotContext.jsx         # Context API + polling logic
│   │
│   ├── services/
│   │   └── api.js                 # ApiService class per chiamate HTTP
│   │
│   └── assets/
│       └── react.svg
│
├── public/
│   └── vite.svg
│
├── index.html                     # HTML entry point
├── package.json
├── vite.config.js
└── .env                           # VITE_API_URL
```

### 4.2 Services Layer - api.js

Classe singleton che gestisce tutte le chiamate API.

**File**: `src/services/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',  // Per ngrok tunnels
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

      // Handle 401 Unauthorized
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
        'ngrok-skip-browser-warning': 'true',
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
```

**Features**:
- JWT token storage in localStorage
- Auto-logout su 401
- Error handling unificato
- Ngrok compatibility header
- Singleton pattern

### 4.3 Context - BotContext.jsx

State management globale con polling automatico.

**File**: `src/context/BotContext.jsx`

```javascript
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch trades
  const fetchTrades = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await api.getTrades({ limit: 50 });
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

    const statusInterval = setInterval(fetchStatus, 5000);   // 5s
    const tradesInterval = setInterval(fetchTrades, 30000);  // 30s
    const eventsInterval = setInterval(fetchEvents, 15000);  // 15s

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
```

**Features**:
- Polling automatico con cleanup
- Command pending state
- Error handling
- Auth state management
- Refresh methods per manual update

### 4.4 Components - LoginForm.jsx

Form di login con JWT.

**File**: `src/components/LoginForm.jsx`

```javascript
import React, { useState } from 'react';
import { useBot } from '../context/BotContext';
import { Activity, Lock, User, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useBot();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Background gradient */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl mb-4">
            <Activity size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Bot Dashboard</h1>
          <p className="text-zinc-400 text-sm">Sign in to access your trading bot</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User size={18} className="text-zinc-500" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
              required
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-zinc-500" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-8">
          MT5 Trading Bot Control Panel v1.0
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
```

**Features**:
- Controlled inputs
- Loading state
- Error display
- Icon decorations (lucide-react)
- Tailwind-like utility classes

### 4.5 Components - PresetModal.jsx

Modal per selezionare preset (LOW, MED, HIGH).

**File**: `src/components/PresetModal.jsx`

**Configurazione presets**:

```javascript
const PRESETS = {
  LOW: {
    name: 'LOW',
    icon: Shield,
    color: 'emerald',
    risk: '0.10%',
    maxTrades: 20,
    cooldown: '20 min',
    sl: 'TREND 1.5→2.0× | RANGE 0.8→0.8×',
    tp: '1.0x ATR',
    description: 'Conservative - V2.0 Regime-based'
  },
  MED: {
    name: 'MED',
    icon: Zap,
    color: 'yellow',
    risk: '0.20%',
    maxTrades: 20,
    cooldown: '20 min',
    sl: 'TREND 1.5→2.0× | RANGE 0.8→0.8×',
    tp: '1.0x ATR',
    description: 'Balanced - V2.0 Regime-based'
  },
  HIGH: {
    name: 'HIGH',
    icon: TrendingUp,
    color: 'red',
    risk: '0.35%',
    maxTrades: 20,
    cooldown: '20 min',
    sl: 'TREND 1.5→2.0× | RANGE 0.8→0.8×',
    tp: '1.0x ATR',
    description: 'Aggressive - V2.0 Regime-based'
  }
};
```

**Props**:
- `isOpen`: boolean
- `currentPreset`: string (LOW, MED, HIGH)
- `onSelect`: (preset) => void
- `onClose`: () => void
- `loading`: boolean

**Features**:
- Slide-up animation from bottom
- Backdrop blur
- Active preset indicator (check icon)
- Grid layout per dettagli preset
- Color-coded (emerald, yellow, red)

### 4.6 Components - ConfirmDialog.jsx

Dialog di conferma per azioni pericolose (kill, force_close).

**File**: `src/components/ConfirmDialog.jsx`

**Props**:
- `isOpen`: boolean
- `title`: string
- `message`: string
- `onConfirm`: () => void
- `onCancel`: () => void
- `variant`: 'danger' | 'warning' | 'primary'
- `confirmText`: string (default: "Confirm")
- `cancelText`: string (default: "Cancel")
- `loading`: boolean

**Variants**:
- `danger`: Red (kill switch) - icon: XOctagon
- `warning`: Orange (force close) - icon: AlertTriangle
- `primary`: Emerald (pause) - icon: Pause

**Features**:
- Center modal
- Backdrop blur
- Scale-in animation
- Loading state nel button
- Color-coded per gravità

### 4.7 Main Component - App.jsx

File principale contenente tutte le views e il bottom navigation.

**Struttura**:

```javascript
export default function App() {
  return (
    <BotProvider>
      <AppContent />
    </BotProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useBot();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Gradient */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none" />

      {/* Content Area */}
      <div className="max-w-md mx-auto min-h-screen relative p-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'trades' && <TradesView />}
        {activeTab === 'events' && <EventsView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
```

**Views**:

1. **DashboardView**: Main monitoring view
2. **TradesView**: Trade history
3. **EventsView**: System events log
4. **SettingsView**: Account info, config, logout

#### DashboardView

**Sezioni**:

1. **Header**: EA ID + Heartbeat indicator
2. **Main Portfolio Card**: Equity, Daily PnL, Quick actions
3. **Bot Status Cards**: Horizontal scroll con status, preset, trades, heartbeat
4. **Active Filters**: 7 filtri con PASS/WAIT/STOP status
5. **Open Position**: Se `has_position = true`
6. **Last Trade**: Se esiste `last_trade`

**Quick Actions** (circular buttons):
- Play/Pause: Resume/Pause bot
- Settings: Open preset modal
- Force Close: Close current position (disabled se no position)
- Kill Switch: Close all + pause
- Logs: (placeholder, disabled)

**Filters visualizzati**:
- Spread Check
- Volatility (ATR)
- Last Signal
- Trading Window
- Trend Filter
- Cooldown
- Daily Stop

**Colori status**:
- PASS: emerald (verde)
- WAIT: orange (arancione)
- STOP: red (rosso)
- CRITICAL: red pulsing

#### TradesView

**Features**:
- Lista trade con scroll infinito
- Card per ogni trade con:
  - Icon BUY/SELL
  - Symbol + side
  - Entry time + size
  - PnL (colored)
  - Exit reason
- Empty state con icon
- Refresh button

#### EventsView

**Features**:
- Timeline verticale
- Timestamp + level indicator (colored dot)
- Message + context
- Filtri per level (future feature)
- Refresh button

#### SettingsView

**Features**:
- Account info card (balance, equity, EA version)
- Trading config card (symbol, timeframe, window, limits)
- Logout button (red)
- Footer version

### 4.8 Styling - index.css

File CSS globale con utility classes in stile Tailwind.

**File**: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

/* Scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Safe area (mobile) */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.pb-safe {
  padding-bottom: calc(env(safe-area-inset-bottom) + 6rem);
}
```

### 4.9 Environment Variables (.env)

```env
VITE_API_URL=http://localhost:8000
```

Per production (Vercel):

```env
VITE_API_URL=https://your-ngrok-url.ngrok-free.dev
```

---

## 5. FLUSSI DI DATI

### 5.1 Flusso Autenticazione

```
User ─┐
      │ (1) Submit login form
      ↓
LoginForm ─┐
           │ (2) login(username, password)
           ↓
BotContext ─┐
            │ (3) api.login()
            ↓
ApiService ─┐
            │ (4) POST /api/v1/auth/login
            ↓
Backend ────┐
            │ (5) Verify credentials
            │ (6) Generate JWT token
            ↓
ApiService ← (7) Receive token
            │ (8) Store in localStorage
            ↓
BotContext ← (9) setIsAuthenticated(true)
            │ (10) Start polling
            ↓
DashboardView ← (11) Render dashboard
```

### 5.2 Flusso Status Polling

```
BotContext ─────┐ (ogni 5 secondi)
                │
                ↓
        fetchStatus()
                │
                ↓
        api.getStatus()
                │
                ↓
   GET /api/v1/status
                │
                ↓
   Backend query BotState (id=1)
                │
                ↓
   Return StatusResponse JSON
                │
                ↓
   setStatus(data)
                │
                ↓
   DashboardView re-render
                │
                ↓
   Display updated data
```

### 5.3 Flusso Comando (es. Pause)

```
User click "Pause"
        ↓
DashboardView.handlePauseResume()
        ↓
BotContext.pause()
        ↓
sendCommand(() => api.pause())
        ↓
setCommandPending(true)
        ↓
api.sendCommand('pause', null)
        ↓
POST /api/v1/command
  Body: {"type": "pause", "payload": null}
        ↓
Backend create Command (status=pending)
        ↓
Backend save to DB
        ↓
Return CommandResponse
        ↓
BotContext.fetchStatus() (immediate refresh)
        ↓
setCommandPending(false)
        ↓
DashboardView re-render
  (button disabled finché commandPending=true)
```

**Note**: L'EA recupera il comando nel prossimo heartbeat (max 30s delay).

### 5.4 Flusso Heartbeat EA → Backend

```
MT5 EA (ogni 30s)
        ↓
RemoteClient.SendHeartbeat()
        ↓
POST /api/v1/ea/heartbeat
  Body: HeartbeatRequest (status, metrics, filters, position)
        ↓
Backend ea.py router
        ↓
Update BotState (id=1) with all fields
        ↓
Check for daily_stop trigger
        ↓
Query pending Commands
        ↓
Mark Commands as "sent"
        ↓
Return HeartbeatResponse with pending_commands[]
        ↓
EA receives commands
        ↓
EA executes commands
        ↓
EA POST /api/v1/ea/commands/{id}/ack
  Body: {"success": true, "reason": "OK"}
        ↓
Backend update Command (status=acked)
        ↓
Log event
```

### 5.5 Flusso Trade Open

```
MT5 EA opens trade
        ↓
RemoteClient.SendTradeEvent()
        ↓
POST /api/v1/ea/trade_event
  Body: {
    "event_type": "OPEN",
    "ticket": 123456,
    "symbol": "EURUSD",
    "side": "BUY",
    "size": 0.05,
    "entry_price": 1.08500,
    "sl": 1.08400,
    "tp": 1.08650,
    "entry_signal": "RSI<30",
    "preset": "MED"
  }
        ↓
Backend ea.py router
        ↓
Create Trade record (status=OPEN)
        ↓
Update BotState.last_trade_*
        ↓
Send Telegram notification
        ↓
Log event (level=SUCCESS, code=TRADE_OPEN)
        ↓
Return success
        ↓
Dashboard polling picks up:
  - Updated status.last_trade
  - New event in events log
  - Updated position info
```

---

## 6. DATABASE SCHEMA

### 6.1 ERD Semplificato

```
┌─────────────┐
│  bot_state  │ (singleton, id=1)
├─────────────┤
│ id          │ PK
│ ea_id       │
│ status      │
│ equity      │
│ ...         │
└─────────────┘

┌─────────────┐
│   trades    │
├─────────────┤
│ id          │ PK
│ ticket      │ UNIQUE
│ symbol      │
│ side        │
│ entry_price │
│ exit_price  │
│ pnl         │
│ status      │
│ ...         │
└─────────────┘

┌─────────────┐
│   events    │
├─────────────┤
│ id          │ PK
│ timestamp   │ INDEX
│ level       │ INDEX
│ code        │ INDEX
│ message     │
│ context     │ JSON
│ ...         │
└─────────────┘

┌─────────────┐
│  commands   │
├─────────────┤
│ id          │ PK
│ command_type│
│ payload     │ JSON
│ status      │
│ created_at  │
│ acked_at    │
│ ...         │
└─────────────┘

┌─────────────┐
│    users    │
├─────────────┤
│ id          │ PK
│ username    │ UNIQUE
│ password    │ HASHED
│ ...         │
└─────────────┘
```

### 6.2 Indici

- `bot_state.id` (PK, sempre 1)
- `trades.ticket` (UNIQUE)
- `trades.entry_time` (per sorting)
- `events.timestamp` (per sorting)
- `events.level` (per filtering)
- `events.code` (per filtering)
- `commands.status` (per query pending)
- `users.username` (UNIQUE)

---

## 7. FILE LISTING COMPLETO

### 7.1 Backend Files

```
my-bot-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    (191 lines)
│   ├── config.py                  (36 lines)
│   ├── database.py                (38 lines)
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── bot_state.py           (69 lines)
│   │   ├── commands.py            (~50 lines)
│   │   ├── trades.py              (50 lines)
│   │   ├── events.py              (26 lines)
│   │   ├── user.py                (~40 lines)
│   │   └── tenant.py              (~30 lines)
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                (~30 lines)
│   │   ├── command.py             (~60 lines)
│   │   ├── heartbeat.py           (~120 lines)
│   │   ├── status.py              (~100 lines)
│   │   ├── trade.py               (~80 lines)
│   │   └── event.py               (~30 lines)
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                (~80 lines)
│   │   ├── gui.py                 (310 lines)
│   │   └── ea.py                  (344 lines)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── telegram.py            (~150 lines)
│   │   └── events.py              (~80 lines)
│   │
│   └── utils/
│       ├── __init__.py
│       └── auth.py                (~60 lines)
│
├── .env
├── .env.example
├── requirements.txt
├── bot.db                         (SQLite, runtime generated)
└── README.md
```

**Total Lines (approx)**: ~1800 lines Python

### 7.2 Frontend Files

```
my-bot-dashboard/
├── src/
│   ├── main.jsx                   (10 lines)
│   ├── App.jsx                    (683 lines) ★
│   ├── App.css                    (43 lines, unused)
│   ├── index.css                  (69 lines)
│   │
│   ├── components/
│   │   ├── LoginForm.jsx          (106 lines)
│   │   ├── ConfirmDialog.jsx      (92 lines)
│   │   └── PresetModal.jsx        (157 lines)
│   │
│   ├── context/
│   │   └── BotContext.jsx         (180 lines)
│   │
│   ├── services/
│   │   └── api.js                 (161 lines)
│   │
│   └── assets/
│       └── react.svg
│
├── public/
│   └── vite.svg
│
├── index.html                     (14 lines)
├── package.json                   (31 lines)
├── package-lock.json
├── vite.config.js                 (10 lines)
├── eslint.config.js               (26 lines)
├── .env
├── .gitignore
└── README.md
```

**Total Lines (approx)**: ~1550 lines JavaScript/JSX

### 7.3 File Critici per Gemini

Per rigenerare la dashboard, fornire questi file:

**Backend**:
1. `app/routers/gui.py` - Tutti gli endpoints dashboard
2. `app/models/bot_state.py` - Schema BotState
3. `app/models/trades.py` - Schema Trade
4. `app/models/events.py` - Schema Event
5. `app/schemas/status.py` - Response schemas

**Frontend**:
1. `src/App.jsx` - Main component con tutte le views
2. `src/context/BotContext.jsx` - State management
3. `src/services/api.js` - API service layer
4. `src/components/LoginForm.jsx` - Login
5. `src/components/PresetModal.jsx` - Preset selector
6. `src/components/ConfirmDialog.jsx` - Confirmation dialogs
7. `src/index.css` - Styling

---

## 8. SPECIFICHE UI/UX

### 8.1 Design System

**Colors**:
- Background: `#000000` (black)
- Cards: `#18181b` (zinc-900)
- Borders: `#27272a` (zinc-800)
- Text primary: `#ffffff` (white)
- Text secondary: `#a1a1aa` (zinc-400)
- Success: `#10b981` (emerald-500)
- Warning: `#f59e0b` (orange-500)
- Error: `#ef4444` (red-500)
- Info: `#3b82f6` (blue-500)

**Typography**:
- Font: system-ui, -apple-system, sans-serif
- Size scale: 10px, 12px, 14px, 16px, 18px, 24px, 32px, 48px

**Spacing**:
- Scale: 2px, 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Border Radius**:
- Small: 8px
- Medium: 12px
- Large: 16px
- XLarge: 24px
- 2XLarge: 32px

**Shadows**:
- Small: `0 1px 2px rgba(0,0,0,0.05)`
- Medium: `0 4px 6px rgba(0,0,0,0.1)`
- Large: `0 10px 15px rgba(0,0,0,0.2)`
- Glow: `0 0 15px rgba(color, 0.4)`

### 8.2 Component Patterns

**Button States**:
- Default: bg-color, hover:lighter
- Disabled: opacity-50, cursor-not-allowed
- Loading: spinner icon + "Wait..." text
- Active: ring + scale-95

**Status Badges**:
- RUNNING: emerald + pulsing dot
- PAUSED: zinc
- IN_TRADE: blue + pulsing dot
- DAILY_STOP: orange
- ERROR: red

**Card Patterns**:
- Header: Title + action button (refresh, etc)
- Body: Content with padding
- Footer: Optional metadata

**Empty States**:
- Large icon (48px)
- Gray text
- Center aligned

### 8.3 Responsive Breakpoints

**Mobile-first**:
- Base: 0-640px (mobile)
- sm: 640px+ (tablet)
- md: 768px+ (desktop)
- lg: 1024px+ (large desktop)

**Dashboard layout**:
- Max width: 448px (max-w-md)
- Centered: mx-auto
- Padding: 1.5rem (p-6)

### 8.4 Icons (lucide-react)

**Used icons**:
- Activity: Dashboard nav
- History: Trades nav
- List: Events nav
- Settings: Settings nav
- Play: Resume button
- Pause: Pause button
- XOctagon: Kill switch
- XCircle: Force close
- Zap: Preset indicator
- TrendingUp/Down: PnL indicators
- ArrowUpRight/DownRight: Buy/Sell
- Wifi/WifiOff: Heartbeat status
- RefreshCw: Refresh button
- AlertTriangle: Warning dialog
- ShieldCheck: Filter icon
- Clock, Timer: Time filters

**Size standard**: 18px (small), 24px (medium), 32px (large)

### 8.5 Animations

**Transitions**:
- All UI: `transition-colors` (200ms)
- Hover: `hover:bg-*` (instant visual feedback)
- Active: `active:scale-95` (click feedback)

**Keyframes**:
- `fade-in`: Opacity 0→1 + translateY 10px→0 (300ms)
- `slide-up`: TranslateY 100%→0 (300ms, modals)
- `scale-in`: Scale 0.95→1 + opacity (200ms, dialogs)
- `spin`: Rotate 360deg (infinite, loaders)
- `pulse`: Opacity 0.5→1 (2s infinite, heartbeat dots)

**Performance**:
- Use `transform` and `opacity` (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`

---

## 9. ESEMPI API REQUEST/RESPONSE

### 9.1 Login

**Request**:
```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=admin&password=changeme
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwOTAzMDQwMH0.xyz",
  "token_type": "bearer"
}
```

**Response** (401):
```json
{
  "detail": "Invalid credentials"
}
```

### 9.2 Get Status

**Request**:
```http
GET /api/v1/status HTTP/1.1
Authorization: Bearer eyJhbGci...
```

**Response** (200):
```json
{
  "ea_id": "EURUSD_M5_MVP_01",
  "status": "RUNNING",
  "active_preset": "MED",
  "equity": 10245.67,
  "balance": 10000.00,
  "daily_pnl": 245.67,
  "daily_pnl_percent": 2.46,
  "trades_today": 3,
  "max_trades_today": 20,
  "spread_points": 1.2,
  "atr_points": 8.5,
  "last_signal": "LONG",
  "filters": {
    "in_window": true,
    "spread_ok": true,
    "volatility_ok": true,
    "trend_ok": true,
    "in_cooldown": false,
    "daily_stop": false,
    "cooldown_end": null
  },
  "position": {
    "has_position": false,
    "side": null,
    "ticket": null,
    "symbol": null,
    "open_price": null,
    "size": null,
    "sl": null,
    "tp": null,
    "open_time": null,
    "pnl": null
  },
  "last_trade": {
    "side": "SELL",
    "symbol": "EURUSD",
    "time": "2026-02-26T09:45:23Z",
    "pnl": 12.30,
    "exit_reason": "TP"
  },
  "last_heartbeat": "2026-02-26T10:30:45Z",
  "heartbeat_ok": true,
  "ea_version": "2.0.0"
}
```

### 9.3 Send Command (Pause)

**Request**:
```http
POST /api/v1/command HTTP/1.1
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "type": "pause",
  "payload": null
}
```

**Response** (200):
```json
{
  "id": 42,
  "command_type": "pause",
  "payload": null,
  "status": "pending",
  "created_at": "2026-02-26T10:31:00.123456Z",
  "acked_at": null,
  "ack_result": null,
  "ack_reason": null
}
```

### 9.4 Send Command (Switch Preset)

**Request**:
```http
POST /api/v1/command HTTP/1.1
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "type": "switch_profile",
  "payload": {
    "preset": "HIGH"
  }
}
```

**Response** (200):
```json
{
  "id": 43,
  "command_type": "switch_profile",
  "payload": {
    "preset": "HIGH"
  },
  "status": "pending",
  "created_at": "2026-02-26T10:32:00.123456Z",
  "acked_at": null,
  "ack_result": null,
  "ack_reason": null
}
```

**Response** (400, invalid preset):
```json
{
  "detail": "preset must be LOW, MED, or HIGH"
}
```

### 9.5 Get Trades

**Request**:
```http
GET /api/v1/trades?limit=10&status=CLOSED HTTP/1.1
Authorization: Bearer eyJhbGci...
```

**Response** (200):
```json
[
  {
    "id": 123,
    "ticket": 987654321,
    "symbol": "EURUSD",
    "side": "BUY",
    "size": 0.05,
    "entry_price": 1.08500,
    "exit_price": 1.08620,
    "sl": 1.08380,
    "tp": 1.08650,
    "pnl": 12.50,
    "pnl_pips": 12.0,
    "pnl_percent": 0.12,
    "entry_time": "2026-02-26T09:30:00Z",
    "exit_time": "2026-02-26T09:50:00Z",
    "duration_seconds": 1200,
    "exit_reason": "TP",
    "preset_used": "MED",
    "status": "CLOSED"
  },
  {
    "id": 122,
    "ticket": 987654320,
    "symbol": "EURUSD",
    "side": "SELL",
    "size": 0.05,
    "entry_price": 1.08700,
    "exit_price": 1.08580,
    "sl": 1.08820,
    "tp": 1.08560,
    "pnl": 10.80,
    "pnl_pips": 12.0,
    "pnl_percent": 0.11,
    "entry_time": "2026-02-26T08:15:00Z",
    "exit_time": "2026-02-26T08:35:00Z",
    "duration_seconds": 1200,
    "exit_reason": "TP",
    "preset_used": "MED",
    "status": "CLOSED"
  }
]
```

### 9.6 Get Events

**Request**:
```http
GET /api/v1/events?limit=5&level=SUCCESS HTTP/1.1
Authorization: Bearer eyJhbGci...
```

**Response** (200):
```json
[
  {
    "id": 456,
    "timestamp": "2026-02-26T10:30:00Z",
    "level": "SUCCESS",
    "source": "EA",
    "code": "TRADE_OPEN",
    "message": "Opened BUY 0.05 lots EURUSD @ 1.08500",
    "context": {
      "entry_signal": "RSI<30 + BB_lower",
      "atr": 8.5,
      "preset": "MED"
    }
  },
  {
    "id": 455,
    "timestamp": "2026-02-26T09:50:00Z",
    "level": "SUCCESS",
    "source": "EA",
    "code": "TRADE_CLOSE",
    "message": "Closed SELL EURUSD @ 1.08580, P&L: 10.80 (TP)",
    "context": null
  }
]
```

### 9.7 Get Config

**Request**:
```http
GET /api/v1/config HTTP/1.1
Authorization: Bearer eyJhbGci...
```

**Response** (200):
```json
{
  "presets": {
    "LOW": {
      "risk_percent": 0.10,
      "max_trades": 20,
      "cooldown_minutes": 20,
      "sl_atr_mult": 1.5,
      "tp_atr_mult": 1.5
    },
    "MED": {
      "risk_percent": 0.20,
      "max_trades": 20,
      "cooldown_minutes": 20,
      "sl_atr_mult": 1.4,
      "tp_atr_mult": 1.5
    },
    "HIGH": {
      "risk_percent": 0.35,
      "max_trades": 20,
      "cooldown_minutes": 20,
      "sl_atr_mult": 1.3,
      "tp_atr_mult": 1.5
    }
  },
  "trading_window": {
    "morning_start": "09:00",
    "morning_end": "12:00",
    "afternoon_start": "14:30",
    "afternoon_end": "23:00",
    "force_close": "22:55",
    "timezone": "Europe/Rome"
  },
  "limits": {
    "max_daily_loss_percent": 1.0,
    "max_open_positions": 1,
    "max_spread_points": 15
  },
  "symbol": "EURUSD",
  "timeframe": "M5"
}
```

---

## 10. NOTE FINALI PER GEMINI

### 10.1 Priorità Implementative

1. **Backend API** deve essere implementato per primo (dipendenza frontend)
2. **Authentication flow** deve funzionare prima di tutto
3. **Status polling** è la feature core
4. **Command sending** deve essere testato con mock EA
5. **UI/UX** deve seguire esattamente il design system

### 10.2 Testing Checklist

**Backend**:
- [ ] Login con credenziali valide/invalide
- [ ] JWT token validation
- [ ] Status endpoint con BotState vuoto
- [ ] Status endpoint con dati completi
- [ ] Command creation (tutti i 5 tipi)
- [ ] Command validation (payload)
- [ ] Trades query con filtri
- [ ] Events query con filtri
- [ ] Config endpoint
- [ ] Heartbeat monitor background task
- [ ] CORS headers

**Frontend**:
- [ ] Login form (success/error)
- [ ] Logout (clear state)
- [ ] Status polling (5s interval)
- [ ] Status display (tutte le sezioni)
- [ ] Pause/Resume buttons
- [ ] Preset modal (selection)
- [ ] Kill confirm dialog
- [ ] Force close confirm dialog
- [ ] Trades view (empty/populated)
- [ ] Events view (empty/populated)
- [ ] Settings view
- [ ] Bottom navigation
- [ ] Error handling (network, 401, 500)
- [ ] Loading states
- [ ] Responsive layout (mobile-first)

### 10.3 Miglioramenti Futuri (Non Prioritari)

- WebSocket per real-time updates (sostituire polling)
- Chart PnL (libreria charting)
- Advanced filters su trades/events
- Export CSV trades
- Multi-language support
- Dark/Light mode toggle (attualmente solo dark)
- Notifications browser API
- PWA (installabile)
- Multi-tenancy (più EA)

### 10.4 File da Fornire a Gemini

**Must have** (completo):
1. Questo PRD (PRD_DASHBOARD_COMPLETE.md)
2. Backend: `app/routers/gui.py`
3. Backend: `app/models/bot_state.py`
4. Backend: `app/schemas/status.py`
5. Frontend: `src/App.jsx`
6. Frontend: `src/context/BotContext.jsx`
7. Frontend: `src/services/api.js`
8. Frontend: `src/index.css`

**Nice to have**:
- `app/main.py` (per capire startup)
- `app/database.py` (per capire DB setup)
- Altri component files (LoginForm, PresetModal, ConfirmDialog)

---

## FINE DOCUMENTO

**Versione**: 3.0.0
**Ultima modifica**: 2026-02-26
**Autore**: Trading Bot Development Team
**Prossimi step**: Fornire a Gemini per rigenerazione dashboard completa
