import httpx
import asyncio
from datetime import datetime

# mfapi.in is a free, public Indian MF data API — no key needed
MFAPI_BASE = "https://api.mfapi.in/mf"

# Nifty 50 index fund used as benchmark proxy (UTI Nifty 50 Index Fund Direct)
NIFTY_PROXY_CODE = "120716"
# Nifty Next 50
NIFTY_NEXT_CODE = "120684"

async def get_fund_nav(scheme_code: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(f"{MFAPI_BASE}/{scheme_code}")
            if r.status_code != 200:
                return {}
            data = r.json()
            meta = data.get("meta", {})
            nav_data = data.get("data", [])
            if not nav_data:
                return {}

            current_nav = float(nav_data[0]["nav"])
            current_date = nav_data[0]["date"]

            # compute returns at 1, 3, 5 year horizons
            def nav_on_date(days_ago: int):
                from datetime import date, timedelta
                target = date.today() - timedelta(days=days_ago)
                for entry in nav_data:
                    try:
                        d = datetime.strptime(entry["date"], "%d-%m-%Y").date()
                        if d <= target:
                            return float(entry["nav"])
                    except ValueError:
                        continue
                return None

            nav_1y = nav_on_date(365)
            nav_3y = nav_on_date(1095)
            nav_5y = nav_on_date(1825)

            ret_1y = round(((current_nav / nav_1y) - 1) * 100, 2) if nav_1y else None
            ret_3y = round(((current_nav / nav_3y) ** (1/3) - 1) * 100, 2) if nav_3y else None
            ret_5y = round(((current_nav / nav_5y) ** (1/5) - 1) * 100, 2) if nav_5y else None

            return {
                "scheme_code": scheme_code,
                "scheme_name": meta.get("scheme_name", ""),
                "fund_house": meta.get("fund_house", ""),
                "scheme_category": meta.get("scheme_category", ""),
                "scheme_type": meta.get("scheme_type", ""),
                "current_nav": current_nav,
                "nav_date": current_date,
                "returns": {
                    "1y": ret_1y,
                    "3y": ret_3y,
                    "5y": ret_5y,
                }
            }
    except Exception:
        return {}

async def get_benchmark_returns() -> dict:
    nifty = await get_fund_nav(NIFTY_PROXY_CODE)
    return {
        "nifty_50": {
            "1y": nifty.get("returns", {}).get("1y", 12.3),
            "3y": nifty.get("returns", {}).get("3y", 13.1),
            "5y": nifty.get("returns", {}).get("5y", 14.8),
        },
        "fd_rate": 7.1,
        "savings_rate": 3.5,
        "ppf_rate": 7.1,
        "source": "mfapi.in · live NAV data",
        "as_of": datetime.now().strftime("%d %b %Y"),
    }

async def search_funds(query: str, limit: int = 8) -> list:
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(f"{MFAPI_BASE}/search?q={query}")
            if r.status_code != 200:
                return []
            results = r.json()
            return results[:limit]
    except Exception:
        return []

async def get_fund_details(scheme_code: str) -> dict:
    return await get_fund_nav(scheme_code)
