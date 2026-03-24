"""
Enterprise-grade service for exporting evaluation results to Markdown or PDF formats.
"""
import io
import re
from typing import Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import mm


class ExportService:
    @staticmethod
    def _strip_emojis(text: str) -> str:
        """Removes emojis and non-Latin-1 characters for PDF compatibility."""
        if not text:
            return ""
        # Remove emojis using regex (basic range)
        return re.sub(r'[^\x00-\x7f]', r'', text)

    @staticmethod
    def generate_markdown(data: Dict[str, Any]) -> str:
        """Generates a structured Markdown report."""
        md = f"# EBIA Evaluation Report: {data.get('original_idea')[:50]}...\n\n"
        md += f"## Feasibility Score: {data.get('feasibility_score')}/100\n"
        md += f"**Reasoning:** {data.get('feasibility_reasoning')}\n\n"
        
        md += "## Refined Concept\n"
        md += f"{data.get('refined_idea')}\n\n"
        
        md += "## Market Context\n"
        md += "### User Pain Points\n"
        for p in data.get("user_pain_points", []):
            md += f"- {p}\n"
        
        md += "\n### Market Trends\n"
        for t in data.get("market_trends", []):
            md += f"- {t}\n"
        
        md += "\n### Risk Factors\n"
        for r in data.get("risk_factors", []):
            md += f"- {r}\n"
            
        md += "\n## Competitor Landscape\n"
        for comp in data.get("competitor_overview", []):
            md += f"### {comp.get('competitor_name')}\n"
            md += f"**Strategic Impact:** {comp.get('strategic_impact')}\n"
            md += f"**Strengths:** {', '.join(comp.get('strengths', []))}\n"
            md += f"**Weaknesses:** {', '.join(comp.get('weaknesses', []))}\n\n"
            
        md += "## Recommended Improvement Steps\n"
        for i, step in enumerate(data.get("improvement_steps", []), 1):
            md += f"{i}. {step}\n"

        evidence = data.get("supporting_evidence", [])
        if evidence:
            md += "\n## Supporting Evidence (RAG Sources)\n"
            for ev in evidence:
                title = ev.get("source_title", "Untitled")
                conf = ev.get("confidence_score", 0)
                md += f"### {title} (Confidence: {round(conf * 100)}%)\n"
                md += f"{ev.get('content', 'N/A')}\n\n"
            
        if data.get("correction_path"):
            md += f"\n## Ethical Correction Path\n"
            md += f"{data.get('correction_path')}\n"
            
        return md

    @staticmethod
    def _draw_footer_branding(canvas, doc):
        """Draws the FoundersCore logo and name as a watermark in the footer."""
        canvas.saveState()
        
        # --- Draw Logo (Triple Layered Diamond) ---
        # Scale: 0.35 mm per unit (24x24 box)
        scale = 0.35 * mm
        base_x = 15 * mm
        base_y = 12 * mm
        
        def draw_diamond(points, opacity):
            canvas.setFillColor(colors.HexColor('#1e3a8a'), alpha=opacity)
            scaled_points = [(base_x + x * scale, base_y - y * scale) for x, y in points]
            p = canvas.beginPath()
            p.moveTo(scaled_points[0][0], scaled_points[0][1])
            for pt in scaled_points[1:]:
                p.lineTo(pt[0], pt[1])
            p.close()
            canvas.drawPath(p, fill=1, stroke=0)

        # Layer 1 (Top / Opaque)
        draw_diamond([(12, 4), (3, 8.5), (12, 13), (21, 8.5)], 1.0)
        # Layer 2 (Middle / 60%)
        draw_diamond([(3, 12.5), (12, 17), (21, 12.5), (12, 8)], 0.6)
        # Layer 3 (Bottom / 30%)
        draw_diamond([(3, 16.5), (12, 21), (21, 16.5), (12, 12)], 0.3)
        
        # --- Draw Text ---
        canvas.setFont("Helvetica-Bold", 10)
        canvas.setFillColor(colors.HexColor('#1e3a8a'))
        canvas.drawString(base_x + 10 * mm, base_y - 4 * mm, "FoundersCore")
        
        canvas.restoreState()

    @staticmethod
    def generate_pdf(data: Dict[str, Any]) -> bytes:
        """Generates a professional single-page 2-column strategy report."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=15 * mm,
            leftMargin=15 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm
        )

        styles = getSampleStyleSheet()
        
        # Define Custom Styles
        header_title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=2
        )
        
        meta_style = ParagraphStyle(
            'MetaText',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#3b82f6'),
            leading=12,
            fontName='Helvetica-Bold'
        )
        
        section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading3'],
            fontSize=8,
            textColor=colors.HexColor('#1e3a8a'),
            fontName='Helvetica-Bold',
            spaceBefore=8,
            spaceAfter=4,
            textTransform='uppercase'
        )
        
        bullet_style = ParagraphStyle(
            'BulletItem',
            parent=styles['Normal'],
            fontSize=8.5,
            textColor=colors.HexColor('#1f2937'),
            leading=11,
            leftIndent=10,
            firstLineIndent=0,
            spaceBefore=2
        )

        score = data.get('feasibility_score', 0)
        score_text = f"GOOD CHANCE OF SUCCESS" if score > 75 else "MODERATE CHANCE" if score > 50 else "CHALLENGING PATH"
        
        # --- 1. HEADER (Score Box + Meta) ---
        score_box_data = [[
            Paragraph(f"<font size='22' color='#1e3a8a'><b>{score} / 100</b></font><br/>"
                      f"<font size='8' color='#1e3a8a'>SUCCESS SCORE</font>", styles['Normal']),
            [
                Paragraph(f"<b>{score_text}</b>", header_title_style),
                Paragraph(f"Idea: {ExportService._strip_emojis(data.get('refined_idea', data.get('original_idea'))[:100])}", styles['Normal']),
                Paragraph(f"Market Match: {score+2}% | Risk: {'Low' if score > 75 else 'Moderate' if score > 50 else 'High'}", meta_style)
            ]
        ]]
        
        header_table = Table(score_box_data, colWidths=[40 * mm, 140 * mm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('LINEAFTER', (0, 0), (0, 0), 1, colors.HexColor('#e5e7eb')),
            ('LEFTPADDING', (1, 0), (1, 0), 10),
        ]))

        # --- 2. PREPARE SECTIONS ---
        
        # Left Column Items
        left_items = []
        
        # How to Start
        left_items.append(Paragraph("[ HOW TO GET STARTED ]", section_header_style))
        for step in data.get("improvement_steps", [])[:5]:
            left_items.append(Paragraph(f"• {ExportService._strip_emojis(step)}", bullet_style))
        
        # Market Trends
        left_items.append(Paragraph("[ WHAT'S HAPPENING IN THE MARKET ]", section_header_style))
        for trend in data.get("market_trends", [])[:4]:
            left_items.append(Paragraph(f"• {ExportService._strip_emojis(trend)}", bullet_style))
            
        # Similar Businesses
        left_items.append(Paragraph("[ SIMILAR BUSINESSES ]", section_header_style))
        for comp in data.get("competitor_overview", [])[:3]:
            name = comp.get('competitor_name', 'Unknown')
            impact = comp.get('competition_level', 'Medium')
            left_items.append(Paragraph(f"<b>{ExportService._strip_emojis(name)}</b> | Competition: {impact}", bullet_style))
            left_items.append(Paragraph(f"   Strength: {', '.join(comp.get('strengths', [])[:1])}", bullet_style))

        # Right Column Items
        right_items = []
        
        # Key Metrics
        right_items.append(Paragraph("[ KEY METRICS ]", section_header_style))
        right_items.append(Paragraph(f"• Potential: {score+5}%", bullet_style))
        right_items.append(Paragraph(f"• Audience Focus: High", bullet_style))
        right_items.append(Paragraph(f"• Speed to Launch: Medium", bullet_style))
        
        # Challenges
        right_items.append(Paragraph("[ POSSIBLE CHALLENGES ]", section_header_style))
        for risk in data.get("risk_factors", [])[:4]:
            right_items.append(Paragraph(f"• {ExportService._strip_emojis(risk)}", bullet_style))
            
        # Supporting Data
        evidence = data.get("supporting_evidence", [])
        valid_ev = [ev for ev in evidence if ev.get('confidence_score', 0) > 0.3]
        if valid_ev:
            right_items.append(Paragraph("[ SUPPORTING DATA ]", section_header_style))
            for ev in valid_ev[:2]:
                title = ev.get('source_title', 'Market Insight')
                conf = round(ev.get('confidence_score', 0) * 100)
                right_items.append(Paragraph(f"<b>{ExportService._strip_emojis(title)}</b> (Reliability: {conf}%)", bullet_style))
                right_items.append(Paragraph(f"-> {ExportService._strip_emojis(ev.get('content', ''))[:60]}...", bullet_style))

        # --- 3. CONSTRUCT 2-COLUMN LAYOUT TABLE ---
        body_data = [[left_items, right_items]]
        body_table = Table(body_data, colWidths=[110 * mm, 70 * mm])
        body_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (0, 0), 0),
            ('RIGHTPADDING', (0, 0), (0, 0), 5 * mm),
            ('LEFTPADDING', (1, 0), (1, 0), 5 * mm),
        ]))

        # --- 4. BUILD ---
        elements = [
            header_table,
            Spacer(1, 10 * mm),
            body_table
        ]
        
        doc.build(elements, onFirstPage=ExportService._draw_footer_branding)
        buffer.seek(0)
        return buffer.getvalue()
