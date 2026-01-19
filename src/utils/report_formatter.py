import os
import markdown
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from io import BytesIO

class ReportFormatter:
    def __init__(self):
        # Setup Jinja2 environment
        template_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'templates')
        self.env = Environment(loader=FileSystemLoader(template_dir))

    def generate_html(self, markdown_content: str, title: str = "Research Report") -> str:
        """
        Converts markdown content to a styled HTML report using Jinja2 template.
        """
        # Convert Markdown to HTML
        html_content = markdown.markdown(markdown_content, extensions=['tables', 'fenced_code'])
        
        # Render template
        template = self.env.get_template('report.html')
        rendered_html = template.render(
            title=title,
            content=html_content,
            date=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        return rendered_html

    def generate_pdf(self, markdown_content: str, title: str = "Research Report") -> BytesIO:
        """
        Generates a PDF buffer from markdown content.
        """
        html_content = self.generate_html(markdown_content, title)
        
        buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=buffer)
        
        if pisa_status.err:
            raise Exception("PDF generation failed")
            
        buffer.seek(0)
        return buffer
