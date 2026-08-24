# AI Voice Sales Agent - Frontend Dashboard

A production-ready responsive web frontend for an **AI Voice E-commerce Sales Agent**.
Connects seamlessly via a single environment variable (`VITE_API_URL`) to an external backend (e.g. deployed on Render) orchestrating **Exotel Telephony SIP**, multi-lingual speech models (Telugu, Hindi, English), and real-time lead qualification.

---

## 🚀 Key Features

1. **Live Telephony Monitor**:
   - Status pipeline: `Calling` ➔ `Ringing` ➔ `Connected` ➔ `Listening` ➔ `Speaking` ➔ `Completed` / `Failed`.
   - Real-time call duration timer and animated audio waveform.
   - Active AI goal & dialogue objective tracker.
   - Lead score meter (0-100).

2. **Live Multi-Lingual Transcript**:
   - Two-sided chronological conversation view (AI Voice Agent vs. Customer).
   - High-fidelity support for **Telugu**, **Hindi**, and **English** native scripts with optional English translations.
   - Auto-scroll with manual lock toggle and 1-click clipboard export.

3. **Real-Time Lead Qualification Intelligence**:
   - **Lead Status Badges**: `HOT` (Red/Rose), `WARM` (Orange/Amber), `COLD` (Slate/Gray).
   - **Discovery Pillars**: Budget, Products to sell, SKU count, Desired timeline, Required website features (e.g. Razorpay UPI, WhatsApp sync, courier tracking).
   - **Intent Level & Decision Maker**: High / Medium / Low intent, perceived barriers, owner validation.

4. **Real-Time Backend Action Audit**:
   - Outbound call initiated via Exotel.
   - Speech language detected & model loaded.
   - Real-time lead classified.
   - WhatsApp quotation & demo store dispatched during active call.
   - Callback request captured & scheduled.
   - Post-call CRM intelligence generated.

5. **AI Callback Intelligence**:
   - Captures raw natural language statements (e.g., *"Call me tomorrow morning"* or *"कल दोपहर 2 बजे फोन करो"*).
   - Displays backend parsed ISO timestamps (*"Tomorrow, 2:00 PM IST"*).
   - Manual reschedule and note editing capabilities.

6. **Post-Call CRM Summary Modal**:
   - Executive synthesis of customer needs, objections, next action recommendations, and verbatim quotes.
   - Exportable as text report or JSON.

7. **Call History & Analytics**:
   - Searchable, filterable call history with inspection drawer.

8. **Zero Secret Footprint (Security First)**:
   - **No Exotel credentials** (API Key, Account SID, or Token) exist in the browser.
   - Telephony authentication is handled 100% server-side on your backend.

---

## 🛠️ Environment Configuration

Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Backend API Base URL (Render / FastAPI / Express)
VITE_API_URL=http://localhost:8000

# Set to 'true' for self-contained simulation mode without backend, or 'false' to connect to VITE_API_URL
VITE_USE_MOCKS=true
```

---

## 📦 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the dashboard.

3. **Run linter / TypeScript check**:
   ```bash
   npm run lint
   ```

4. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub or GitLab.
2. In Vercel, click **"Add New Project"** and import the repository.
3. In **Environment Variables**, set:
   - `VITE_API_URL`: Your deployed backend service URL (e.g. `https://my-sales-agent-backend.onrender.com`)
   - `VITE_USE_MOCKS`: `false` (or `true` if you want a public interactive mock demo)
4. Click **Deploy**. Vercel will automatically run `npm run build` and publish static assets from `dist/`.

---

## 🔌 Backend REST API Contract Specification

To connect your Render backend, implement these endpoints matching the frontend's API service (`src/services/apiClient.ts`):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend health check `{ "status": "healthy" }` |
| `POST` | `/api/calls/start` | Start outbound Exotel call `{ "phoneNumber": "...", "customerName": "..." }` |
| `GET` | `/api/calls/:callId` | Retrieve full call status record |
| `GET` | `/api/calls/:callId/transcript` | Retrieve list of transcript utterances |
| `GET` | `/api/calls/:callId/qualification` | Retrieve current lead qualification data |
| `GET` | `/api/calls/:callId/actions` | Retrieve list of backend audit actions |
| `GET` | `/api/calls/:callId/summary` | Retrieve post-call AI synthesized summary |
| `GET` | `/api/calls` | Retrieve call history list (supports `?leadStatus=HOT` & `?search=...`) |
| `POST` | `/api/calls/:callId/callback` | Schedule or modify callback date & notes |
| `POST` | `/api/calls/:callId/end` | Terminate an ongoing call |

---

## 📂 Project Structure

```
├── .env.example                  # Environment variable template
├── metadata.json                 # AI Studio configuration
├── package.json                  # Dependencies & build scripts
├── README.md                     # Documentation & API contract
├── src/
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces (Call, Transcript, Qualification, Actions)
│   ├── services/
│   │   ├── apiClient.ts          # Centralized REST API client
│   │   ├── mockService.ts        # Multi-lingual simulated telephony engine (Telugu/Hindi/English)
│   │   └── callService.ts        # Unified orchestrator (Mock / Live backend switcher)
│   ├── components/
│   │   ├── Header.tsx            # Top bar with backend health & status
│   │   ├── CallControlPanel.tsx  # Customer phone dialer & 1-click test scenarios
│   │   ├── LiveCallPanel.tsx     # Status pipeline, audio waveform & intent meter
│   │   ├── LiveTranscript.tsx    # Two-sided speech transcript with translation
│   │   ├── LeadQualificationPanel.tsx # Discovered budget, products, timeline & features
│   │   ├── ActionPanel.tsx       # Real-time backend audit execution feed
│   │   ├── CallbackPanel.tsx     # Natural language callback parser & scheduler
│   │   ├── CallSummaryModal.tsx  # Post-call CRM intelligence synthesis
│   │   ├── CallHistory.tsx       # Historical call table with filtering & search
│   │   ├── ApiSettingsModal.tsx  # Interactive API tester & live mock toggle
│   │   └── AudioWaveform.tsx     # Animated audio frequency visualizer
│   ├── App.tsx                   # Main layout container & state orchestration
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Tailwind CSS & global styling
```
