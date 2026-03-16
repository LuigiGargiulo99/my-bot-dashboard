# Lista Completa File Dashboard

**Data**: 2026-02-26
**Progetto**: MT5 Trading Bot Dashboard

---

## FILE BACKEND (Python/FastAPI)

### Core Application

```
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\main.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\config.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\database.py
```

### Models (SQLAlchemy ORM)

```
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\models\__init__.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\models\bot_state.py     ★ CRITICO
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\models\commands.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\models\trades.py        ★ CRITICO
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\models\events.py        ★ CRITICO
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\models\user.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\models\tenant.py
```

### Schemas (Pydantic)

```
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\schemas\auth.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\schemas\command.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\schemas\heartbeat.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\schemas\status.py       ★ CRITICO
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\schemas\trade.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\schemas\event.py
```

### Routers (API Endpoints)

```
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\routers\__init__.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\routers\auth.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\routers\gui.py          ★ CRITICO (Dashboard API)
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\routers\ea.py
```

### Services

```
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\services\telegram.py
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\services\events.py
```

### Utils

```
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\app\utils\auth.py
```

### Configuration Files

```
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\.env                        ★ CRITICO (Config)
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\.env.example
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\requirements.txt            ★ CRITICO (Dependencies)
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\README.md
```

### Database (Runtime)

```
C:\Users\gigig\Desktop\Future VPS\my-bot-backend\bot.db                      (SQLite, generato automaticamente)
```

---

## FILE FRONTEND (React/Vite)

### Entry Points

```
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\index.html                ★ CRITICO
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\main.jsx              ★ CRITICO
```

### Main Application

```
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\App.jsx               ★ CRITICO (700+ righe, tutte le views)
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\App.css               (Unused, default Vite)
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\index.css             ★ CRITICO (Global styles + animations)
```

### Components

```
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\components\LoginForm.jsx           ★ CRITICO
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\components\ConfirmDialog.jsx       ★ CRITICO
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\components\PresetModal.jsx         ★ CRITICO
```

### Context (State Management)

```
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\context\BotContext.jsx             ★ CRITICO (Polling logic)
```

### Services (API Layer)

```
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\services\api.js                    ★ CRITICO (HTTP client)
```

### Assets

```
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\src\assets\react.svg
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\public\vite.svg
```

### Configuration Files

```
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\package.json               ★ CRITICO (Dependencies)
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\package-lock.json
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\vite.config.js             ★ CRITICO (Build config)
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\eslint.config.js
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\.env                       ★ CRITICO (VITE_API_URL)
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\.gitignore
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\README.md
```

### Build Output (Generated)

```
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\dist\                     (Vite build output)
C:\Users\gigig\Desktop\Future VPS\my-bot-dashboard\node_modules\             (npm packages)
```

---

## FILE CRITICI PER GEMINI (Top Priority)

### Backend (8 files)

1. `my-bot-backend/app/routers/gui.py` - **Tutti gli endpoint dashboard** (310 righe)
2. `my-bot-backend/app/models/bot_state.py` - **Schema BotState** (69 righe)
3. `my-bot-backend/app/models/trades.py` - **Schema Trade** (50 righe)
4. `my-bot-backend/app/models/events.py` - **Schema Event** (26 righe)
5. `my-bot-backend/app/schemas/status.py` - **StatusResponse schema** (100 righe)
6. `my-bot-backend/app/main.py` - **FastAPI app + heartbeat monitor** (191 righe)
7. `my-bot-backend/app/database.py` - **DB setup** (38 righe)
8. `my-bot-backend/requirements.txt` - **Dependencies**

**Total**: ~800 righe Python

### Frontend (8 files)

1. `my-bot-dashboard/src/App.jsx` - **Main component + tutte le views** (683 righe)
2. `my-bot-dashboard/src/context/BotContext.jsx` - **State + polling** (180 righe)
3. `my-bot-dashboard/src/services/api.js` - **HTTP client** (161 righe)
4. `my-bot-dashboard/src/components/LoginForm.jsx` - **Login** (106 righe)
5. `my-bot-dashboard/src/components/PresetModal.jsx` - **Preset selector** (157 righe)
6. `my-bot-dashboard/src/components/ConfirmDialog.jsx` - **Confirmation dialogs** (92 righe)
7. `my-bot-dashboard/src/index.css` - **Global styles** (69 righe)
8. `my-bot-dashboard/package.json` - **Dependencies**

**Total**: ~1450 righe JavaScript/JSX

---

## STATISTICHE

### Backend
- **File totali**: ~25
- **Righe totali**: ~1800
- **Linguaggio**: Python 3.11+
- **Framework**: FastAPI 0.109.0
- **Database**: SQLite (aiosqlite)

### Frontend
- **File totali**: ~15 (escl. node_modules)
- **Righe totali**: ~1550
- **Linguaggio**: JavaScript/JSX (React 19)
- **Build tool**: Vite
- **Styling**: Vanilla CSS (Tailwind-like utilities)

### Total Project
- **File totali**: ~40 (core, escl. dependencies)
- **Righe totali**: ~3350
- **Stack**: Python + React + SQLite
- **Deployment**: Local (dev) / VPS + Vercel (prod)

---

## DEPENDENCIES

### Backend (requirements.txt)

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
asyncpg==0.29.0
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-telegram-bot==20.7
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "lucide-react": "^0.563.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "vite": "npm:rolldown-vite@7.2.5"
  }
}
```

---

## MAPPA VISUALE ARCHITETTURA

```
┌───────────────────────────────────────────────────────────┐
│                      USER BROWSER                          │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │         React Dashboard (Port 5173)                │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  App.jsx                                     │  │  │
│  │  │  ├─ DashboardView                            │  │  │
│  │  │  ├─ TradesView                               │  │  │
│  │  │  ├─ EventsView                               │  │  │
│  │  │  └─ SettingsView                             │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                    ↕                                │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  BotContext.jsx (State + Polling)            │  │  │
│  │  │  ├─ fetchStatus() every 5s                   │  │  │
│  │  │  ├─ fetchTrades() every 30s                  │  │  │
│  │  │  └─ fetchEvents() every 15s                  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                    ↕                                │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  api.js (HTTP Client)                        │  │  │
│  │  │  ├─ JWT auth                                 │  │  │
│  │  │  ├─ GET /api/v1/status                       │  │  │
│  │  │  ├─ POST /api/v1/command                     │  │  │
│  │  │  ├─ GET /api/v1/trades                       │  │  │
│  │  │  └─ GET /api/v1/events                       │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────┘
                        │ HTTP/JSON (REST)
                        ↓
┌───────────────────────────────────────────────────────────┐
│                   BACKEND SERVER                           │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │         FastAPI (Port 8000)                        │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  main.py                                     │  │  │
│  │  │  ├─ CORS middleware                          │  │  │
│  │  │  ├─ heartbeat_monitor() task                 │  │  │
│  │  │  └─ /health endpoint                         │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                    ↕                                │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  routers/gui.py (Dashboard API)              │  │  │
│  │  │  ├─ GET /api/v1/status                       │  │  │
│  │  │  ├─ POST /api/v1/command                     │  │  │
│  │  │  ├─ GET /api/v1/trades                       │  │  │
│  │  │  ├─ GET /api/v1/events                       │  │  │
│  │  │  └─ GET /api/v1/config                       │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                    ↕                                │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  models/ (SQLAlchemy ORM)                    │  │  │
│  │  │  ├─ bot_state.py (singleton id=1)            │  │  │
│  │  │  ├─ trades.py                                │  │  │
│  │  │  ├─ events.py                                │  │  │
│  │  │  └─ commands.py                              │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                    ↕                                │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  database.py (SQLAlchemy async)              │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                         ↕                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │            bot.db (SQLite)                         │  │
│  │  ┌─────────────┐ ┌─────────┐ ┌────────┐ ┌──────┐  │  │
│  │  │ bot_state   │ │ trades  │ │ events │ │ cmds │  │  │
│  │  └─────────────┘ └─────────┘ └────────┘ └──────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────┘
                        │ HTTP (Heartbeat every 30s)
                        ↓
┌───────────────────────────────────────────────────────────┐
│                      MT5 TERMINAL                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  MeanReversionBot.ex5 (Expert Advisor)             │  │
│  │  ├─ RemoteClient.mqh                               │  │
│  │  │  ├─ SendHeartbeat() → /api/v1/ea/heartbeat     │  │
│  │  │  ├─ GetCommands() ← pending_commands[]         │  │
│  │  │  └─ AckCommand() → /api/v1/ea/commands/{id}/ack│  │
│  │  └─ SignalsV2.mqh, RiskManager.mqh, etc.          │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## ORDINE DI LETTURA CONSIGLIATO (per Gemini)

### Fase 1: Comprendere Backend API

1. `my-bot-backend/app/models/bot_state.py` - Schema dati principale
2. `my-bot-backend/app/schemas/status.py` - Schema response
3. `my-bot-backend/app/routers/gui.py` - Endpoints completi
4. `my-bot-backend/app/database.py` - Setup DB

### Fase 2: Comprendere Frontend

1. `my-bot-dashboard/src/services/api.js` - HTTP client
2. `my-bot-dashboard/src/context/BotContext.jsx` - State management
3. `my-bot-dashboard/src/App.jsx` - Main component + views
4. `my-bot-dashboard/src/components/LoginForm.jsx` - Login flow

### Fase 3: Implementare

1. Genera backend completo (FastAPI)
2. Genera frontend completo (React)
3. Testa integrazione
4. Deploy

---

## COMANDI UTILI

### Backend

```bash
# Avvia backend
cd my-bot-backend
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
uvicorn app.main:app --reload --port 8000

# Test endpoint
curl http://localhost:8000/health

# Verifica database
sqlite3 bot.db
.tables
.schema bot_state
SELECT * FROM bot_state;
```

### Frontend

```bash
# Avvia frontend
cd my-bot-dashboard
npm install
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

---

## FINE DOCUMENTO

**Versione**: 1.0.0
**Ultima modifica**: 2026-02-26
**Autore**: Trading Bot Development Team
