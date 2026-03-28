from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import json

from parsers.cams_parser import parse_cams_pdf
from analyzers.xirr import xirr
from analyzers.overlap import compute_overlap_matrix
from analyzers.expense_drag import compute_expense_drag
from analyzers.sip_calculator import (
    calculate_sip_corpus, step_up_sip_corpus,
    calculate_fire_roadmap, analyze_sip_health
)
from analyzers.tax_analysis import (
    compute_tax_analysis, compute_category_allocation,
    generate_action_items, get_benchmark_for_fund, categorize_fund
)
from agents.groq_agent import (
    generate_xray_report, generate_health_score_report,
    generate_fire_plan, apply_hard_score_constraints
)
from services.market_data import (
    get_benchmark_returns, search_funds,
    get_fund_details, enrich_fund_with_live_nav
)
from services.pdf_report import create_xray_pdf

app = FastAPI(title="ET Money Mentor API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "https://et-money-mentor.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ET Money Mentor API v2.0 running"}

@app.get("/api/benchmarks")
async def benchmarks():
    try:
        return await get_benchmark_returns()
    except Exception:
        return {"nifty_50": {"1y": 12.3, "3y": 13.1, "5y": 14.8}, "fd_rate": 7.1, "savings_rate": 3.5, "ppf_rate": 7.1, "source": "fallback"}

@app.get("/api/fund-search")
async def fund_search(q: str):
    if not q or len(q) < 2:
        raise HTTPException(400, detail="Query too short")
    results = await search_funds(q)
    return {"results": results, "query": q}

@app.get("/api/fund/{scheme_code}")
async def fund_detail(scheme_code: str):
    data = await get_fund_details(scheme_code)
    if not data:
        raise HTTPException(404, detail="Fund not found")
    return data

@app.post("/api/sip-calculator")
async def sip_calculator(data: dict):
    monthly_sip = float(data.get("monthly_sip", 0))
    years = int(data.get("years", 10))
    annual_return = float(data.get("annual_return_pct", 12))
    step_up = float(data.get("step_up_pct", 0))
    if monthly_sip <= 0 or years <= 0:
        raise HTTPException(400, detail="Invalid inputs")
    flat = calculate_sip_corpus(monthly_sip, years, annual_return)
    result: dict = {"flat_sip": flat}
    if step_up > 0:
        result["step_up_sip"] = step_up_sip_corpus(monthly_sip, years, annual_return, step_up)
    try:
        corpus = flat["corpus"]
        monthly_expense_equiv = corpus / (25 * 12)
        result["ai_interpretation"] = (
            f"A corpus of ₹{corpus/10000000:.2f}Cr covers roughly {int(corpus/(50000*12))} years of expenses "
            f"at ₹50,000/month. That is financial independence."
        )
    except Exception:
        pass
    return result

@app.post("/api/xray")
async def portfolio_xray(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, detail="Please upload a PDF file")

    file_bytes = await file.read()
    try:
        parsed = parse_cams_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(422, detail=f"Could not parse PDF: {str(e)}")

    funds = parsed["funds"]
    if not funds:
        raise HTTPException(422, detail="No fund data found. Please upload a CAMS or KFintech consolidated account statement.")

    # compute XIRR
    total_cashflows = []
    for fund in funds:
        cf = fund.get("cashflows", [])
        if len(cf) >= 2:
            fund["xirr"] = round(xirr(cf) * 100, 2)
            total_cashflows.extend(cf)
        else:
            fund["xirr"] = None

    overall_xirr = round(xirr(total_cashflows) * 100, 2) if len(total_cashflows) >= 2 else None

    # overlap
    fund_list = [{"name": f["name"], "value": f["value"]} for f in funds if f["value"] > 0]
    overlap_data = compute_overlap_matrix(fund_list)

    # expense drag
    expense_data = compute_expense_drag([
        {"name": f["name"], "value": f["value"], "expense_ratio": f["expense_ratio"]}
        for f in funds if f["value"] > 0
    ])

    total_value = sum(f["value"] for f in funds if f["value"] > 0)

    # benchmarks
    try:
        benchmarks = await get_benchmark_returns()
        nifty_1y = benchmarks["nifty_50"]["1y"]
    except Exception:
        benchmarks = {"nifty_50": {"1y": 12.3, "3y": 13.1, "5y": 14.8}, "fd_rate": 7.1, "savings_rate": 3.5}
        nifty_1y = 12.3

    # SIP health per fund
    sip_health = {}
    for f in funds:
        if f.get("transactions"):
            sip_health[f["name"]] = analyze_sip_health(f["transactions"])

    # tax analysis
    tax_data = compute_tax_analysis(funds)

    # category allocation
    category_alloc = compute_category_allocation(funds)

    # benchmark per fund
    for fund in funds:
        fund["category"] = categorize_fund(fund["name"])
        fund["benchmark"] = get_benchmark_for_fund(fund["name"])

    # action items
    actions = generate_action_items(funds, overlap_data, expense_data)

    high_overlap_pairs = [
        f"{p['fund_a']} ↔ {p['fund_b']} ({p['overlap_pct']}%)"
        for p in overlap_data["pairs"] if p["overlap_pct"] > 40
    ]

    valid_funds = [f for f in funds if f["value"] > 0]
    funds_with_xirr_sorted = sorted(
        [f for f in valid_funds if f.get("xirr") is not None],
        key=lambda x: x["xirr"], reverse=True
    )

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
        "fund_names": [f["name"] for f in valid_funds[:8]],
        "high_overlap_pairs": high_overlap_pairs[:5],
        "funds_with_xirr": [
            {"name": f["name"], "xirr": f.get("xirr"), "value": f["value"], "is_regular": f.get("is_regular", False)}
            for f in valid_funds[:12]
        ],
        "regular_plan_count": sum(1 for f in funds if f.get("is_regular")),
        "direct_plan_count": sum(1 for f in funds if not f.get("is_regular") and f["value"] > 0),
        "highest_xirr_fund": funds_with_xirr_sorted[0]["name"] if funds_with_xirr_sorted else "",
        "lowest_xirr_fund": funds_with_xirr_sorted[-1]["name"] if funds_with_xirr_sorted else "",
    }

    ai_report = generate_xray_report(portfolio_summary)

    return {
        "investor_name": parsed["investor_name"],
        "total_value": total_value,
        "fund_count": len(funds),
        "overall_xirr": overall_xirr,
        "benchmarks": benchmarks,
        "parse_method": parsed.get("parse_method"),
        "parser_diagnostics": {
            "parse_method": parsed.get("parse_method"),
            "fund_blocks_found": parsed.get("fund_blocks_found", len(funds)),
            "funds_with_zero_value": sum(1 for f in funds if f["value"] == 0),
            "funds_without_xirr": sum(1 for f in funds if f.get("xirr") is None),
        },
        "funds": [
            {
                "name": f["name"],
                "value": f["value"],
                "xirr": f.get("xirr"),
                "expense_ratio": f["expense_ratio"],
                "closing_units": f["closing_units"],
                "is_regular": f.get("is_regular", False),
                "category": f.get("category", ""),
                "benchmark": f.get("benchmark", {}),
            }
            for f in funds
        ],
        "overlap": overlap_data,
        "expense_drag": expense_data,
        "tax_analysis": tax_data,
        "sip_health": sip_health,
        "category_allocation": category_alloc,
        "action_items": actions,
        "ai_report": ai_report,
    }

@app.post("/api/xray/report/pdf")
async def generate_pdf_report(result: dict):
    """Download a styled PDF of the X-Ray analysis."""
    try:
        pdf_bytes = create_xray_pdf(result)
        investor = result.get("investor_name", "portfolio").replace(" ", "-")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=xray-{investor}.pdf"}
        )
    except Exception as e:
        raise HTTPException(500, detail=f"PDF generation failed: {str(e)}")

@app.post("/api/health-score")
async def health_score(data: dict):
    # validate
    if not data.get("age") or not data.get("income") or data.get("income", 0) <= 0:
        raise HTTPException(400, detail="Please provide age and monthly income")

    income = data.get("income", 1)
    expenses = data.get("expenses", 0)
    emi = data.get("emi", 0)
    surplus = income - expenses - emi

    data["_computed"] = {
        "monthly_surplus": surplus,
        "savings_rate": ((income - expenses) / income) * 100,
        "debt_to_income": (emi / income) * 100,
        "emergency_target": expenses * 6,
        "term_cover_target": income * 12 * 10,
        "health_cover_target": 1000000,
    }

    try:
        result = generate_health_score_report(data)
        result = apply_hard_score_constraints(data, result)
        return result
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/api/fire-plan")
async def fire_plan(data: dict):
    try:
        # pre-calculate FIRE roadmap mathematically before AI touches it
        roadmap = calculate_fire_roadmap(data)
        data["_roadmap"] = roadmap
        result = generate_fire_plan(data)
        return {
            "plan": result,
            "roadmap": roadmap,  # structured data for frontend
        }
    except Exception as e:
        raise HTTPException(500, detail=str(e))
