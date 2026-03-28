from groq import Groq
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def _clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw).strip()
    start = raw.find('{')
    end = raw.rfind('}')
    if start != -1 and end != -1:
        return raw[start:end+1]
    return raw

def generate_xray_report(portfolio_summary: dict) -> str:
    funds_detail = portfolio_summary.get("funds_with_xirr", [])
    regular_count = portfolio_summary.get("regular_plan_count", 0)

    fund_lines = ""
    for f in funds_detail[:10]:
        xirr_str = f"{f['xirr']:.1f}%" if f.get("xirr") is not None else "N/A"
        plan = "Regular ⚠️" if f.get("is_regular") else "Direct"
        fund_lines += f"  • {f['name'][:55]}: ₹{f['value']:,.0f}, XIRR {xirr_str}, {plan}\n"

    prompt = f"""You are India's most insightful mutual fund advisor. Analyze this REAL portfolio data and give a specific, data-driven assessment. Do NOT be generic.

PORTFOLIO DATA:
- Investor: {portfolio_summary.get('investor_name')}
- Total Value: ₹{portfolio_summary.get('total_value', 0):,.0f}
- Fund Count: {portfolio_summary.get('fund_count')}
- Portfolio XIRR: {portfolio_summary.get('xirr_pct', 0):.1f}% (vs Nifty 50: {portfolio_summary.get('nifty_1y', 12.3):.1f}%)
- Regular Plans: {regular_count} funds (should be 0)
- Weighted Expense Ratio: {portfolio_summary.get('weighted_expense_ratio', 0):.2f}%
- Annual Expense Drag: ₹{portfolio_summary.get('annual_drag', 0):,.0f}
- 20-Year Drag: ₹{portfolio_summary.get('expense_drag_20yr', 0):,.0f}
- Overlap Score: {portfolio_summary.get('overlap_score', 0):.1f}%
- Highest XIRR fund: {portfolio_summary.get('highest_xirr_fund', '')}
- Lowest XIRR fund: {portfolio_summary.get('lowest_xirr_fund', '')}

INDIVIDUAL FUNDS:
{fund_lines}

HIGH OVERLAP PAIRS:
{chr(10).join(portfolio_summary.get('high_overlap_pairs', [])) or 'None detected'}

Write in this exact structure. Be SPECIFIC — name the funds, use the actual numbers:

## Portfolio Health: [X/10]

## What's Working
[2-3 specific positives using actual fund names and numbers from the data above]

## The Hard Truth
[The most important problems — name specific funds, use exact rupee amounts, don't be vague]

## Rebalancing Plan
[Exact steps: which fund to exit, which to consolidate into, what to add and why]

## The One Thing To Do This Week
[Single most impactful action with exact fund name and estimated annual savings]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1400,
        temperature=0.25,
    )
    return response.choices[0].message.content

def generate_health_score_report(data: dict) -> dict:
    computed = data.get("_computed", {})
    surplus = computed.get("monthly_surplus", data.get("income", 0) - data.get("expenses", 0))
    savings_rate = computed.get("savings_rate", 0)
    debt_ratio = computed.get("debt_to_income", 0)

    prompt = f"""You are a certified Indian financial planner. Score this person's financial health across 6 dimensions.

DATA:
- Age: {data.get('age')} | Income: ₹{data.get('income', 0):,}/mo | Expenses: ₹{data.get('expenses', 0):,}/mo
- Monthly Surplus: ₹{surplus:,.0f} | Savings Rate: {savings_rate:.1f}%
- Emergency Fund: {data.get('emergency_months', 0)} months
- Term Insurance: {'Yes, ₹' + f"{data.get('term_cover', 0):,}" if data.get('has_term') else 'No'}
- Health Insurance: {'Yes, ₹' + f"{data.get('health_cover', 0):,}" if data.get('has_health') else 'No'}
- Total Investments: ₹{data.get('investments', 0):,}
- Outstanding Loans: ₹{data.get('loans', 0):,} | Monthly EMI: ₹{data.get('emi', 0):,}
- EMI-to-Income Ratio: {debt_ratio:.1f}%
- Tax Regime: {data.get('tax_regime', 'new')}
- Annual PF+NPS: ₹{data.get('pf_nps', 0):,}

SCORING RULES YOU MUST FOLLOW:
- Emergency fund 0 months → max 10/100 on emergency_preparedness
- Emergency fund <3 months → max 35/100
- No term insurance + income > 0 → max 25/100 on insurance_coverage
- EMI/income > 50% → max 20/100 on debt_health
- EMI/income > 35% → max 45/100 on debt_health
- Savings rate <0% → overall max 20/100
- Savings rate <10% → overall max 40/100

Respond ONLY in this exact JSON. No markdown. No explanation. Start with {{ end with }}:
{{
  "overall_score": <0-100>,
  "grade": "<A+|A|B+|B|C+|C|D>",
  "dimensions": {{
    "emergency_preparedness": {{"score": <0-100>, "status": "<Good|Needs Work|Critical>", "action": "<specific action>"}},
    "insurance_coverage": {{"score": <0-100>, "status": "<Good|Needs Work|Critical>", "action": "<specific action>"}},
    "investment_diversification": {{"score": <0-100>, "status": "<Good|Needs Work|Critical>", "action": "<specific action>"}},
    "debt_health": {{"score": <0-100>, "status": "<Good|Needs Work|Critical>", "action": "<specific action>"}},
    "tax_efficiency": {{"score": <0-100>, "status": "<Good|Needs Work|Critical>", "action": "<specific action>"}},
    "retirement_readiness": {{"score": <0-100>, "status": "<Good|Needs Work|Critical>", "action": "<specific action>"}}
  }},
  "top_priority": "<single most urgent action>",
  "monthly_surplus": {surplus},
  "savings_rate_pct": {round(savings_rate, 1)}
}}"""

    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=900,
                temperature=0.05,
            )
            raw = _clean_json(response.choices[0].message.content)
            return json.loads(raw)
        except (json.JSONDecodeError, KeyError) as e:
            if attempt == 2:
                # safe fallback
                return {
                    "overall_score": max(10, min(50, int(savings_rate * 2))),
                    "grade": "C",
                    "dimensions": {
                        dim: {"score": 50, "status": "Needs Work", "action": "Complete detailed assessment"}
                        for dim in ["emergency_preparedness","insurance_coverage","investment_diversification","debt_health","tax_efficiency","retirement_readiness"]
                    },
                    "top_priority": "Complete all fields for a detailed analysis",
                    "monthly_surplus": int(surplus),
                    "savings_rate_pct": round(savings_rate, 1),
                }

def apply_hard_score_constraints(data: dict, result: dict) -> dict:
    """Override AI scores where math is deterministic."""
    dims = result.get("dimensions", {})

    # emergency fund
    em = data.get("emergency_months", 0)
    if em == 0:
        dims["emergency_preparedness"]["score"] = min(dims["emergency_preparedness"].get("score", 0), 10)
        dims["emergency_preparedness"]["status"] = "Critical"
    elif em < 3:
        dims["emergency_preparedness"]["score"] = min(dims["emergency_preparedness"].get("score", 0), 35)
        dims["emergency_preparedness"]["status"] = "Critical"
    elif em < 6:
        dims["emergency_preparedness"]["score"] = min(dims["emergency_preparedness"].get("score", 0), 65)
        dims["emergency_preparedness"]["status"] = "Needs Work"

    # term insurance
    if not data.get("has_term") and data.get("income", 0) > 0:
        dims["insurance_coverage"]["score"] = min(dims["insurance_coverage"].get("score", 0), 25)
        dims["insurance_coverage"]["status"] = "Critical"

    # debt ratio
    emi = data.get("emi", 0)
    income = data.get("income", 1)
    ratio = emi / income if income > 0 else 0
    if ratio > 0.5:
        dims["debt_health"]["score"] = min(dims["debt_health"].get("score", 0), 20)
        dims["debt_health"]["status"] = "Critical"
    elif ratio > 0.35:
        dims["debt_health"]["score"] = min(dims["debt_health"].get("score", 0), 45)
        dims["debt_health"]["status"] = "Needs Work"

    # savings rate
    surplus = data.get("income", 0) - data.get("expenses", 0) - emi
    savings_rate = (surplus / income * 100) if income > 0 else 0
    if savings_rate < 0:
        result["overall_score"] = min(result.get("overall_score", 0), 20)
    elif savings_rate < 10:
        result["overall_score"] = min(result.get("overall_score", 0), 40)

    result["dimensions"] = dims
    result["monthly_surplus"] = round(surplus)
    result["savings_rate_pct"] = round(savings_rate, 1)
    return result

def generate_fire_plan(data: dict) -> str:
    roadmap = data.get("_roadmap", {})

    fire_corpus = roadmap.get("fire_corpus", 0)
    years = roadmap.get("years_to_retire", 0)
    required_sip = roadmap.get("required_monthly_sip_flat", 0)
    step_up_sip = roadmap.get("required_monthly_sip_stepup", 0)
    is_on_track = roadmap.get("is_on_track", False)
    shortfall = roadmap.get("shortfall", 0)
    future_expense = roadmap.get("future_monthly_expense", 0)

    prompt = f"""You are India's top FIRE advisor. Build a complete, actionable retirement plan using these PRE-CALCULATED numbers — do not recalculate them:

CALCULATED NUMBERS (use these exactly):
- FIRE Corpus Required: ₹{fire_corpus:,.0f} ({fire_corpus/10000000:.2f} Crore)
- Years to Retire: {years} years (from age {data.get('age')} to {data.get('target_age')})
- Monthly Expenses at Retirement (inflation-adjusted): ₹{future_expense:,.0f}
- Current Portfolio Trajectory: ₹{roadmap.get('current_trajectory', 0):,.0f}
- Shortfall: ₹{shortfall:,.0f}
- Required Flat Monthly SIP: ₹{required_sip:,.0f}
- Required Step-Up SIP (10% annual increase): ₹{step_up_sip:,.0f}/month (starting amount)
- On Track: {'YES' if is_on_track else 'NO'}

INVESTOR PROFILE:
- Age: {data.get('age')} | Target Retirement: {data.get('target_age')}
- Monthly Income: ₹{data.get('income', 0):,} | Expenses: ₹{data.get('expenses', 0):,}
- Current Investments: ₹{data.get('current_investments', 0):,}
- Current SIP: ₹{data.get('current_sip', 0):,}/month
- Risk Profile: {data.get('risk_profile', 'moderate')}
- Goals: {', '.join(data.get('goals', [])) or 'General FIRE'}

Write a complete plan in this exact structure:

## FIRE Number: ₹{fire_corpus:,.0f}

## Timeline Assessment
[Are they on track? Specific gap analysis using the numbers above]

## Monthly SIP Allocation
[Break down the ₹{required_sip:,.0f} flat SIP OR ₹{step_up_sip:,.0f} step-up SIP across specific SEBI fund categories with exact amounts and rationale]

## Asset Allocation Roadmap
[How allocation shifts every 5 years from now to retirement — specific percentages]

## Tax Optimization
[ELSS, NPS Tier 1 (80CCD1B ₹50,000 extra deduction), HRA, 80C — specific amounts for this person's income]

## The 3 Non-Negotiables
[Three things that will make or break this plan — be direct and specific]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1800,
        temperature=0.2,
    )
    return response.choices[0].message.content
