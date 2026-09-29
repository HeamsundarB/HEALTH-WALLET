# HEALTH WALLET — Phase 0 Architecture Document

**Project Name:** HEALTH WALLET  
**Team Name:** MEDIMIND  
**Tagline:** One Patient. One Health Journey.  
**Domain:** MedTech / HealthTech  

---

## 1. System Vision & Scope

HEALTH WALLET is a patient-centric, innovation-oriented digital health platform. 
Phase 0 establishes the software architecture foundation across:

1. **Frontend UI Shell**: Built using React, TypeScript, Tailwind CSS, React Router, and TanStack React Query. Features a responsive healthcare design system with white background, blue/teal palette, rounded cards, accessible buttons, and modular components.
2. **Backend API**: Powered by Python FastAPI, structured with modular domain separation (`core`, `api`, `models`, `schemas`, `services`, `db`). Exposes `/api/v1/health`.
3. **Database Layer**: SQLAlchemy ORM foundation wired to PostgreSQL (with environment configuration via `DATABASE_URL`).
4. **DevOps & Containerization**: Clean Docker Compose configuration linking frontend, backend, and PostgreSQL containerized services.

---

## 2. Directory Architecture

```
health-wallet/
├── frontend/                  # React + TypeScript + Vite + Tailwind CSS + React Router + React Query
│   ├── src/
│   │   ├── components/ui/     # Reusable UI component library
│   │   ├── components/layout/ # Navbar, Sidebar, DashboardLayout
│   │   ├── pages/            # Foundation pages (Dashboard, Profile, Records, Reports, etc.)
│   │   ├── routes/           # React Router configuration
│   │   ├── types/            # TypeScript type declarations
│   │   └── services/         # API HTTP fetch client
├── backend/                   # Python FastAPI + SQLAlchemy + Pydantic
│   ├── app/
│   │   ├── main.py            # FastAPI initialization & global exception handlers
│   │   ├── core/              # Config, Security (JWT stubs), Logging
│   │   ├── api/v1/            # API routing & health endpoints
│   │   ├── db/                # SQLAlchemy session & base setup
│   │   ├── models/            # SQLAlchemy database models foundation
│   │   ├── schemas/           # Pydantic schemas foundation
│   │   └── services/          # Business logic service layer
│   ├── requirements.txt
│   └── README.md
├── database/                  # Database migration & init SQL
│   └── init.sql
├── docs/                      # Architecture & Phase documentation
│   └── ARCHITECTURE.md
├── docker-compose.yml         # Container orchestration
├── README.md                  # Main setup & execution documentation
└── .env.example               # Environment variables template
```

---

## 3. Security & Compliance Foundation

- **Zero Real Data**: Synthetic demo data only. No real patient identifiers or Aadhaar numbers.
- **JWT Authentication Preparation**: `app/core/security.py` establishes token encode/decode stubs.
- **Sanitized Logging**: All backend logger handlers strictly filter out tokens, passwords, and user credentials.
