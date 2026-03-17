"""
Service for exporting evaluation results to Markdown or PDF.
"""
import io
from typing import Dict, Any
from fpdf import FPDF

class ExportService:
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
            
        md += "\n## Competitor Landscape\n"
        for comp in data.get("competitor_overview", []):
            md += f"### {comp.get('competitor_name')}\n"
            md += f"**Strategic Impact:** {comp.get('strategic_impact')}\n"
            md += f"**Strengths:** {', '.join(comp.get('strengths', []))}\n"
            md += f"**Weaknesses:** {', '.join(comp.get('weaknesses', []))}\n\n"
            
        md += "## Recommended Improvement Steps\n"
        for i, step in enumerate(data.get("improvement_steps", []), 1):
            md += f"{i}. {step}\n"
            
        if data.get("correction_path"):
            md += f"\n## Ethical Correction Path\n"
            md += f"{data.get('correction_path')}\n"
            
        return md

    @staticmethod
    def generate_pdf(data: Dict[str, Any]) -> bytes:
        """Generates a professional PDF report using fpdf2."""
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 24)
        pdf.cell(0, 20, "EBIA Strategy Report", ln=True, align="C")
        
        pdf.set_font("Arial", "B", 16)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 10, f"Score: {data.get('feasibility_score')}/100", ln=True)
        
        pdf.set_font("Arial", "", 12)
        pdf.set_text_color(0, 0, 0)
        pdf.multi_cell(0, 8, f"Reasoning: {data.get('feasibility_reasoning')}")
        pdf.ln(5)
        
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Refined Concept", ln=True)
        pdf.set_font("Arial", "", 11)
        pdf.multi_cell(0, 7, data.get("refined_idea"))
        pdf.ln(5)
        
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Go-to-Market Strategy", ln=True)
        pdf.set_font("Arial", "", 11)
        for i, step in enumerate(data.get("improvement_steps", []), 1):
            pdf.multi_cell(0, 7, f"{i}. {step}")
            
        return pdf.output(dest='S')
