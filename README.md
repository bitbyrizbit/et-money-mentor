<div align="center">

<img src="https://img.shields.io/badge/ET_AI_Hackathon-2026-e63329?style=for-the-badge" />
<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Groq-llama--3.3--70b-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/deployed-Render_+_Vercel-black?style=for-the-badge" />

# ET Money Mentor

**AI-powered personal finance intelligence for every Indian investor.**

*95% of Indians don't have a financial plan. Financial advisors charge ₹25,000/year and serve only HNIs. We give every investor the same intelligence — free, instant, brutally honest.*

[**Live Demo**](https://et-money-mentor.vercel.app) · [**Backend API**](https://et-money-mentor.onrender.com/docs) · **Problem Statement: PS9 — AI Money Mentor**

</div>

---

## What We Built

ET Money Mentor is a full-stack AI financial intelligence platform with three core tools:

### 🔬 Portfolio X-Ray *(Hero Feature)*
Upload your CAMS or KFintech consolidated account statement PDF. In under 10 seconds:

| Output | What it means |
|---|---|
| **True XIRR** | Your actual annualised return — not NAV growth, but accounting for every SIP date and amount |
| **Overlap Analysis** | Similarity scoring across curated fund holdings — detects when 5 funds secretly hold the same 10 stocks |
| **Expense Drag** | Exact rupee cost of your expense ratio this year and compounded over 20 years |
| **Benchmark Comparison** | Live Nifty 50 returns via mfapi.in — not hardcoded |
| **Tax Analysis** | LTCG estimation, ₹1L harvest opportunities, tax-free rebalancing suggestions |
| **AI Rebalancing Plan** | Groq llama-3.3-70b: specific funds to exit, consolidate, add — with rupee numbers |
| **PDF Report** | Downloadable styled report of the full analysis |

### ❤️ Money Health Score
3-step, 5-minute onboarding scored across 6 dimensions with AI-generated action items and mathematically enforced hard constraints:

- Emergency Preparedness · Insurance Coverage · Investment Diversification
- Debt Health · Tax Efficiency · Retirement Readiness

### 🔥 FIRE Planner
Input age, income, expenses, existing corpus and risk profile. Outputs a complete retirement roadmap:
- Exact FIRE corpus (25x rule adjusted for 6% Indian inflation)
- Month-by-month SIP allocation by SEBI fund category
- Asset allocation roadmap shifting every 5 years toward retirement
- Tax optimisation (ELSS, NPS Tier 1, 80C, HRA)
- Step-up SIP projections (10% annual increase)

---

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 14 (Vercel)                     │
│         Portfolio X-Ray · Health Score · FIRE Planner       │
│     Three.js background · Spinning 3D coin · ET Loader      │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                    FastAPI (Render)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │ CAMS Parser  │  │    Analyzers     │  │ Market Data  │   │
│  │ Three-pass   │  │ XIRR (brentq)    │  │ mfapi.in     │   │
│  │ + LLM fallb. │  │ Overlap matrix   │  │ Live NAV     │   │
│  └──────┬───────┘  │ Expense drag     │  │ Benchmarks   │   │
│         │          │ SIP calculator   │  └──────────────┘   │
│         │          │ Tax analysis     │                     │
│         │          │ FIRE roadmap     │                     │
│         │          └────────┬─────────┘                     │
│         └───────────────────▼                               │
│                    ┌────────────────┐                       │
│                    │   Groq Agent   │                       │
│                    │ llama-3.3-70b  │                       │
│                    │ Hard-constrain │                       │
│                    │ health scoring │                       │
│                    └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | App Router, SSR, fast builds |
| Styling | Tailwind CSS | Utility-first, responsive |
| 3D / Visual | Three.js r128 | Floating financial data background, 3D coin |
| Backend | FastAPI + Python 3.12 | Async, high-performance, clean |
| AI | Groq API (llama-3.3-70b-versatile) | Fastest LLM inference available |
| PDF Parsing | pdfplumber + LLM fallback | Three-pass parser handles real CAMS PDFs |
| Math | scipy.optimize.brentq | True XIRR via guaranteed-convergent NPV root-finding |
| Market Data | mfapi.in | Free, live Indian MF NAV — no auth required |
| PDF Export | ReportLab | Styled downloadable portfolio report |
| Frontend Deploy | Vercel | Zero config, instant CI/CD |
| Backend Deploy | Render | Free tier, Python native, auto-deploy on push |

---

## Project Structure
```
et-money-mentor/
├── backend/
│   ├── main.py                    # FastAPI app, all endpoints
│   ├── parsers/
│   │   └── cams_parser.py         # Three-pass PDF parser + LLM fallback
│   ├── analyzers/
│   │   ├── xirr.py                # scipy brentq XIRR calculator
│   │   ├── overlap.py             # Overlap matrix with curated fund holdings
│   │   ├── expense_drag.py        # Compound expense drag over 20 years
│   │   ├── sip_calculator.py      # Flat + step-up SIP corpus + FIRE roadmap
│   │   └── tax_analysis.py        # LTCG, tax harvesting, category benchmarks
│   ├── agents/
│   │   └── groq_agent.py          # All Groq prompts + hard score constraints
│   ├── services/
│   │   ├── market_data.py         # mfapi.in live NAV + benchmark enrichment
│   │   └── pdf_report.py          # ReportLab PDF report generation
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── page.tsx               # Homepage with Three.js background
    │   ├── xray/page.tsx          # Portfolio X-Ray
    │   ├── health-score/page.tsx  # Money Health Score
    │   └── fire/page.tsx          # FIRE Planner
    └── components/
        ├── Loader.tsx             # ET → Economic Times cinematic loader
        ├── AppShell.tsx           # Root wrapper, session-based loader control
        ├── SideNav.tsx            # Desktop side navigation
        ├── TopBar.tsx             # Sticky top bar
        ├── Ticker.tsx             # Scrolling financial facts ticker
        ├── ThreeBackground.tsx    # Three.js floating market values
        ├── SpinningCoin.tsx       # Physically-based 3D gold coin (Three.js)
        ├── StatsBar.tsx           # Scroll-triggered animated stat counters
        └── CountUp.tsx            # Eased number count-up animation
```

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone
```bash
git clone https://github.com/bitbyrizbit/et-money-mentor.git
cd et-money-mentor
```

### 2. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# create .env
echo "GROQ_API_KEY=gsk_your_key_here" > .env

uvicorn main:app --reload --port 8000
```

Backend: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### 3. Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Frontend: `http://localhost:3000`

---

## API Reference

### `POST /api/xray`
Upload a CAMS/KFintech PDF for full portfolio analysis.
```bash
curl -X POST https://et-money-mentor.onrender.com/api/xray \
  -F "file=@your_cams_statement.pdf"
```

### `POST /api/health-score`
```bash
curl -X POST https://et-money-mentor.onrender.com/api/health-score \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28, "income": 80000, "expenses": 45000,
    "emergency_months": 3, "has_term": true, "term_cover": 10000000,
    "has_health": true, "health_cover": 500000,
    "investments": 500000, "loans": 0, "emi": 0,
    "pf_nps": 60000, "tax_regime": "new"
  }'
```

### `POST /api/fire-plan`
```bash
curl -X POST https://et-money-mentor.onrender.com/api/fire-plan \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28, "target_age": 45,
    "income": 100000, "expenses": 55000,
    "current_investments": 800000, "current_sip": 20000,
    "risk_profile": "moderate", "goals": ["house", "child education"]
  }'
```

### `GET /api/benchmarks`
Live Nifty 50, FD and savings returns via mfapi.in.

### `POST /api/xray/report/pdf`
Pass the full X-Ray result JSON, receive a styled downloadable PDF.

### `POST /api/sip-calculator`
```bash
curl -X POST https://et-money-mentor.onrender.com/api/sip-calculator \
  -H "Content-Type: application/json" \
  -d '{"monthly_sip": 10000, "years": 20, "annual_return_pct": 12, "step_up_pct": 10}'
```

---

## How to Get Your CAMS Statement

1. Visit [camsonline.com](https://www.camsonline.com)
2. Click **Mailback Requests** → **Consolidated Account Statement**
3. Select **Detailed** (with transaction history)
4. Enter your PAN and registered email
5. Statement arrives within minutes
6. Upload the PDF to Portfolio X-Ray

> KFintech statements from [kfintech.com](https://mfs.kfintech.com) also work.

---

## Key Technical Decisions

**Why scipy brentq for XIRR?**  
Newton-Raphson can diverge on irregular SIP cashflow series. Brentq is a bracketed root-finding method — guaranteed to converge. We bracket between −99.9% and +5000% annual return with sanity checks that clip unrealistic values.

**Why a three-pass CAMS parser?**  
CAMS PDFs vary in formatting across brokers. Pass 1 splits the document into individual fund blocks. Pass 2 parses each block for transactions, NAV, closing units and market value. Pass 3 enriches with computed XIRR and live NAV cross-validation. If all three passes fail, Groq extracts the data directly from raw text as a final fallback.

**Why hard constraints on Health Score?**  
AI models are inconsistent on mathematically deterministic questions. Someone with zero emergency fund should never score 65/100 on emergency preparedness regardless of other factors. We apply non-overridable bounds before returning the score — AI handles nuance, math handles facts.

**Why Groq over OpenAI?**  
Groq's inference on llama-3.3-70b is roughly 10× faster than GPT-4o for our prompt sizes. The full parse → XIRR → overlap → AI report pipeline completes under 6 seconds end-to-end on the free tier.

**Why mfapi.in?**  
Only free, public, zero-auth Indian MF NAV API available. Used for live benchmark returns (UTI Nifty 50 Index as proxy) and NAV cross-validation of uploaded statements.

---

## Impact Model

| Metric | Value | Basis |
|---|---|---|
| Addressable users | 14 Cr+ demat accounts | SEBI 2024 |
| Avg annual advisor fee saved | ₹25,000 | Industry standard |
| Avg expense drag identified | ₹18L over 20 years | ₹10L corpus @ 1.2% vs 0.3% |
| Time to full portfolio analysis | < 10 seconds | Measured end-to-end |
| XIRR gap (typical Indian portfolio) | 3–4% below Nifty 50 | Internal analysis |
| Tax-free harvest opportunity (avg) | ₹40,000–80,000/year | LTCG ₹1L exemption underutilised |

---

<div align="center">

Built for **ET AI Hackathon 2026** — Phase 2 Submission  
Team: bitbyrizbit

*Not SEBI registered. For informational purposes only.*

</div>
