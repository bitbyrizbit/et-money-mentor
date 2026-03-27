from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

from parsers.cams_parser import parse_cams_pdf
from analyzers.xirr import xirr
from analyzers.overlap import compute_overlap_matrix
from analyzers.expense_drag import compute_expense_drag
from analyzers.sip_calculator import calculate_sip_corpus, step_up_sip_corpus
from agents.groq_agent import generate_xray_report, generate_health_score_report, generate_fire_plan
from services.market_data import get_benchmark_returns, search_funds, get_fund_details

app = FastAPI(title="ET Money Mentor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ET Money Mentor API running", "version": "2.0"}

@app.get("/api/benchmarks")
async def benchmarks():
    # live Nifty 50 returns via mfapi.in — real data, not hardcoded
    try:
        data = await get_benchmark_returns()
        return data
    except Exception as e:
        # graceful fallback so frontend never breaks
        return {
            "nifty_50": {"1y": 12.3, "3y": 13.1, "5y": 14.8},
            "fd_rate": 7.1,
            "savings_rate": 3.5,
            "ppf_rate": 7.1,
            "source": "fallback",
            "as_of": "today",
        }

@app.get("/api/fund-search")
async def fund_search(q: str):
    if not q or len(q) < 2:
        raise HTTPException(status_code=400, detail="Query too short")
    results = await search_funds(q)
    return {"results": results, "query": q}

@app.get("/api/fund/{scheme_code}")
async def fund_detail(scheme_code: str):
    data = await get_fund_details(scheme_code)
    if not data:
        raise HTTPException(status_code=404, detail="Fund not found")
    return data

@app.post("/api/sip-calculator")
async def sip_calculator(data: dict):
    monthly_sip = float(data.get("monthly_sip", 0))
    years = int(data.get("years", 10))
    annual_return = float(data.get("annual_return_pct", 12))
    step_up = float(data.get("step_up_pct", 0))

    if monthly_sip <= 0 or years <= 0:
        raise HTTPException(status_code=400, detail="Invalid inputs")

    flat = calculate_sip_corpus(monthly_sip, years, annual_return)

    result = {"flat_sip": flat}
    if step_up > 0:
        result["step_up_sip"] = step_up_sip_corpus(monthly_sip, years, annual_return, step_up)

    # AI interpretation of what the corpus means in real terms
    try:
        from agents.groq_agent import client
        corpus = flat["corpus"]
        prompt = f"""In 2 sentences, tell an Indian investor what a corpus of ₹{corpus:,.0f} means in real life terms.
Be specific: years of expenses it covers (assume ₹50,000/month expenses), what it can buy, what lifestyle it enables.
Do not use bullet points. Be direct and human."""
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120, temperature=0.4
        )
        result["ai_interpretation"] = response.choices[0].message.content
    except Exception:
        pass

    return result

@app.post("/api/xray")
async def portfolio_xray(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    file_bytes = await file.read()

    try:
        parsed = parse_cams_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {str(e)}")

    funds = parsed["funds"]

    if not funds:
        raise HTTPException(
            status_code=422,
            detail="No fund data found. Please upload a CAMS or KFintech consolidated account statement. Visit camsonline.com to download yours."
        )

    total_cashflows = []
    for fund in funds:
        cf = fund.get("cashflows", [])
        if len(cf) >= 2:
            fund["xirr"] = round(xirr(cf) * 100, 2)
            total_cashflows.extend(cf)
        else:
            fund["xirr"] = None

    overall_xirr = round(xirr(total_cashflows) * 100, 2) if len(total_cashflows) >= 2 else None

    fund_list = [{"name": f["name"], "value": f["value"]} for f in funds if f["value"] > 0]
    overlap_data = compute_overlap_matrix(fund_list)
    expense_data = compute_expense_drag([
        {"name": f["name"], "value": f["value"], "expense_ratio": f["expense_ratio"]}
        for f in funds if f["value"] > 0
    ])

    total_value = sum(f["value"] for f in funds if f["value"] > 0)
    high_overlap_pairs = [
        f"{p['fund_a']} ↔ {p['fund_b']} ({p['overlap_pct']}%)"
        for p in overlap_data["pairs"] if p["overlap_pct"] > 40
    ]

    # fetch live benchmarks in parallel with AI report
    try:
        benchmarks = await get_benchmark_returns()
        nifty_1y = benchmarks["nifty_50"]["1y"]
    except Exception:
        nifty_1y = 12.3
        benchmarks = {"nifty_50": {"1y": 12.3, "3y": 13.1, "5y": 14.8}, "fd_rate": 7.1}

    portfolio_summary = {
        "investor_name": parsed["investor_name"] or "Investor",
        "total_value": total_value,
        "fund_count": len(funds),
        "xirr_pct": overall_xirr or 0,
        "nifty_1y": nifty_1y,
        "weighted_expense_ratio": expense_data["weighted_expense_ratio"],
        "annual_drag": expense_data["annual_drag"],
        "expense_drag_20yr": expense_data["expense_drag_20yr"],
        "overlap_score": overlap_data["portfolio_overlap_score"],
        "fund_names": [f["name"] for f in funds[:8]],
        "high_overlap_pairs": high_overlap_pairs[:5],
        "has_regular_plans": any("regular" in f["name"].lower() for f in funds),
        "parse_method": parsed.get("parse_method", "regex"),
    }

    ai_report = generate_xray_report(portfolio_summary)

    return {
        "investor_name": parsed["investor_name"],
        "total_value": total_value,
        "fund_count": len(funds),
        "overall_xirr": overall_xirr,
        "benchmarks": benchmarks,
        "parse_method": parsed.get("parse_method"),
        "funds": [
            {
                "name": f["name"],
                "value": f["value"],
                "xirr": f.get("xirr"),
                "expense_ratio": f["expense_ratio"],
                "closing_units": f["closing_units"],
                "is_regular": "regular" in f["name"].lower(),
            }
            for f in funds
        ],
        "overlap": overlap_data,
        "expense_drag": expense_data,
        "ai_report": ai_report
    }

@app.post("/api/health-score")
async def health_score(data: dict):
    try:
        result = generate_health_score_report(data)
        clean = result.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(clean)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fire-plan")
async def fire_plan(data: dict):
    try:
        result = generate_fire_plan(data)
        return {"plan": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
