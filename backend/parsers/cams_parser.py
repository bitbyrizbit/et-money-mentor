import pdfplumber
import re
import json
from datetime import datetime, date
from io import BytesIO

def parse_cams_pdf(file_bytes: bytes) -> dict:
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"

    result = _regex_parse(text)

    # if regex parser found nothing, fall back to LLM parsing
    if not result["funds"]:
        result = _llm_parse_fallback(text)

    return result

def _regex_parse(text: str) -> dict:
    investor_name = ""
    pan = ""
    fund_transactions = {}
    current_fund = None

    name_match = re.search(r"(?:Name|Investor Name)[:\s]+([A-Z][A-Z\s]+?)(?:\n|PAN|Email)", text)
    if name_match:
        investor_name = name_match.group(1).strip()

    pan_match = re.search(r"PAN[:\s]+([A-Z]{5}[0-9]{4}[A-Z])", text)
    if pan_match:
        pan = pan_match.group(1)

    lines = text.split("\n")

    for line in lines:
        line = line.strip()
        if not line:
            continue

        txn_pattern = re.match(
            r"(\d{2}-[A-Za-z]{3}-\d{4})\s+([\w\s\-\(\)]+?)\s+([\d,]+\.?\d*)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)",
            line
        )
        closing_pattern = re.match(r"Closing\s+Unit\s+Balance[:\s]+([\d,]+\.?\d*)", line, re.IGNORECASE)
        value_pattern = re.match(r"(?:Market\s+Value|Current\s+Value)[:\s]+(?:INR|Rs\.?|₹)?\s*([\d,]+\.?\d*)", line, re.IGNORECASE)

        is_fund_line = (
            len(line) > 15 and
            not txn_pattern and
            not closing_pattern and
            not value_pattern and
            any(kw in line for kw in ["Fund", "Scheme", "Growth", "IDCW", "Direct", "Regular", "Plan", "Bluechip", "Flexi", "ELSS", "Liquid", "Equity", "Debt", "Hybrid"]) and
            not line.startswith("Folio") and
            not line.startswith("Date") and
            not re.match(r"^\d", line) and
            len(line) < 150
        )

        if is_fund_line:
            current_fund = line
            if current_fund not in fund_transactions:
                fund_transactions[current_fund] = {"transactions": [], "closing_units": 0, "market_value": 0, "nav": 0}
        elif txn_pattern and current_fund:
            try:
                txn_date = datetime.strptime(txn_pattern.group(1), "%d-%b-%Y").date()
                amount = float(txn_pattern.group(3).replace(",", ""))
                nav = float(txn_pattern.group(4))
                fund_transactions[current_fund]["transactions"].append({"date": txn_date, "amount": amount, "nav": nav})
                fund_transactions[current_fund]["nav"] = nav
            except (ValueError, AttributeError):
                pass
        elif closing_pattern and current_fund:
            try:
                fund_transactions[current_fund]["closing_units"] = float(closing_pattern.group(1).replace(",", ""))
            except ValueError:
                pass
        elif value_pattern and current_fund:
            try:
                fund_transactions[current_fund]["market_value"] = float(value_pattern.group(1).replace(",", ""))
            except ValueError:
                pass

    funds = []
    for fund_name, data in fund_transactions.items():
        if not data["transactions"] and data["market_value"] == 0:
            continue
        cashflows = [((txn["date"]), -abs(txn["amount"])) for txn in data["transactions"]]
        if data["market_value"] > 0:
            cashflows.append((date.today(), data["market_value"]))
        funds.append({
            "name": fund_name,
            "value": data["market_value"],
            "closing_units": data["closing_units"],
            "nav": data["nav"],
            "transactions": [{"date": str(t["date"]), "amount": t["amount"]} for t in data["transactions"]],
            "cashflows": cashflows,
            "expense_ratio": infer_expense_ratio(fund_name)
        })

    return {"investor_name": investor_name, "pan": pan, "funds": funds, "raw_text_length": len(text), "parse_method": "regex"}

def _llm_parse_fallback(text: str) -> dict:
    # use Groq to extract fund data from raw PDF text when regex fails
    try:
        from groq import Groq
        import os
        from dotenv import load_dotenv
        load_dotenv()

        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        # send first 6000 chars to avoid token limits
        excerpt = text[:6000]

        prompt = f"""This is text extracted from an Indian mutual fund CAMS/KFintech consolidated account statement PDF.
Extract all fund holdings and return ONLY a JSON object with this exact structure, no markdown, no explanation:
{{
  "investor_name": "name or empty string",
  "funds": [
    {{
      "name": "full fund name",
      "value": current_market_value_as_number,
      "closing_units": units_as_number,
      "nav": current_nav_as_number,
      "total_invested": total_amount_invested_as_number
    }}
  ]
}}

PDF text:
{excerpt}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.0
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.lstrip("```json").lstrip("```").rstrip("```").strip()
        parsed = json.loads(raw)

        funds = []
        for f in parsed.get("funds", []):
            value = float(f.get("value", 0))
            total_invested = float(f.get("total_invested", value * 0.8))
            cashflows = []
            if total_invested > 0:
                # approximate: lump sum 3 years ago
                from datetime import date, timedelta
                cashflows = [(date.today() - timedelta(days=1095), -total_invested)]
            if value > 0:
                from datetime import date
                cashflows.append((date.today(), value))

            funds.append({
                "name": f.get("name", "Unknown Fund"),
                "value": value,
                "closing_units": float(f.get("closing_units", 0)),
                "nav": float(f.get("nav", 0)),
                "transactions": [],
                "cashflows": cashflows,
                "expense_ratio": infer_expense_ratio(f.get("name", ""))
            })

        return {
            "investor_name": parsed.get("investor_name", ""),
            "pan": "",
            "funds": funds,
            "raw_text_length": len(text),
            "parse_method": "llm_fallback"
        }
    except Exception:
        return {"investor_name": "", "pan": "", "funds": [], "raw_text_length": len(text), "parse_method": "failed"}

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
    return 0.6 if is_direct else 1.5
