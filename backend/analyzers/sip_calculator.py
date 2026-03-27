def calculate_sip_corpus(monthly_sip: float, years: int, annual_return_pct: float) -> dict:
    r = annual_return_pct / 100 / 12
    n = years * 12
    if r == 0:
        corpus = monthly_sip * n
    else:
        corpus = monthly_sip * (((1 + r) ** n - 1) / r) * (1 + r)

    total_invested = monthly_sip * n
    wealth_gained = corpus - total_invested

    return {
        "monthly_sip": monthly_sip,
        "years": years,
        "annual_return_pct": annual_return_pct,
        "total_invested": round(total_invested, 2),
        "corpus": round(corpus, 2),
        "wealth_gained": round(wealth_gained, 2),
        "return_multiple": round(corpus / total_invested, 2) if total_invested else 0,
    }

def step_up_sip_corpus(monthly_sip: float, years: int, annual_return_pct: float, step_up_pct: float = 10) -> dict:
    r = annual_return_pct / 100 / 12
    corpus = 0
    total_invested = 0
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
