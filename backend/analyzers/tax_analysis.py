from datetime import date, timedelta

CATEGORY_BENCHMARKS = {
    "large_cap": {"name": "Nifty 100 TRI", "5yr_cagr": 14.2, "category_avg": 13.1},
    "mid_cap": {"name": "Nifty Midcap 150 TRI", "5yr_cagr": 18.8, "category_avg": 17.2},
    "small_cap": {"name": "Nifty Smallcap 250 TRI", "5yr_cagr": 22.1, "category_avg": 19.8},
    "flexi_cap": {"name": "Nifty 500 TRI", "5yr_cagr": 15.6, "category_avg": 14.4},
    "elss": {"name": "Nifty 500 TRI", "5yr_cagr": 15.6, "category_avg": 13.9},
    "index_nifty50": {"name": "Nifty 50 TRI", "5yr_cagr": 14.2, "category_avg": 14.0},
    "hybrid": {"name": "NIFTY Hybrid 65:35", "5yr_cagr": 11.8, "category_avg": 11.2},
    "liquid": {"name": "NIFTY Liquid Index", "5yr_cagr": 6.8, "category_avg": 6.7},
    "international": {"name": "MSCI World", "5yr_cagr": 13.1, "category_avg": 12.8},
    "default": {"name": "Nifty 500 TRI", "5yr_cagr": 15.0, "category_avg": 13.5},
}

def categorize_fund(fund_name: str) -> str:
    name = fund_name.lower()
    if "parag parikh" in name or ("flexi" in name and any(x in name for x in ["international","global"])):
        return "international"
    if ("nifty 50" in name or "sensex" in name) and "index" in name:
        return "index_nifty50"
    if "small cap" in name or "smallcap" in name:
        return "small_cap"
    if "mid cap" in name or "midcap" in name:
        return "mid_cap"
    if "large cap" in name or "bluechip" in name or "top 100" in name:
        return "large_cap"
    if "flexi" in name or "multi cap" in name:
        return "flexi_cap"
    if "elss" in name or "tax saver" in name:
        return "elss"
    if "balanced" in name or "hybrid" in name or "baf" in name or "advantage" in name:
        return "hybrid"
    if "liquid" in name or "overnight" in name or "debt" in name or "bond" in name:
        return "liquid"
    return "default"

def get_benchmark_for_fund(fund_name: str) -> dict:
    cat = categorize_fund(fund_name)
    return CATEGORY_BENCHMARKS.get(cat, CATEGORY_BENCHMARKS["default"])

def compute_tax_analysis(funds: list[dict]) -> dict:
    ltcg_total = 0.0
    stcg_total = 0.0
    harvest_candidates = []
    tax_free_used = 0.0
    TAX_FREE_LIMIT = 100000  # ₹1L LTCG exempt per FY

    for fund in funds:
        value = fund.get("value", 0)
        if value <= 0:
            continue
        # estimate cost basis — if we have transactions, sum purchases
        txns = fund.get("transactions", [])
        cost = sum(abs(t.get("amount", 0)) for t in txns) if txns else value * 0.75
        gain = value - cost

        if gain <= 0:
            continue

        # simplified: assume all long-term (held > 1 year)
        # in real implementation, would check individual lot dates
        ltcg_total += gain

        # harvest opportunity: gain < ₹1L, can book profit tax-free this FY
        remaining_limit = TAX_FREE_LIMIT - tax_free_used
        if 0 < gain < remaining_limit:
            harvest_candidates.append({
                "fund": fund["name"].split(" - ")[0],
                "estimated_gain": round(gain),
                "action": f"Book ₹{gain:,.0f} profit tax-free this FY — within ₹1L limit",
                "tax_saving": round(gain * 0.10),
            })
            tax_free_used += gain

    tax_above_exemption = max(0, ltcg_total - TAX_FREE_LIMIT)
    estimated_tax = round(tax_above_exemption * 0.10, 2)

    return {
        "estimated_ltcg": round(ltcg_total, 2),
        "estimated_tax_due": estimated_tax,
        "tax_free_harvest_remaining": round(max(0, TAX_FREE_LIMIT - min(ltcg_total, TAX_FREE_LIMIT)), 2),
        "harvest_candidates": harvest_candidates[:3],
        "note": "Estimates only. Consult a CA for exact tax liability. LTCG exempt up to ₹1L/FY.",
    }

def compute_category_allocation(funds: list[dict]) -> dict:
    allocation: dict[str, float] = {}
    total = sum(f.get("value", 0) for f in funds if f.get("value", 0) > 0)
    if not total:
        return {}
    for fund in funds:
        v = fund.get("value", 0)
        if v <= 0:
            continue
        cat = categorize_fund(fund["name"])
        allocation[cat] = allocation.get(cat, 0) + v
    return {k: round(v / total * 100, 1) for k, v in sorted(allocation.items(), key=lambda x: -x[1])}

def generate_action_items(funds: list, overlap_data: dict, expense_data: dict) -> list[dict]:
    actions = []
    # regular plan switch
    regular_funds = [f for f in funds if "regular" in f.get("name", "").lower() and f.get("value", 0) > 0]
    if regular_funds:
        annual_savings = sum(f.get("value", 0) * 0.01 for f in regular_funds)
        actions.append({
            "priority": "high",
            "title": f"Switch {len(regular_funds)} Regular plan(s) to Direct",
            "impact": f"Save ~₹{annual_savings:,.0f}/year in expense ratio",
            "funds": [f["name"].split(" - ")[0] for f in regular_funds[:3]],
        })
    # high overlap
    high_pairs = [p for p in overlap_data.get("pairs", []) if p["overlap_pct"] > 70]
    if high_pairs:
        actions.append({
            "priority": "high",
            "title": f"Consolidate {len(high_pairs)} high-overlap fund pair(s)",
            "impact": "Reduce redundancy without reducing diversification",
            "funds": [high_pairs[0]["fund_a"].split(" - ")[0], high_pairs[0]["fund_b"].split(" - ")[0]],
        })
    # expense drag
    if expense_data.get("annual_drag", 0) > 10000:
        actions.append({
            "priority": "medium",
            "title": "Reduce expense ratio drag",
            "impact": f"Current drag: ₹{expense_data['annual_drag']:,.0f}/year",
            "funds": [],
        })
    return actions
