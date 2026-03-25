"""
Enterprise-grade service for exporting evaluation results to Markdown or PDF formats.
"""
import io
import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

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
    def generate_pdf(data: Dict[str, Any]) -> bytes:
        """Generates a professional single-page strategy report using fpdf2.
        (WeasyPrint was removed to avoid GTK+ system dependency issues on Windows)
        """
        try:
            from fpdf import FPDF
            
            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)
            
            # Header
            pdf.set_font("helvetica", "B", 18)
            pdf.cell(pdf.epw, 15, "EBIA Business Intelligence Report", align="C")
            pdf.ln(20)
            
            # Score
            score = data.get('feasibility_score', 0)
            pdf.set_font("helvetica", "B", 14)
            pdf.set_text_color(30, 58, 138) # Dark blue
            pdf.cell(pdf.epw, 10, f"Feasibility Score: {score}/100")
            pdf.ln(12)
            pdf.set_text_color(0, 0, 0) # Black
            
            # Content
            pdf.set_font("helvetica", "", 11)
            idea_text = data.get('refined_idea', data.get('original_idea', 'No idea provided'))
            pdf.multi_cell(pdf.epw, 8, f"Idea Concept: {ExportService._strip_emojis(str(idea_text))}")
            pdf.ln(10)
            
            # Sections
            sections = [
                ("How to Get Started", "improvement_steps"),
                ("Market Trends", "market_trends"),
                ("Risk Factors", "risk_factors"),
                ("Key Competitors", "competitor_overview")
            ]
            
            for section, key in sections:
                pdf.set_font("helvetica", "B", 13)
                pdf.set_text_color(30, 58, 138)
                pdf.cell(pdf.epw, 10, f"{section}:")
                pdf.ln(10)
                pdf.set_font("helvetica", "", 10)
                pdf.set_text_color(0, 0, 0)
                
                items = data.get(key, [])
                if not items:
                    pdf.cell(pdf.epw, 8, "- No details available")
                    pdf.ln(8)
                else:
                    for item in items[:4]:
                        if isinstance(item, dict):
                            # Comp name if it's a competitor dict
                            text = item.get("competitor_name", item.get("name", "Unknown"))
                            impact = item.get("strategic_impact", item.get("impact", ""))
                            pdf.multi_cell(pdf.epw, 7, f"- {text} ({impact})")
                        else:
                            pdf.multi_cell(pdf.epw, 7, f"- {ExportService._strip_emojis(str(item))}")
                        pdf.ln(1)
                pdf.ln(5)

            return bytes(pdf.output())

        except Exception as e:
            logger.error(f"Failed to generate PDF with fpdf2: {e}")
            raise
