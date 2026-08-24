# AI Voice Sales Agent Backend

Production-ready Python backend for the AI Voice Sales Agent, integrating Exotel telephony, multi-lingual speech support, lead qualification, and WhatsApp messaging.

## Architecture

The backend is built with:
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM for database operations
- **PostgreSQL** - Production database (Render-compatible)
- **Pydantic** - Data validation using Python type annotations
- **httpx** - Async HTTP client for external API calls

### Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Environment-based configuration
│   ├── api/                    # API route handlers
│   │   ├── health.py          # Health check endpoint
│   │   ├── calls.py           # Call management endpoints
│   │   └── webhooks.py        # Exotel webhook handlers
│   ├── models/                 # Database models (SQLAlchemy)
│   │   ├── call.py            # Call record model
│   │   ├── transcript.py     # Transcript message model
│   │   ├── qualification.py   # Lead qualification model
│   │   ├── action.py          # Call action model
│   │   ├── callback.py        # Callback request model
│   │   └── summary.py         # Call summary model
│   ├── schemas/                # Pydantic schemas (API contracts)
│   │   └── call.py            # Request/response schemas
│   └── services/               # Business logic services
│       ├── exotel.py          # Exotel telephony integration
│       ├── whatsapp.py        # WhatsApp messaging (with mock mode)
│       ├── callback.py        # Natural language time parsing
│       ├── qualification.py    # Lead classification logic
│       └── voice_agent.py     # AI conversation management
├── tests/                      # Test suite
│   ├── test_api.py            # API endpoint tests
│   ├── test_qualification.py  # Qualification logic tests
│   └── test_callback.py       # Callback parsing tests
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variable template
├── render.yaml                # Render deployment configuration
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required for Production

```env
# Frontend URL for CORS
FRONTEND_URL=https://your-frontend.vercel.app

# Database (PostgreSQL on Render)
DATABASE_URL=postgresql://user:password@host:port/database

# Exotel Configuration
EXOTEL_ACCOUNT_SID=your_account_sid
EXOTEL_API_KEY=your_api_key
EXOTEL_API_TOKEN=your_api_token
EXOTEL_SUBDOMAIN=api.exotel.com
EXOTEL_REGION=Singapore
EXOTEL_PHONE_NUMBER=your_exotel_phone_number
```

### Optional (with defaults)

```env
# WhatsApp Provider (mock, twilio, messagebird, gupshup)
WHATSAPP_PROVIDER=mock
WHATSAPP_API_KEY=your_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# AI/LLM Configuration
OPENAI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4o-mini

# Webhook Security
WEBHOOK_SECRET=your_webhook_secret

# Timezone
TIMEZONE=Asia/Kolkata
```

## GitHub Deployment

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial backend implementation"
   git branch -M main
   git remote add origin https://github.com/Sreevalli20/rescom.git
   git push -u origin main
   ```

2. **Ensure `.gitignore` is configured**:
   - `.env` files are excluded
   - API keys and secrets are not committed
   - Database files are excluded

## Render Deployment

### Option 1: Using render.yaml (Recommended)

1. Connect your GitHub repository to Render
2. Render will automatically detect `render.yaml`
3. Configure environment variables in Render dashboard:
   - `FRONTEND_URL` - Your Vercel frontend URL
   - `EXOTEL_ACCOUNT_SID` - Your Exotel account SID
   - `EXOTEL_API_KEY` - Your Exotel API key
   - `EXOTEL_API_TOKEN` - Your Exotel API token
   - `EXOTEL_PHONE_NUMBER` - Your Exotel phone number
4. Deploy - Render will create:
   - Web service (FastAPI)
   - PostgreSQL database

### Option 2: Manual Setup

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Create a **PostgreSQL** database
6. Add environment variables in Render dashboard

## Exotel Configuration

### Account Details Provided
- Account SID: `nat6a2`
- Region: Singapore
- Subdomain: `api.exotel.com`

### Setup Steps

1. **Get API Credentials**:
   - Log into Exotel dashboard
   - Navigate to API Settings
   - Note your API Key and API Token

2. **Configure Webhooks**:
   - Set callback URL in Exotel to: `https://your-backend.onrender.com/api/webhooks/exotel/call-status`
   - Configure events: `ringing, answered, completed`

3. **Environment Variables**:
   ```env
   EXOTEL_ACCOUNT_SID=nat6a2
   EXOTEL_API_KEY=your_api_key
   EXOTEL_API_TOKEN=your_api_token
   EXOTEL_SUBDOMAIN=api.exotel.com
   EXOTEL_REGION=Singapore
   EXOTEL_PHONE_NUMBER=your_exotel_phone_number
   ```

## Frontend Connection

The backend API exactly matches the frontend's expected contract:

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/calls/start` | Start outbound call |
| GET | `/api/calls/:callId` | Get call details |
| GET | `/api/calls/:callId/transcript` | Get transcript |
| GET | `/api/calls/:callId/qualification` | Get qualification |
| GET | `/api/calls/:callId/actions` | Get actions |
| GET | `/api/calls/:callId/summary` | Get summary |
| GET | `/api/calls` | Get call history |
| POST | `/api/calls/:callId/callback` | Schedule callback |
| POST | `/api/calls/:callId/end` | End call |

### Frontend Configuration

Set these environment variables in your frontend:
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_USE_MOCKS=false
```

## How to Test

### Local Development

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Run the server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Run tests**:
   ```bash
   pytest
   ```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Start a call
curl -X POST http://localhost:8000/api/calls/start \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "customerName": "Test"}'

# Get call details
curl http://localhost:8000/api/calls/{callId}

# Get call history
curl http://localhost:8000/api/calls
```

## External Credential Dependencies

The following services require credentials for full functionality:

### Required for Production
- **Exotel** - Telephony provider
  - Account SID, API Key, API Token, Phone Number
  - Without these: Calls will use mock mode

### Optional
- **WhatsApp Provider** - For sending messages
  - Currently defaults to mock mode
  - Supports: Twilio, MessageBird, Gupshup
  - Without credentials: Messages are logged but not sent

- **OpenAI** - For advanced AI conversation features
  - API Key for GPT models
  - Without this: Uses rule-based conversation

## Known Limitations

1. **Exotel Integration**:
   - Webhook signature verification is a placeholder
   - Call SID to internal ID mapping needs implementation
   - Real-time transcript streaming requires Exotel Flow configuration

2. **WhatsApp**:
   - Only mock mode is fully implemented
   - Production providers need API-specific implementations

3. **AI Conversation**:
   - Currently uses rule-based responses
   - LLM integration requires OpenAI API key

4. **Database**:
   - SQLite for local development
   - PostgreSQL required for Render production

## Security Considerations

- **Never commit `.env` files** to Git
- **All credentials** are loaded from environment variables
- **CORS** is restricted to specific frontend URL
- **Webhook signatures** should be verified in production
- **Database credentials** should use Render's internal connection strings

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly formatted for PostgreSQL
- For local development, SQLite will be used automatically

### Exotel API Errors
- Verify API credentials in environment variables
- Check Exotel account status and permissions
- Ensure phone number is active in Exotel

### CORS Errors
- Verify `FRONTEND_URL` matches your frontend domain exactly
- Include protocol (https://) and no trailing slash

## Development Notes

- The backend is designed to work without local database setup during development
- Mock modes allow testing without real Exotel/WhatsApp credentials
- All services can be swapped with alternative implementations via the service layer
