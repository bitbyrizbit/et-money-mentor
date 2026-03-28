from scipy.optimize import brentq
from datetime import date

def xirr(cashflows: list[tuple[date, float]]) -> float:
    # filter out sub-paise amounts
    cashflows = [(d, a) for d, a in cashflows if abs(a) > 0.01]

    if len(cashflows) < 2:
        return 0.0

    dates = [cf[0] for cf in cashflows]
    amounts = [cf[1] for cf in cashflows]

    # all same date — XIRR undefined
    if len(set(dates)) == 1:
        return 0.0

    date_range = (max(dates) - min(dates)).days
    if date_range < 7:
        return 0.0

    min_date = min(dates)
    days = [(d - min_date).days for d in dates]

    def npv(rate):
        if rate <= -1:
            return float('inf')
        try:
            return sum(
                amt / (1 + rate) ** (d / 365.0)
                for amt, d in zip(amounts, days)
            )
        except (ZeroDivisionError, OverflowError):
            return float('inf')

    try:
        result = brentq(npv, -0.9999, 50.0, maxiter=1000, xtol=1e-8)
        # sanity check
        if result > 2.0 or result < -0.90:
            return 0.0
        return result
    except (ValueError, RuntimeError):
        return 0.0
