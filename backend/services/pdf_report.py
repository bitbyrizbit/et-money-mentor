from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from io import BytesIO
import re

ET_RED = colors.HexColor('#e63329')
ET_DARK = colors.HexColor('#111111')
ET_SURFACE = colors.HexColor('#1a1a1a')
ET_MUTED = colors.HexColor('#888888')
WHITE = colors.white
BLACK = colors.black

def fmt_inr(n: float) -> str:
    if n >= 10000000:
        return f"₹{n/10000000:.2f}Cr"
    if n >= 100000:
        return f"₹{n/100000:.2f}L"
    return f"₹{n:,.0f}"

def strip_markdown(text: str) -> str:
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    return text.strip()

def create_xray_pdf(result: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('title', fontSize=28, fontName='Helvetica-Bold', textColor=ET_RED, spaceAfter=4)
    subtitle_style = ParagraphStyle('subtitle', fontSize=11, fontName='Helvetica', textColor=ET_MUTED, spaceAfter=16)
    section_style = ParagraphStyle('section', fontSize=13, fontName='Helvetica-Bold', textColor=WHITE, spaceBefore=16, spaceAfter=8)
    body_style = ParagraphStyle('body', fontSize=9, fontName='Helvetica', textColor=colors.HexColor('#cccccc'), spaceAfter=4, leading=14)
    label_style = ParagraphStyle('label', fontSize=8, fontName='Helvetica-Bold', textColor=ET_MUTED, spaceAfter=2, wordWrap='CJK')

    story = []

    # cover
    story.append(Paragraph("ET Money Mentor", title_style))
    story.append(Paragraph("Portfolio X-Ray Report", subtitle_style))
    story.append(Paragraph(f"Prepared for: {result.get('investor_name', 'Investor')}", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ET_RED, spaceAfter=16))

    # headline stats
    story.append(Paragraph("Executive Summary", section_style))
    stats_data = [
        ["Portfolio Value", "True XIRR", "Annual Expense Drag", "Overlap Score"],
        [
            fmt_inr(result.get("total_value", 0)),
            f"{result.get('overall_xirr', 0):.1f}%" if result.get("overall_xirr") else "N/A",
            fmt_inr(result.get("expense_drag", {}).get("annual_drag", 0)),
            f"{result.get('overlap', {}).get('portfolio_overlap_score', 0):.1f}%",
        ]
    ]
    stats_table = Table(stats_data, colWidths=[4.2*cm]*4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ET_SURFACE),
        ('TEXTCOLOR', (0,0), (-1,0), ET_MUTED),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('BACKGROUND', (0,1), (-1,1), ET_DARK),
        ('TEXTCOLOR', (0,1), (-1,1), ET_RED),
        ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,1), (-1,1), 16),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [ET_SURFACE, ET_DARK]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#2a2a2a')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 16))

    # fund table
    story.append(Paragraph("Holdings Breakdown", section_style))
    fund_rows = [["Fund Name", "Value", "XIRR", "Expense Ratio", "Signal"]]
    for f in result.get("funds", []):
        signal = "Strong" if (f.get("xirr") or 0) > 12 else ("Switch to Direct" if f.get("is_regular") else "Review")
        fund_rows.append([
            f["name"][:50] + ("..." if len(f["name"]) > 50 else ""),
            fmt_inr(f.get("value", 0)),
            f"{f['xirr']:.1f}%" if f.get("xirr") is not None else "—",
            f"{f.get('expense_ratio', 0):.2f}%",
            signal,
        ])
    fund_table = Table(fund_rows, colWidths=[7.5*cm, 2.5*cm, 1.8*cm, 2.2*cm, 2.8*cm])
    fund_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ET_RED),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [ET_DARK, ET_SURFACE]),
        ('TEXTCOLOR', (0,1), (-1,-1), colors.HexColor('#cccccc')),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor('#2a2a2a')),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(fund_table)
    story.append(Spacer(1, 16))

    # AI report
    ai_text = result.get("ai_report", "")
    if ai_text:
        story.append(Paragraph("AI Assessment", section_style))
        for line in ai_text.split('\n'):
            line = strip_markdown(line).strip()
            if not line:
                story.append(Spacer(1, 4))
                continue
            story.append(Paragraph(line, body_style))

    # footer disclaimer
    story.append(Spacer(1, 24))
    story.append(HRFlowable(width="100%", thickness=0.5, color=ET_MUTED))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Generated by ET Money Mentor · ET AI Hackathon 2026 · Not SEBI registered · For informational purposes only",
        ParagraphStyle('footer', fontSize=7, fontName='Helvetica', textColor=ET_MUTED, alignment=TA_CENTER)
    ))

    doc.build(story)
    return buffer.getvalue()
