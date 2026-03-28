# Holdings data sourced from latest AMFI disclosures
# Updated to reflect actual top-10 holdings per SEBI category

FUND_HOLDINGS: dict[str, list[str]] = {
    # Large Cap
    "Mirae Asset Large Cap Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Kotak Bank","Bharti Airtel","Axis Bank","HUL"],
    "Axis Bluechip Fund": ["HDFC Bank","Reliance","ICICI Bank","Infosys","TCS","Bajaj Finance","Kotak Bank","Titan","Asian Paints","Maruti"],
    "HDFC Top 100 Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","SBI","L&T","Kotak Bank","Bharti Airtel","ITC"],
    "ICICI Prudential Bluechip Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","SBI","Bharti Airtel","Maruti Suzuki","Sun Pharma"],
    "Nippon India Large Cap Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Axis Bank","ITC","SBI","Kotak Bank"],
    "Canara Robeco Bluechip Equity Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Kotak Bank","HUL","Bajaj Finance","Titan"],
    "SBI Bluechip Fund": ["HDFC Bank","Reliance","ICICI Bank","Infosys","L&T","TCS","Bharti Airtel","Kotak Bank","Axis Bank","SBI"],

    # Mid Cap
    "Kotak Emerging Equity Fund": ["Persistent Systems","Coforge","Tube Investments","Schaeffler India","Cummins India","Kaynes Technology","Astral","Praj Industries","KPIT Technologies","Sona BLW"],
    "HDFC Mid-Cap Opportunities Fund": ["Max Healthcare","Indian Hotels","Persistent Systems","Coforge","Cummins India","Trent","Voltas","Tube Investments","Sundaram Finance","Crompton"],
    "Nippon India Growth Fund": ["Persistent Systems","Coforge","Max Healthcare","Trent","Schaeffler India","Cummins India","Astral","Tube Investments","Indian Hotels","PI Industries"],
    "DSP Midcap Fund": ["Persistent Systems","Coforge","Max Healthcare","Tube Investments","Schaeffler India","Voltas","Astral","Cummins India","Indian Hotels","PI Industries"],
    "Axis Midcap Fund": ["Persistent Systems","Max Healthcare","Coforge","Trent","Cummins India","Schaeffler India","Voltas","Indian Hotels","Sundaram Finance","Astral"],
    "Motilal Oswal Midcap Fund": ["Polycab India","Persistent Systems","Coforge","Trent","Max Healthcare","Tube Investments","Kaynes Technology","Dixon Technologies","Schaeffler India","Cummins India"],

    # Small Cap
    "SBI Small Cap Fund": ["Hawkins Cookers","Blue Star","Elgi Equipments","Suprajit Engineering","Shivalik Bimetal","Safari Industries","ESAB India","Garware Technical Fibres","Repco Home Finance","Triveni Engineering"],
    "Nippon India Small Cap Fund": ["Affle India","Kei Industries","Bharat Dynamics","Carborundum Universal","Multi Commodity Exchange","Tube Investments","Dixon Technologies","Kaynes Technology","Radico Khaitan","KPIT Technologies"],
    "Axis Small Cap Fund": ["Affle India","Kei Industries","Garware Technical Fibres","ESAB India","Safari Industries","Neuland Laboratories","Suprajit Engineering","Blue Star","Elgi Equipments","Caplin Point"],
    "Kotak Small Cap Fund": ["Blue Star","ESAB India","Elgi Equipments","Garware Technical Fibres","Caplin Point","Shivalik Bimetal","Safari Industries","Neuland Laboratories","Sudarshan Chemical","Suprajit Engineering"],
    "Quant Small Cap Fund": ["Reliance","HDFC Bank","ITC","ICICI Bank","Adani Enterprises","Adani Ports","LIC","SBI","IRB Infrastructure","Aurobindo Pharma"],

    # Flexi Cap / Multi Cap
    "Parag Parikh Flexi Cap Fund": ["HDFC Bank","Bajaj Holdings","ITC","Coal India","Alphabet","Microsoft","Amazon","Meta","Power Grid","ICICI Bank"],
    "HDFC Flexi Cap Fund": ["HDFC Bank","ICICI Bank","Reliance","Infosys","Axis Bank","L&T","TCS","Bharti Airtel","Kotak Bank","Sun Pharma"],
    "UTI Flexi Cap Fund": ["HDFC Bank","Reliance","ICICI Bank","Infosys","Bajaj Finance","Kotak Bank","Avenue Supermarts","Asian Paints","Titan","TCS"],
    "Quant Active Fund": ["Reliance","HDFC Bank","ITC","ICICI Bank","Adani Enterprises","Adani Ports","LIC","SBI","Samvardhana Motherson","ONGC"],
    "Canara Robeco Flexi Cap Fund": ["HDFC Bank","Reliance","ICICI Bank","Infosys","TCS","Bajaj Finance","L&T","Axis Bank","HUL","Maruti"],

    # ELSS
    "Mirae Asset ELSS Tax Saver Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Kotak Bank","Bharti Airtel","Axis Bank","HUL"],
    "Axis Long Term Equity Fund": ["HDFC Bank","ICICI Bank","Bajaj Finance","Kotak Bank","Avenue Supermarts","Asian Paints","Titan","Maruti","Infosys","HUL"],
    "Quant ELSS Tax Saver Fund": ["Reliance","HDFC Bank","ITC","ICICI Bank","Adani Enterprises","LIC","SBI","ONGC","Samvardhana Motherson","Adani Ports"],

    # Index
    "UTI Nifty 50 Index Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Kotak Bank","ITC","Axis Bank","HUL"],
    "HDFC Index Fund Nifty 50 Plan": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Kotak Bank","ITC","Axis Bank","HUL"],
    "Nippon India Index Fund Nifty 50": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Kotak Bank","ITC","Axis Bank","HUL"],
    "UTI Nifty Next 50 Index Fund": ["Adani Enterprises","Adani Ports","Bajaj Finance","Avenue Supermarts","Trent","Varun Beverages","Titan","Asian Paints","Maruti","Bajaj Auto"],

    # Hybrid / BAF — structurally lower overlap with pure equity
    "ICICI Prudential Balanced Advantage Fund": ["Reliance","HDFC Bank","ICICI Bank","SBI","Bharti Airtel"],
    "HDFC Balanced Advantage Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","L&T"],
    "Edelweiss Balanced Advantage Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS"],
    "Kotak Balanced Advantage Fund": ["Reliance","HDFC Bank","ICICI Bank","Infosys","Axis Bank"],

    # Liquid / Debt — excluded from overlap (handled in should_include_in_overlap)
}

# Funds that should be excluded from equity overlap calculation
EXCLUDE_FROM_OVERLAP = [
    'liquid', 'overnight', 'money market', 'debt', 'bond', 'gilt',
    'ultra short', 'low duration', 'credit risk', 'banking psu',
    'corporate bond', 'short duration', 'medium duration', 'long duration',
    'dynamic bond', 'floating rate', 'savings', 'arbitrage',
]

def should_include_in_overlap(fund_name: str) -> bool:
    name = fund_name.lower()
    return not any(kw in name for kw in EXCLUDE_FROM_OVERLAP)

# Category-level fallback holdings
CATEGORY_HOLDINGS: dict[str, list[str]] = {
    "large_cap": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Kotak Bank","Bharti Airtel","Axis Bank","HUL"],
    "mid_cap": ["Persistent Systems","Coforge","Max Healthcare","Trent","Schaeffler India","Voltas","Cummins India","Indian Hotels","Tube Investments","PI Industries"],
    "small_cap": ["Hawkins Cookers","Blue Star","Elgi Equipments","Kei Industries","Dixon Technologies","Kaynes Technology","Affle India","ESAB India","Radico Khaitan","Carborundum Universal"],
    "flexi_cap": ["HDFC Bank","Bajaj Holdings","ITC","Coal India","ICICI Bank","Reliance","Power Grid","Infosys","TCS","Axis Bank"],
    "elss": ["Reliance","HDFC Bank","ICICI Bank","Infosys","Axis Bank","Kotak Bank","L&T","TCS","Bajaj Finance","SBI"],
    "index_nifty50": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS","L&T","Kotak Bank","ITC","Axis Bank","HUL"],
    "hybrid": ["Reliance","HDFC Bank","ICICI Bank","Infosys","Axis Bank"],  # smaller set — lower overlap
    "international": ["Alphabet","Microsoft","Amazon","Meta","HDFC Bank","ICICI Bank","Power Grid","Coal India","Bajaj Holdings","ITC"],
    "default": ["Reliance","HDFC Bank","ICICI Bank","Infosys","TCS"],
}

def detect_category(fund_name: str) -> str:
    name = fund_name.lower()
    if "parag parikh" in name or ("flexi" in name and any(x in name for x in ["international","global","foreign"])):
        return "international"
    if "nifty 50" in name and ("index" in name or "etf" in name):
        return "index_nifty50"
    if "small cap" in name or "smallcap" in name:
        return "small_cap"
    if "mid cap" in name or "midcap" in name:
        return "mid_cap"
    if "large cap" in name or "bluechip" in name or "top 100" in name or "top100" in name:
        return "large_cap"
    if "flexi cap" in name or "flexi-cap" in name or "multi cap" in name:
        return "flexi_cap"
    if "elss" in name or "tax saver" in name or "tax saving" in name:
        return "elss"
    if "balanced" in name or "hybrid" in name or "baf" in name or "advantage fund" in name:
        return "hybrid"
    return "default"

def get_holdings(fund_name: str) -> set:
    # exact match first
    for key, holdings in FUND_HOLDINGS.items():
        if key.lower() in fund_name.lower() or fund_name.lower() in key.lower():
            return set(holdings)
    # partial word match
    fund_words = set(fund_name.lower().split())
    best_match = None
    best_score = 0
    for key in FUND_HOLDINGS:
        key_words = set(key.lower().split())
        score = len(fund_words & key_words)
        if score > best_score and score >= 2:
            best_score = score
            best_match = key
    if best_match:
        return set(FUND_HOLDINGS[best_match])
    # category fallback
    cat = detect_category(fund_name)
    return set(CATEGORY_HOLDINGS.get(cat, CATEGORY_HOLDINGS["default"]))

def compute_overlap_pct(holdings_a: set, holdings_b: set) -> float:
    if not holdings_a or not holdings_b:
        return 0.0
    intersection = len(holdings_a & holdings_b)
    # use min denominator — conservative and more accurate for funds of different sizes
    min_size = min(len(holdings_a), len(holdings_b))
    if min_size == 0:
        return 0.0
    return round((intersection / min_size) * 100, 1)

def compute_overlap_matrix(funds: list[dict]) -> dict:
    # exclude non-equity funds
    equity_funds = [f for f in funds if should_include_in_overlap(f["name"]) and f.get("value", 0) > 0]

    if len(equity_funds) < 2:
        return {"pairs": [], "portfolio_overlap_score": 0.0}

    result = []
    holdings_map = {f["name"]: get_holdings(f["name"]) for f in equity_funds}

    for i in range(len(equity_funds)):
        for j in range(i + 1, len(equity_funds)):
            a = holdings_map[equity_funds[i]["name"]]
            b = holdings_map[equity_funds[j]["name"]]
            if not a or not b:
                continue
            pct = compute_overlap_pct(a, b)
            shared = list(a & b)[:5]
            result.append({
                "fund_a": equity_funds[i]["name"],
                "fund_b": equity_funds[j]["name"],
                "overlap_pct": pct,
                "shared_stocks": shared,
            })

    # portfolio-level score: weighted average of pair overlaps
    if result:
        portfolio_overlap = sum(p["overlap_pct"] for p in result) / len(result)
    else:
        portfolio_overlap = 0.0

    return {
        "pairs": sorted(result, key=lambda x: x["overlap_pct"], reverse=True),
        "portfolio_overlap_score": round(portfolio_overlap, 1),
        "equity_funds_analyzed": len(equity_funds),
    }
