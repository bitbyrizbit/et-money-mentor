from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_xray_report(portfolio_summary: dict) -> str:
    prompt = f"""You are India's most insightful mutual fund advisor. Analyze this portfolio and give a brutal, honest, specific assessment.

Portfolio Data:
- Investor: {portfolio_summary.get('investor_name', 'Investor')}
- Total Value: ₹{portfolio_summary.get('total_value', 0):,.0f}
- Number of Funds: {portfolio_summary.get('fund_count', 0)}
- True XIRR: {portfolio_summary.get('xirr_pct', 0):.1f}%
- Weighted Expense Ratio: {portfolio_summary.get('weighted_expense_ratio', 0):.2f}%
- Annual Expense Drag: ₹{portfolio_summary.get('annual_drag', 0):,.0f}
- 20-Year Expense Drag: ₹{portfolio_summary.get('expense_drag_20yr', 0):,.0f}
- Portfolio Overlap Score: {portfolio_summary.get('overlap_score', 0):.0f}%
- Funds held: {', '.join(portfolio_summary.get('fund_names', []))}
- High overlap pairs: {portfolio_summary.get('high_overlap_pairs', [])}

Give your response in exactly this structure:

## Portfolio Health: [Score out of 10]

## What's Working
[2-3 specific positives]

## The Hard Truth
[The most important problems — be specific with numbers, name the funds, don't be generic]

## Rebalancing Plan
[Specific actionable steps: which funds to exit, which to consolidate, what to add — with reasoning]

## The One Thing To Do This Week
[Single most impactful immediate action]

Be specific to Indian market context. Reference SEBI categories. Use rupee amounts from the data. Do not be generic."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1200,
        temperature=0.3
    )
    return response.choices[0].message.content


def generate_health_score_report(data: dict) -> str:
    prompt = f"""You are a certified Indian financial planner. Score this person's financial health.

Data provided:
- Age: {data.get('age')}
- Monthly Income: ₹{data.get('income', 0):,}
- Monthly Expenses: ₹{data.get('expenses', 0):,}
- Emergency Fund (months): {data.get('emergency_months', 0)}
- Has term insurance: {data.get('has_term', False)}
- Term cover: ₹{data.get('term_cover', 0):,}
- Has health insurance: {data.get('has_health', False)}
- Health cover: ₹{data.get('health_cover', 0):,}
- Total investments: ₹{data.get('investments', 0):,}
- Outstanding loans: ₹{data.get('loans', 0):,}
- Monthly EMI: ₹{data.get('emi', 0):,}
- Tax regime: {data.get('tax_regime', 'new')}
- PF/NPS contribution: ₹{data.get('pf_nps', 0):,}/year

Score each dimension from 0-100 and give one specific action.
Respond ONLY in this JSON format, no markdown, no extra text:
{{
  "overall_score": <number>,
  "grade": "<A+/A/B+/B/C+/C/D>",
  "dimensions": {{
    "emergency_preparedness": {{"score": <0-100>, "status": "<Good/Needs Work/Critical>", "action": "<specific action>"}},
    "insurance_coverage": {{"score": <0-100>, "status": "<Good/Needs Work/Critical>", "action": "<specific action>"}},
    "investment_diversification": {{"score": <0-100>, "status": "<Good/Needs Work/Critical>", "action": "<specific action>"}},
    "debt_health": {{"score": <0-100>, "status": "<Good/Needs Work/Critical>", "action": "<specific action>"}},
    "tax_efficiency": {{"score": <0-100>, "status": "<Good/Needs Work/Critical>", "action": "<specific action>"}},
    "retirement_readiness": {{"score": <0-100>, "status": "<Good/Needs Work/Critical>", "action": "<specific action>"}}
  }},
  "top_priority": "<the single most urgent thing to fix>",
  "monthly_surplus": <number>,
  "savings_rate_pct": <number>
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
        temperature=0.1
    )
    return response.choices[0].message.content


def generate_fire_plan(data: dict) -> str:
    prompt = f"""You are India's top FIRE (Financial Independence, Retire Early) advisor. Build a complete plan.

Profile:
- Age: {data.get('age')}
- Target retirement age: {data.get('target_age')}
- Monthly income: ₹{data.get('income', 0):,}
- Monthly expenses: ₹{data.get('expenses', 0):,}
- Current investments: ₹{data.get('current_investments', 0):,}
- Monthly SIP currently: ₹{data.get('current_sip', 0):,}
- Risk profile: {data.get('risk_profile', 'moderate')}
- Goals: {data.get('goals', [])}

Provide:
## FIRE Number
[Calculate exact corpus needed using 25x annual expenses rule, adjusted for India inflation at 6%]

## Timeline Assessment
[Can they retire at target age? What's realistic?]

## Month-by-Month SIP Allocation
[Specific fund categories with amounts, stepping up 10% annually]

## Asset Allocation Roadmap
[How allocation shifts every 5 years as retirement approaches]

## Tax Optimization
[ELSS, NPS, HRA, 80C — specific numbers]

## The 3 Non-Negotiables
[Three things they must do or the plan fails]

Be specific. Use Indian fund categories. Give rupee numbers."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500,
        temperature=0.2
    )
    return response.choices[0].message.content
