from datetime import date, timedelta
import math

def calculate_sip_corpus(monthly_sip: float, years: int, annual_return_pct: float) -> dict:
    r = annual_return_pct / 100 / 12
    n = years * 12
    if r == 0:
        corpus = monthly_sip * n
    else:
        corpus = monthly_sip * (((1 + r) ** n - 1) / r) * (1 + r)
    total_invested = monthly_sip * n
    return {
        "monthly_sip": monthly_sip,
        "years": years,
        "annual_return_pct": annual_return_pct,
        "total_invested": round(total_invested, 2),
        "corpus": round(corpus, 2),
        "wealth_gained": round(corpus - total_invested, 2),
        "return_multiple": round(corpus / total_invested, 2) if total_invested else 0,
    }

def step_up_sip_corpus(monthly_sip: float, years: int, annual_return_pct: float, step_up_pct: float = 10) -> dict:
    r = annual_return_pct / 100 / 12
    corpus = 0.0
    total_invested = 0.0
    current_sip = monthly_sip
    for year in range(years):
        for month in range(12):
            corpus = (corpus + current_sip) * (1 + r)
            total_invested += current_sip
        current_sip *= (1 + step_up_pct / 100)
    return {
        "monthly_sip_start": monthly_sip,
        "monthly_sip_end": round(current_sip, 2),
        "step_up_pct": step_up_pct,
        "years": years,
        "annual_return_pct": annual_return_pct,
        "total_invested": round(total_invested, 2),
        "corpus": round(corpus, 2),
        "wealth_gained": round(corpus - total_invested, 2),
        "return_multiple": round(corpus / total_invested, 2) if total_invested else 0,
    }

def calculate_fire_roadmap(data: dict) -> dict:
    age = data.get("age", 30)
    target_age = data.get("target_age", 45)
    monthly_expenses = data.get("expenses", 50000)
    monthly_income = data.get("income", 100000)
    current_investments = data.get("current_investments", 0)
    current_sip = data.get("current_sip", 0)
    years_to_retire = max(1, target_age - age)

    inflation = 0.06
    assumed_return = 0.12

    future_monthly_expense = monthly_expenses * ((1 + inflation) ** years_to_retire)
    future_annual_expense = future_monthly_expense * 12
    fire_corpus = future_annual_expense * 25

    current_fv = current_investments * ((1 + assumed_return) ** years_to_retire)
    sip_corpus_needed = max(0, fire_corpus - current_fv)

    r = assumed_return / 12
    n = years_to_retire * 12
    if r > 0 and n > 0 and sip_corpus_needed > 0:
        required_sip_flat = sip_corpus_needed * r / (((1 + r) ** n) - 1)
    else:
        required_sip_flat = sip_corpus_needed / n if n > 0 else 0

    # step-up SIP (10% annual increase reduces required starting SIP)
    required_sip_stepup = required_sip_flat * 0.65  # approx 35% lower with 10% step-up

    # current trajectory
    if r > 0 and n > 0:
        sip_fv = current_sip * (((1 + r) ** n - 1) / r) * (1 + r)
    else:
        sip_fv = current_sip * n
    current_trajectory = current_fv + sip_fv
    shortfall = max(0, fire_corpus - current_trajectory)
    is_on_track = current_trajectory >= fire_corpus * 0.95

    monthly_surplus = monthly_income - monthly_expenses
    savings_rate = (monthly_surplus / monthly_income * 100) if monthly_income > 0 else 0

    return {
        "fire_corpus": round(fire_corpus),
        "years_to_retire": years_to_retire,
        "future_monthly_expense": round(future_monthly_expense),
        "current_investments_future_value": round(current_fv),
        "required_monthly_sip_flat": round(max(0, required_sip_flat)),
        "required_monthly_sip_stepup": round(max(0, required_sip_stepup)),
        "current_trajectory": round(current_trajectory),
        "shortfall": round(shortfall),
        "is_on_track": is_on_track,
        "current_sip_gap": round(max(0, required_sip_flat - current_sip)),
        "monthly_surplus": round(monthly_surplus),
        "savings_rate_pct": round(savings_rate, 1),
    }

def analyze_sip_health(transactions: list[dict]) -> dict:
    if len(transactions) < 2:
        return {"sip_health": "insufficient_data", "consistency_score": 0}
    from datetime import datetime
    dates = []
    for t in transactions:
        d = t.get("date")
        if isinstance(d, str):
            try:
                dates.append(datetime.strptime(d, "%Y-%m-%d").date())
            except ValueError:
                pass
        elif hasattr(d, 'year'):
            dates.append(d)
    if len(dates) < 2:
        return {"sip_health": "insufficient_data", "consistency_score": 0}
    dates.sort()
    # expected months between first and last
    months_span = (dates[-1].year - dates[0].year) * 12 + (dates[-1].month - dates[0].month) + 1
    actual_count = len(dates)
    consistency = round((actual_count / months_span) * 100, 1) if months_span > 0 else 100
    # detect gaps > 2 months
    gaps = []
    for i in range(1, len(dates)):
        gap = (dates[i].year - dates[i-1].year) * 12 + (dates[i].month - dates[i-1].month)
        if gap > 2:
            gaps.append({"from": str(dates[i-1]), "to": str(dates[i]), "months": gap})
    return {
        "sip_start": str(dates[0]),
        "sip_latest": str(dates[-1]),
        "sip_months_completed": actual_count,
        "expected_months": months_span,
        "consistency_score": min(100, consistency),
        "gaps_detected": len(gaps),
        "gap_details": gaps[:3],
        "sip_health": "excellent" if consistency >= 95 else "good" if consistency >= 80 else "irregular" if consistency >= 60 else "poor",
    }
