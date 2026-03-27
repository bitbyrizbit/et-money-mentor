from scipy.optimize import brentq
from datetime import date

def xirr(cashflows: list[tuple[date, float]]) -> float:
    if not cashflows:
        return 0.0

    dates = [cf[0] for cf in cashflows]
    amounts = [cf[1] for cf in cashflows]
    min_date = min(dates)
    days = [(d - min_date).days for d in dates]

    def npv(rate):
        return sum(amt / (1 + rate) ** (d / 365.0) for amt, d in zip(amounts, days))

    try:
        return brentq(npv, -0.999, 10.0, maxiter=1000)
    except ValueError:
        return 0.0
