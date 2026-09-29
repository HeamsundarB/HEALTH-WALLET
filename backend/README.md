# HEALTH WALLET — Backend API Service

**Team:** MEDIMIND  
**Tagline:** One Patient. One Health Journey.  
**Framework:** FastAPI + Python + SQLAlchemy

---

## Phase 0 Architecture Overview

The backend is built with FastAPI and SQLAlchemy using a modular, scalable layer design:

```
backend/
├── app/
│   ├── main.py            # FastAPI initialization & global exception handlers
│   ├── core/              # Config, Security (JWT stubs), Logging
│   ├── api/v1/            # API routing & endpoints
│   ├── db/                # SQLAlchemy session & engine
│   ├── models/            # SQLAlchemy database models foundation
│   ├── schemas/           # Pydantic request/response schemas
│   └── services/          # Business logic service layer
├── requirements.txt
└── README.md
```

## Running the Backend Locally

```bash
# 1. Create Python Virtual Environment
python -m venv venv

# 2. Activate Virtual Environment (Windows)
.\venv\Scripts\activate

# 3. Install Dependencies
pip install -r requirements.txt

# 4. Start FastAPI Server via Uvicorn
uvicorn app.main:app --reload --port 8000
```

## Health Verification Endpoint

```http
GET http://localhost:8000/api/v1/health
```

Expected Response (HTTP 200 OK):
```json
{
  "status": "ok",
  "service": "health-wallet-backend",
  "version": "0.1.0"
}
```
