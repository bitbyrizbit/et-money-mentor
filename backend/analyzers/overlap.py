FUND_HOLDINGS = {
    "Mirae Asset Large Cap Fund": ["Reliance", "HDFC Bank", "Infosys", "TCS", "ICICI Bank", "Kotak Bank", "L&T", "Axis Bank", "SBI", "Bharti Airtel"],
    "Axis Bluechip Fund": ["Reliance", "HDFC Bank", "Infosys", "TCS", "ICICI Bank", "Bajaj Finance", "Kotak Bank", "Avenue Supermarts", "Titan", "Asian Paints"],
    "HDFC Top 100 Fund": ["Reliance", "HDFC Bank", "ICICI Bank", "Infosys", "TCS", "SBI", "L&T", "Kotak Bank", "Bharti Airtel", "ITC"],
    "Parag Parikh Flexi Cap Fund": ["HDFC Bank", "Bajaj Holdings", "ITC", "Coal India", "Alphabet", "Microsoft", "Amazon", "Meta", "Power Grid", "ICICI Bank"],
    "Kotak Emerging Equity Fund": ["Persistent Systems", "Coforge", "Tube Investments", "Schaeffler India", "Cummins India", "Kaynes Technology", "Astral", "Praj Industries", "KPIT Technologies", "Sona BLW"],
    "SBI Small Cap Fund": ["Hawkins Cookers", "Blue Star", "Elgi Equipments", "Suprajit Engineering", "Shivalik Bimetal", "Safari Industries", "ESAB India", "Garware Technical Fibres", "Repco Home Finance", "Triveni Engineering"],
    "Nippon India Small Cap Fund": ["Affle India", "Kei Industries", "Bharat Dynamics", "NIIT Technologies", "Carborundum Universal", "Multi Commodity Exchange", "Tube Investments", "Dixon Technologies", "Kaynes Technology", "Radico Khaitan"],
    "ICICI Prudential Bluechip Fund": ["Reliance", "HDFC Bank", "ICICI Bank", "Infosys", "TCS", "L&T", "SBI", "Bharti Airtel", "Maruti Suzuki", "Sun Pharma"],
    "DSP Midcap Fund": ["Persistent Systems", "Coforge", "Max Healthcare", "Tube Investments", "Schaeffler India", "Voltas", "Astral", "Cummins India", "Indian Hotels", "PI Industries"],
    "Quant Active Fund": ["Reliance", "HDFC Bank", "ITC", "ICICI Bank", "Adani Enterprises", "Adani Ports", "LIC", "SBI", "Samvardhana Motherson", "ONGC"],
}

DEFAULT_HOLDINGS = ["Reliance", "HDFC Bank", "ICICI Bank", "Infosys", "TCS"]

def get_holdings(fund_name: str) -> set:
    for key in FUND_HOLDINGS:
        if key.lower() in fund_name.lower() or fund_name.lower() in key.lower():
            return set(FUND_HOLDINGS[key])
    name_lower = fund_name.lower()
    if "large cap" in name_lower or "bluechip" in name_lower or "top 100" in name_lower:
        return set(["Reliance", "HDFC Bank", "Infosys", "TCS", "ICICI Bank", "Kotak Bank", "L&T", "SBI", "Bharti Airtel", "Axis Bank"])
    if "small cap" in name_lower:
        return set(["Hawkins Cookers", "Blue Star", "Elgi Equipments", "Kei Industries", "Dixon Technologies", "Kaynes Technology", "Affle India", "ESAB India", "Radico Khaitan", "Carborundum Universal"])
    if "mid cap" in name_lower or "midcap" in name_lower:
        return set(["Persistent Systems", "Coforge", "Max Healthcare", "Tube Investments", "Schaeffler India", "Voltas", "Astral", "Cummins India", "Indian Hotels", "PI Industries"])
    if "flexi" in name_lower or "multi cap" in name_lower:
        return set(["HDFC Bank", "Bajaj Holdings", "ITC", "Coal India", "Alphabet", "ICICI Bank", "Reliance", "Power Grid", "Infosys", "TCS"])
    if "elss" in name_lower or "tax" in name_lower:
        return set(["Reliance", "HDFC Bank", "ICICI Bank", "Infosys", "Axis Bank", "Kotak Bank", "L&T", "TCS", "Bajaj Finance", "SBI"])
    return set(DEFAULT_HOLDINGS)

def compute_overlap_matrix(funds: list[dict]) -> dict:
    result = []
    names = [f["name"] for f in funds]
    holdings_map = {f["name"]: get_holdings(f["name"]) for f in funds}

    for i in range(len(funds)):
        for j in range(i + 1, len(funds)):
            a = holdings_map[funds[i]["name"]]
            b = holdings_map[funds[j]["name"]]
            if not a or not b:
                continue
            overlap = len(a & b) / len(a | b)
            shared = list(a & b)[:5]
            result.append({
                "fund_a": names[i],
                "fund_b": names[j],
                "overlap_pct": round(overlap * 100, 1),
                "shared_stocks": shared
            })

    all_holdings = list(holdings_map.values())
    if len(all_holdings) > 1:
        total_pairs = 0
        total_overlap = 0
        for i in range(len(all_holdings)):
            for j in range(i + 1, len(all_holdings)):
                a, b = all_holdings[i], all_holdings[j]
                if a and b:
                    total_overlap += len(a & b) / len(a | b)
                    total_pairs += 1
        portfolio_overlap = (total_overlap / total_pairs * 100) if total_pairs else 0
    else:
        portfolio_overlap = 0

    return {
        "pairs": result,
        "portfolio_overlap_score": round(portfolio_overlap, 1)
    }
