from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO
import re

# Light theme — white background, dark text
PAGE_BG    = colors.white
RED        = colors.HexColor('#e63329')
DARK       = colors.HexColor('#111111')
BODY       = colors.HexColor('#333333')
MUTED      = colors.HexColor('#666666')
ROW_LIGHT  = colors.HexColor('#f9f9f9')
ROW_DARK   = colors.HexColor('#f1f1f1')
BORDER     = colors.HexColor('#e0e0e0')

def fmt_inr(n: float) -> str:
    # avoid rupee symbol — use Rs. for PDF safety
    if n >= 10000000:
        return f"Rs. {n/10000000:.2f} Cr"
    if n >= 100000:
        return f"Rs. {n/100000:.2f} L"
    return f"Rs. {n:,.0f}"

def strip_markdown(text: str) -> str:
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    # replace rupee symbol with Rs.
    text = text.replace('₹', 'Rs. ')
    return text.strip()

def create_xray_pdf(result: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    title_style = ParagraphStyle(
        'title', fontSize=26, fontName='Helvetica-Bold',
        textColor=RED, spaceAfter=2
    )
    brand_style = ParagraphStyle(
        'brand', fontSize=10, fontName='Helvetica',
        textColor=MUTED, spaceAfter=20
    )
    section_style = ParagraphStyle(
        'section', fontSize=12, fontName='Helvetica-Bold',
        textColor=DARK, spaceBefore=20, spaceAfter=8,
        borderPad=4,
    )
    body_style = ParagraphStyle(
        'body', fontSize=9, fontName='Helvetica',
        textColor=BODY, spaceAfter=4, leading=15
    )
    meta_style = ParagraphStyle(
        'meta', fontSize=9, fontName='Helvetica',
        textColor=MUTED, spaceAfter=2
    )
    footer_style = ParagraphStyle(
        'footer', fontSize=7, fontName='Helvetica',
        textColor=MUTED, alignment=TA_CENTER
    )

    story = []

    # ── Header ──────────────────────────────────────────
    story.append(Paragraph("ET Money Mentor", title_style))
    story.append(Paragraph("Portfolio X-Ray Report", brand_style))
    story.append(HRFlowable(width="100%", thickness=2, color=RED, spaceAfter=12))
    story.append(Paragraph(f"Investor: <b>{result.get('investor_name', 'Investor')}</b>", meta_style))
    story.append(Paragraph(f"Funds Analysed: {result.get('fund_count', len(result.get('funds', [])))}", meta_style))
    story.append(Spacer(1, 14))

    # ── Executive Summary ────────────────────────────────
    story.append(Paragraph("Executive Summary", section_style))

    xirr = result.get('overall_xirr')
    overlap = result.get('overlap', {}).get('portfolio_overlap_score', 0)
    annual_drag = result.get('expense_drag', {}).get('annual_drag', 0)
    drag_20yr = result.get('expense_drag', {}).get('expense_drag_20yr', 0)
    wer = result.get('expense_drag', {}).get('weighted_expense_ratio', 0)

    stats_data = [
        ["Metric", "Value", "Benchmark", "Assessment"],
        [
            "Portfolio Value",
            fmt_inr(result.get("total_value", 0)),
            "—",
            f"{result.get('fund_count', 0)} funds"
        ],
        [
            "True XIRR",
            f"{xirr:.1f}%" if xirr is not None else "N/A",
            "Nifty 50: ~12.3%",
            "Above avg" if (xirr or 0) > 12 else "Below avg"
        ],
        [
            "Annual Expense Drag",
            fmt_inr(annual_drag),
            "Direct plan: ~0.3%",
            f"WER: {wer:.2f}%"
        ],
        [
            "20-Year Expense Drag",
            fmt_inr(drag_20yr),
            "—",
            "Compounded loss"
        ],
        [
            "Portfolio Overlap",
            f"{overlap:.1f}%",
            "Ideal: < 40%",
            "High" if overlap > 50 else "Good"
        ],
    ]

    stats_table = Table(stats_data, colWidths=[4.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    stats_table.setStyle(TableStyle([
        # header row
        ('BACKGROUND', (0,0), (-1,0), RED),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        # data rows
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('TEXTCOLOR', (0,1), (-1,-1), DARK),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, ROW_LIGHT]),
        # first col bold
        ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0,1), (0,-1), MUTED),
        # grid
        ('GRID', (0,0), (-1,-1), 0.4, BORDER),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 6))

    # ── Holdings ─────────────────────────────────────────
    story.append(Paragraph("Holdings Breakdown", section_style))

    fund_rows = [["Fund Name", "Value", "XIRR", "Expense", "Type", "Signal"]]
    for f in result.get("funds", []):
        xirr_val = f.get("xirr")
        is_reg = f.get("is_regular", False)
        if (xirr_val or 0) > 12:
            signal = "Strong Hold"
        elif is_reg:
            signal = "Switch Direct"
        elif (xirr_val or 0) > 8:
            signal = "Watch"
        else:
            signal = "Review"

        name = f.get("name", "")
        if len(name) > 46:
            name = name[:46] + "..."

        fund_rows.append([
            name,
            fmt_inr(f.get("value", 0)),
            f"{xirr_val:.1f}%" if xirr_val is not None else "—",
            f"{f.get('expense_ratio', 0):.2f}%",
            "Regular" if is_reg else "Direct",
            signal,
        ])

    fund_table = Table(fund_rows, colWidths=[6.8*cm, 2.4*cm, 1.6*cm, 1.8*cm, 1.8*cm, 2.6*cm])
    fund_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, ROW_LIGHT]),
        ('TEXTCOLOR', (0,1), (-1,-1), DARK),
        ('GRID', (0,0), (-1,-1), 0.3, BORDER),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('FONTNAME', (0,1), (0,-1), 'Helvetica'),
    ]))
    story.append(fund_table)

    # ── AI Report ─────────────────────────────────────────
    ai_text = result.get("ai_report", "")
    if ai_text:
        story.append(Paragraph("AI Assessment", section_style))
        ai_head_style = ParagraphStyle(
            'ai_head', fontSize=10, fontName='Helvetica-Bold',
            textColor=RED, spaceBefore=12, spaceAfter=4
        )
        for line in ai_text.split('\n'):
            is_header = line.strip().startswith('#')
            clean = strip_markdown(line).strip()
            if not clean:
                story.append(Spacer(1, 4))
                continue
            if is_header:
                story.append(Paragraph(clean, ai_head_style))
            else:
                story.append(Paragraph(clean, body_style))

    # ── Footer ────────────────────────────────────────────
    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Generated by ET Money Mentor  |  ET AI Hackathon 2026  |  Not SEBI registered  |  For informational purposes only",
        footer_style
    ))

    doc.build(story)
    return buffer.getvalue()
