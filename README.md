# HEALTH WALLET

**Team:** MEDIMIND  
**Tagline:** One Patient. One Health Journey.  
**Domain:** MedTech / HealthTech  

> [!IMPORTANT]
> **DISCLAIMER:** This is a prototype/student innovation project and not a production healthcare system.

---

## 1. Project Purpose

HEALTH WALLET is a modern student innovation platform designed to provide a unified, patient-centric digital health wallet. 
Phase 0 focuses strictly on establishing a scalable, production-grade architectural foundation without medical functionality or live authentication.

---

## 2. Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, React Router v6, TanStack React Query v5, Lucide React icons, Vite
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT stubs, Uvicorn
- **Database:** PostgreSQL 15 (SQLAlchemy engine configuration)
- **Containerization:** Docker & Docker Compose

---

## 3. Folder Structure

```
health-wallet/
├── frontend/                  # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/ui/     # Reusable UI component library (Button, Card, Input, Modal, etc.)
│   │   ├── components/layout/ # Navbar, Sidebar, DashboardLayout, Phase0Banner
│   │   ├── pages/            # Foundation screens (Dashboard, Profile, Records, etc.)
│   │   ├── routes/           # React Router configuration
│   │   ├── types/            # TypeScript interface definitions
│   │   └── services/         # API HTTP client
├── backend/                   # Python FastAPI service
│   ├── app/
│   │   ├── main.py            # FastAPI initialization & global exception handling
│   │   ├── core/              # Config, Security (JWT stubs), Logging
│   │   ├── api/v1/            # API endpoints (/api/v1/health)
│   │   ├── db/                # SQLAlchemy session & engine
│   │   ├── models/            # Base SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Health service logic
├── database/                  # Database migration & init SQL scripts
│   └── init.sql
├── docs/                      # Technical documentation
│   └── ARCHITECTURE.md
├── docker-compose.yml         # Container orchestration
├── README.md                  # Comprehensive project guide
└── .env.example               # Environment variables template
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)
- Docker Desktop (optional for containerized deployment)

### Environment Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Access frontend UI at `http://localhost:3000` (or Vite dev port).

### Running the Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Access backend API docs at `http://localhost:8000/api/v1/docs`.

### API Health Check Endpoint
```http
GET http://localhost:8000/api/v1/health
```

Expected Output:
```json
{
  "status": "ok",
  "service": "health-wallet-backend",
  "version": "0.1.0"
}
```

### Running with Docker Compose
```bash
docker-compose up --build
```

---
