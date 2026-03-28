import pdfplumber
import re
import json
from datetime import datetime, date
from io import BytesIO

# --- Transaction classification ---
SKIP_KEYWORDS = [
    'sip cancelled', 'sip missed', 'nach bounce', 'nach cancelled',
    'fund renamed', 'fund wound up', 'wound up by trustee',
    'status change', 'fema compliance', 'face value split',
    'sebi directive', 'court order', 'isin change', 'merger',
    'allotment pending', 'nri to ri', 'nri→ri',
]
PURCHASE_KEYWORDS = [
    'sip purchase', 'lumpsum purchase', 'stp – switch in', 'stp switch in',
    'switch in', 'nfo purchase', 'nfo subscription', 'sip restart',
    'purchase', 'subscription', 'reinvestment',
]
REDEMPTION_KEYWORDS = [
    'redemption', 'switch out', 'stp – switch out', 'stp switch out',
    'swp', 'systematic withdrawal', 'partial redemption', 'full redemption',
]
DIVIDEND_REINVEST_KEYWORDS = ['dividend reinvestment', 'idcw reinvestment', 'div reinvest']
DIVIDEND_PAYOUT_KEYWORDS = ['dividend paid', 'idcw paid', 'dividend payout', 'div paid']
BONUS_KEYWORDS = ['bonus units', 'bonus allotment']

def classify_transaction(description: str) -> str:
    desc = description.lower()
    for kw in SKIP_KEYWORDS:
        if kw in desc:
            return 'skip'
    for kw in DIVIDEND_PAYOUT_KEYWORDS:
        if kw in desc:
            return 'div_payout'
    for kw in BONUS_KEYWORDS:
        if kw in desc:
            return 'bonus'
    for kw in DIVIDEND_REINVEST_KEYWORDS:
        if kw in desc:
            return 'div_reinvest'
    for kw in REDEMPTION_KEYWORDS:
        if kw in desc:
            return 'redemption'
    for kw in PURCHASE_KEYWORDS:
        if kw in desc:
            return 'purchase'
    return 'purchase'  # default

# --- Fund header detection ---
DISQUALIFIERS = [
    'amc:', 'amc :', 'registrar', 'sebi', 'cams', 'computer age',
    'statement', 'generated', 'detailed', 'total', 'asset class',
    'category:', 'benchmark:', 'rta code:', 'transaction history',
    'folio', 'isin:', 'fund summary', 'closing unit', 'market value',
    'cost value', 'xirr', '1y return', '3y return', 'abs. return',
    'avg cost', 'capital gains', 'active sip', 'portfolio summary',
    'no. of schemes', 'gain/loss', 'year-wise', 'rebalancing',
    'disclaimer', 'important', 'investor profile', 'portfolio analytics',
    'account summary', 'period:', 'date:', 'nav date',
]

PLAN_QUALIFIERS = [
    'growth', 'idcw', 'direct', 'regular', 'plan', 'option',
    'elss', 'liquid', 'overnight', 'index', 'flexi', 'cap',
    'bluechip', 'balanced', 'advantage', 'hybrid', 'debt',
    'bond', 'gilt', 'arbitrage', 'dynamic', 'mid', 'small',
    'large', 'multi', 'equity', 'tax',
]

def is_fund_header(line: str) -> bool:
    if not line or len(line) < 15 or len(line) > 160:
        return False
    line_lower = line.lower()
    for disq in DISQUALIFIERS:
        if disq in line_lower:
            return False
    # must not start with digit or special char
    if not line[0].isalpha():
        return False
    # must contain 'fund' or 'scheme'
    has_fund = 'fund' in line_lower or 'scheme' in line_lower
    # must have a plan/option qualifier to avoid generic lines
    has_qualifier = any(q in line_lower for q in PLAN_QUALIFIERS)
    return has_fund and has_qualifier

def extract_expense_ratio_from_text(text: str) -> float | None:
    pattern = re.compile(r'Expense\s+Ratio[:\s]+(\d+\.?\d*)%', re.IGNORECASE)
    match = pattern.search(text)
    if match:
        return float(match.group(1))
    return None

def infer_expense_ratio(fund_name: str) -> float:
    name = fund_name.lower()
    is_direct = "direct" in name
    if "liquid" in name or "overnight" in name:
        return 0.1 if is_direct else 0.3
    if "debt" in name or "bond" in name or "gilt" in name:
        return 0.25 if is_direct else 0.8
    if "index" in name or "nifty 50" in name or "sensex" in name:
        return 0.1 if is_direct else 0.5
    if "small cap" in name:
        return 0.35 if is_direct else 1.8
    if "mid cap" in name or "midcap" in name:
        return 0.4 if is_direct else 1.6
    if "large cap" in name or "bluechip" in name:
        return 0.5 if is_direct else 1.5
    if "flexi" in name or "multi cap" in name:
        return 0.45 if is_direct else 1.4
    if "elss" in name or "tax" in name:
        return 0.55 if is_direct else 1.6
    if "balanced" in name or "hybrid" in name or "advantage" in name:
        return 0.5 if is_direct else 1.3
    return 0.6 if is_direct else 1.5

def extract_pdf_text(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"
    return text

def extract_investor_profile(text: str) -> dict:
    name = ""
    pan = ""
    name_match = re.search(r"(?:Name|Investor Name|Unitholder Name)[:\s]+([A-Z][A-Z\s]+?)(?:\n|PAN|Email|Mobile)", text)
    if name_match:
        name = name_match.group(1).strip()
    pan_match = re.search(r"PAN[:\s]+([A-Z]{5}[0-9]{4}[A-Z])", text)
    if pan_match:
        pan = pan_match.group(1)
    return {"name": name, "pan": pan}

def split_into_fund_blocks(text: str) -> list[str]:
    lines = text.split('\n')
    blocks = []
    current_block: list[str] = []
    for line in lines:
        stripped = line.strip()
        if is_fund_header(stripped):
            if current_block and len(current_block) > 2:
                blocks.append('\n'.join(current_block))
            current_block = [stripped]
        elif current_block:
            current_block.append(stripped)
    if current_block and len(current_block) > 2:
        blocks.append('\n'.join(current_block))
    return blocks

def parse_fund_block(block: str) -> dict | None:
    lines = [l.strip() for l in block.split('\n') if l.strip()]
    if not lines:
        return None

    fund_name = lines[0]
    if not is_fund_header(fund_name):
        return None

    # extract expense ratio from block text
    expense_ratio = extract_expense_ratio_from_text(block) or infer_expense_ratio(fund_name)

    transactions = []
    closing_units = 0.0
    market_value = 0.0
    nav = 0.0

    # patterns
    txn_pattern = re.compile(
        r"(\d{2}-[A-Za-z]{3}-\d{4})\s+([\w\s\-\(\)/–]+?)\s+([\d,]+\.?\d*)\s+([\d.]+)\s+([\d.]+)\s*([\d.]*)"
    )
    closing_pattern = re.compile(r"Closing\s+(?:Unit\s+)?Balance[:\s]+([\d,]+\.?\d*)", re.IGNORECASE)
    market_pattern = re.compile(r"(?:Market\s+Value|Current\s+Value)[:\s]+(?:INR|Rs\.?|₹)?\s*([\d,]+\.?\d*)", re.IGNORECASE)
    nav_pattern = re.compile(r"(?:Current\s+NAV|NAV\s+as\s+on)[:\s]+(?:INR|Rs\.?|₹)?\s*([\d,]+\.?\d*)", re.IGNORECASE)

    for line in lines[1:]:
        # closing units
        m = closing_pattern.search(line)
        if m:
            try:
                closing_units = float(m.group(1).replace(",", ""))
            except ValueError:
                pass
            continue

        # market value
        m = market_pattern.search(line)
        if m:
            try:
                market_value = float(m.group(1).replace(",", ""))
            except ValueError:
                pass
            continue

        # current nav
        m = nav_pattern.search(line)
        if m:
            try:
                nav = float(m.group(1).replace(",", ""))
            except ValueError:
                pass
            continue

        # transaction
        m = txn_pattern.match(line)
        if m:
            try:
                txn_date = datetime.strptime(m.group(1), "%d-%b-%Y").date()
                description = m.group(2).strip()
                amount = float(m.group(3).replace(",", ""))
                txn_nav = float(m.group(4))
                units = float(m.group(5))

                txn_type = classify_transaction(description)
                if txn_type == 'skip':
                    continue

                if txn_nav > 0:
                    nav = txn_nav

                transactions.append({
                    "date": txn_date,
                    "description": description,
                    "amount": amount,
                    "nav": txn_nav,
                    "units": units,
                    "type": txn_type,
                })
            except (ValueError, AttributeError):
                pass

    # if market_value still 0 but we have closing_units and nav, compute it
    if market_value == 0 and closing_units > 0 and nav > 0:
        market_value = round(closing_units * nav, 2)

    return {
        "name": fund_name,
        "transactions": transactions,
        "closing_units": closing_units,
        "market_value": market_value,
        "nav": nav,
        "expense_ratio": expense_ratio,
    }

def enrich_fund(raw: dict) -> dict:
    transactions = raw.get("transactions", [])
    market_value = raw.get("market_value", 0)

    # build cashflows with correct sign convention
    cashflows = []
    for txn in transactions:
        t = txn.get("type", "purchase")
        amount = txn.get("amount", 0)
        d = txn.get("date")
        if t in ("purchase", "div_reinvest"):
            cashflows.append((d, -abs(amount)))   # money out = negative
        elif t == "redemption":
            cashflows.append((d, +abs(amount)))   # money in = positive
        # skip, div_payout, bonus → no cashflow effect

    # current market value = hypothetical sale today = positive
    if market_value > 0:
        cashflows.append((date.today(), +market_value))

    return {
        "name": raw["name"],
        "value": market_value,
        "closing_units": raw.get("closing_units", 0),
        "nav": raw.get("nav", 0),
        "expense_ratio": raw["expense_ratio"],
        "transactions": [
            {"date": str(t["date"]), "amount": t["amount"], "type": t.get("type","purchase")}
            for t in transactions
        ],
        "cashflows": cashflows,
        "is_regular": "regular" in raw["name"].lower(),
    }

def is_valid_fund(raw: dict) -> bool:
    if not raw:
        return False
    if not raw.get("name"):
        return False
    # must have either transactions or a market value
    return len(raw.get("transactions", [])) > 0 or raw.get("market_value", 0) > 0

def _llm_parse_fallback(text: str) -> dict:
    try:
        from groq import Groq
        import os
        from dotenv import load_dotenv
        load_dotenv()
        client_g = Groq(api_key=os.getenv("GROQ_API_KEY"))
        excerpt = text[:8000]
        prompt = f"""This is text extracted from an Indian mutual fund CAMS/KFintech consolidated account statement PDF.
Extract all fund holdings. Return ONLY raw JSON. No markdown. No ```json. No explanation.
Start your response with {{ and end with }}

{{
  "investor_name": "name or empty string",
  "funds": [
    {{
      "name": "full fund name including plan and option",
      "value": current_market_value_as_number,
      "closing_units": units_as_number,
      "nav": current_nav_as_number,
      "total_invested": total_amount_invested_as_number
    }}
  ]
}}

PDF text:
{excerpt}"""
        response = client_g.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.0,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw).strip()
        start = raw.find('{')
        end = raw.rfind('}')
        if start != -1 and end != -1:
            raw = raw[start:end+1]
        parsed = json.loads(raw)
        funds = []
        for f in parsed.get("funds", []):
            value = float(f.get("value", 0))
            total_invested = float(f.get("total_invested", value * 0.75))
            cashflows = []
            if total_invested > 0:
                from datetime import timedelta
                cashflows.append((date.today() - timedelta(days=1095), -total_invested))
            if value > 0:
                cashflows.append((date.today(), value))
            funds.append({
                "name": f.get("name", "Unknown Fund"),
                "value": value,
                "closing_units": float(f.get("closing_units", 0)),
                "nav": float(f.get("nav", 0)),
                "transactions": [],
                "cashflows": cashflows,
                "expense_ratio": infer_expense_ratio(f.get("name", "")),
                "is_regular": "regular" in f.get("name", "").lower(),
            })
        return {
            "investor_name": parsed.get("investor_name", ""),
            "pan": "",
            "funds": funds,
            "raw_text_length": len(text),
            "parse_method": "llm_fallback",
        }
    except Exception as e:
        return {"investor_name": "", "pan": "", "funds": [], "raw_text_length": len(text), "parse_method": "failed"}

def parse_cams_pdf(file_bytes: bytes) -> dict:
    text = extract_pdf_text(file_bytes)
    investor = extract_investor_profile(text)

    # three-pass parsing
    fund_blocks = split_into_fund_blocks(text)
    raw_funds = [parse_fund_block(block) for block in fund_blocks]
    valid_raw = [f for f in raw_funds if f and is_valid_fund(f)]
    funds = [enrich_fund(f) for f in valid_raw]

    # fallback to LLM if three-pass found nothing
    if not funds:
        result = _llm_parse_fallback(text)
        result["investor_name"] = investor["name"] or result.get("investor_name", "")
        result["pan"] = investor["pan"]
        return result

    return {
        "investor_name": investor["name"],
        "pan": investor["pan"],
        "funds": funds,
        "raw_text_length": len(text),
        "parse_method": "three_pass",
        "fund_blocks_found": len(fund_blocks),
        "funds_valid": len(funds),
    }
