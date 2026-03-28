<div align="center">

<img src="https://img.shields.io/badge/ET_AI_Hackathon-2026-e63329?style=for-the-badge" />
<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Groq-llama--3.3--70b-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/deployed-Railway_+_Vercel-black?style=for-the-badge" />

# ET Money Mentor

**AI-powered personal finance intelligence for every Indian investor.**

*95% of Indians don't have a financial plan. Financial advisors charge ₹25,000/year and serve only HNIs. We give every investor the same intelligence — free, instant, brutally honest.*

[Live Demo](https://et-money-mentor.vercel.app) · [Backend API](https://et-money-mentor.up.railway.app/docs) · [Problem Statement: PS9 — AI Money Mentor]

</div>

---

## What We Built

ET Money Mentor is a full-stack AI financial intelligence platform with three core tools:

### 🔬 Portfolio X-Ray *(Hero Feature)*
Upload your CAMS or KFintech consolidated account statement PDF. In under 10 seconds you get:

| Output | What it means |
|---|---|
| **True XIRR** | Your actual annualised return — not NAV growth, but accounting for every SIP date and amount |
| **Overlap Analysis** | Jaccard similarity across curated fund holdings — detects when 5 funds are secretly holding the same 10 stocks |
| **Expense Drag** | Exact rupee cost of your expense ratio this year and compounded over 20 years |
| **Benchmark Comparison** | Live Nifty 50 returns via mfapi.in — not hardcoded |
| **AI Rebalancing Plan** | Groq llama-3.3-70b: specific funds to exit, consolidate, add — with rupee numbers |

### ❤️ Money Health Score
3-step, 5-minute onboarding scored across 6 dimensions with AI-generated action items:
- Emergency Preparedness
- Insurance Coverage
- Investment Diversification
- Debt Health
- Tax Efficiency
- Retirement Readiness

### 🔥 FIRE Planner
Input age, income, expenses, existing corpus and risk profile. Outputs:
- Exact FIRE corpus (25x rule adjusted for 6% Indian inflation)
- Month-by-month SIP allocation by fund category
- Asset allocation roadmap shifting every 5 years
- Tax optimisation (ELSS, NPS, 80C, HRA)
- Step-up SIP projections

---

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 14                           │
│         Portfolio X-Ray · Health Score · FIRE Planner       │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                       FastAPI                               │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ CAMS Parser │  │ Analyzers    │  │ Market Data      │    │
│  │ pdfplumber  │  │ XIRR scipy   │  │ mfapi.in (live)  │    │
│  │ + LLM fallb │  │ Overlap      │  │ Nifty 50 NAV     │    │
│  └──────┬──────┘  │ Expense Drag │  └──────────────────┘    │
│         │         └──────┬───────┘                          │
│         └────────────────▼                                  │
│                  ┌───────────────┐                          │
│                  │  Groq Agent   │                          │
│                  │ llama-3.3-70b │                          │
│                  └───────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | App Router, SSR, fast |
| Styling | Tailwind CSS | Utility-first, responsive |
| 3D | Three.js r128 | Financial network background |
| Backend | FastAPI + Python 3.12 | Async, fast, clean |
| AI | Groq API (llama-3.3-70b) | Fastest inference, free tier |
| PDF | pdfplumber + LLM fallback | Handles real CAMS PDFs |
| Math | scipy.optimize.brentq | True XIRR via NPV root-finding |
| Market Data | mfapi.in | Free, live Indian MF NAV data |
| Deployment | Vercel + Railway | Zero config, instant |

---

## Project Structure
```
et-money-mentor/
├── backend/
│   ├── main.py                    # FastAPI app, all endpoints
│   ├── parsers/
│   │   └── cams_parser.py         # PDF parser + LLM fallback
│   ├── analyzers/
│   │   ├── xirr.py                # scipy brentq XIRR calculator
│   │   ├── overlap.py             # Jaccard similarity overlap matrix
│   │   ├── expense_drag.py        # Compound expense drag model
│   │   └── sip_calculator.py      # Flat + step-up SIP corpus
│   ├── agents/
│   │   └── groq_agent.py          # All Groq LLM prompts
│   ├── services/
│   │   └── market_data.py         # mfapi.in live benchmark data
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── page.tsx               # Homepage
    │   ├── xray/page.tsx          # Portfolio X-Ray
    │   ├── health-score/page.tsx  # Money Health Score
    │   └── fire/page.tsx          # FIRE Planner
    └── components/
        ├── Loader.tsx             # ET → Economic Times loader
        ├── AppShell.tsx           # Root wrapper, session loader
        ├── SideNav.tsx            # Desktop side nav + mobile tab bar
        ├── TopBar.tsx             # Sticky top bar
        ├── Ticker.tsx             # Scrolling market ticker
        ├── ThreeBackground.tsx    # Three.js node network
        ├── SpinningCoin.tsx       # 3D gold coin hero element
        ├── StatsBar.tsx           # Animated stats counters
        ├── CountUp.tsx            # Number count-up animation
        └── PageTransition.tsx     # Route transition bar
```

---

## Local Setup — Step by Step

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo
```bash
git clone https://github.com/bitbyrizbit/et-money-mentor.git
cd et-money-mentor
```

### 2. Backend setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Open .env and add your Groq API key:
# GROQ_API_KEY=gsk_your_key_here

# Start the server
uvicorn main:app --reload --port 8000
```

Backend will be live at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### 3. Frontend setup
```bash
# In a new terminal, from project root
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

Frontend will be live at `http://localhost:3000`

---

## API Reference

### `POST /api/xray`
Upload a CAMS/KFintech PDF for full portfolio analysis.
```bash
curl -X POST http://localhost:8000/api/xray \
  -F "file=@your_cams_statement.pdf"
```

**Response:**
```json
{
  "investor_name": "Rahul Sharma",
  "total_value": 1842500,
  "overall_xirr": 9.4,
  "funds": [...],
  "overlap": { "portfolio_overlap_score": 58.3, "pairs": [...] },
  "expense_drag": { "annual_drag": 23584, "expense_drag_20yr": 847200 },
  "benchmarks": { "nifty_50": { "1y": 12.3 } },
  "ai_report": "## Portfolio Health: 5.5/10 ..."
}
```

### `POST /api/health-score`
```bash
curl -X POST http://localhost:8000/api/health-score \
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
curl -X POST http://localhost:8000/api/fire-plan \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28, "target_age": 45,
    "income": 100000, "expenses": 55000,
    "current_investments": 800000, "current_sip": 20000,
    "risk_profile": "moderate", "goals": ["house", "child education"]
  }'
```

### `GET /api/benchmarks`
Returns live Nifty 50, FD, savings account returns via mfapi.in.

### `POST /api/sip-calculator`
```bash
curl -X POST http://localhost:8000/api/sip-calculator \
  -H "Content-Type: application/json" \
  -d '{"monthly_sip": 10000, "years": 20, "annual_return_pct": 12, "step_up_pct": 10}'
```

---

## How to Get Your CAMS Statement

1. Visit [camsonline.com](https://www.camsonline.com)
2. Click **Mailback Requests** → **Consolidated Account Statement**
3. Select **Detailed** (with transaction history)
4. Enter your PAN and registered email
5. Statement arrives in your inbox within minutes
6. Upload the PDF to Portfolio X-Ray

> KFintech statements from [kfintech.com](https://mfs.kfintech.com) also work.

---

## Key Technical Decisions

**Why scipy brentq for XIRR?**  
Standard XIRR implementations use Newton-Raphson which can diverge. Brentq is a bracketed root-finding method — guaranteed to converge for well-formed cashflow series. We bracket between -99.9% and 1000% annual return.

**Why Groq over OpenAI?**  
Groq's inference speed on llama-3.3-70b is ~10x faster than GPT-4o for our use case. The full XIRR + overlap + AI report pipeline completes in under 4 seconds end-to-end.

**Why LLM fallback on the CAMS parser?**  
CAMS PDFs have minor formatting variations across brokers (Zerodha, Groww, direct CAMS). If regex extraction finds zero funds, we send the raw extracted text to Groq and ask it to extract fund names and values directly. This means virtually no valid CAMS PDF will fail.

**Why mfapi.in for benchmarks?**  
It's the only free, public, no-auth-required API for Indian MF NAV data. We use the UTI Nifty 50 Index Fund Direct as a proxy to compute real 1/3/5-year benchmark returns instead of hardcoding them.

---

<div align="center">

Built for **ET AI Hackathon 2026** · Phase 2 Submission

*Not SEBI registered. For informational purposes only.*

</div>
