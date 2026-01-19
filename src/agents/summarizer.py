from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

class SummarizerAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro-latest", temperature=0)

    def summarize(self, topic: str, research_findings: dict, sources: list = [], custom_prompt: str = None):
        """
        Aggregates research findings into a final report.
        research_findings: dict where key is sub-topic and value is the finding.
        sources: list of dicts with title and href.
        """
        
        # Format findings for the prompt
        findings_text = ""
        for sub, finding in research_findings.items():
            findings_text += f"### {sub}\n{finding}\n\n"

        system_instructions = "You are a lead research analyst. Your task is to correct multiple research findings into a single, cohesive, professional markdown report."
        
        if custom_prompt:
            system_instructions += f"\n\nIMPORTANT USER INSTRUCTIONS: {custom_prompt}\nMake sure the final report strictly follows these requirements (e.g., tone, focus, length, format)."

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_instructions),
            ("user", "Research Topic: {topic}\n\nFindings:\n{findings_text}")
        ])
        
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({"topic": topic, "findings_text": findings_text})
            report_content = response.content
            
            # Append References
            if sources:
                report_content += "\n\n## References\n"
                unique_links = set()
                for source in sources:
                    title = source.get('title', 'Unknown Title')
                    href = source.get('href', '#')
                    # Deduplicate by URL
                    if href not in unique_links:
                        report_content += f"- [{title}]({href})\n"
                        unique_links.add(href)
            
            return report_content
        except Exception as e:
            return f"Error in summarization: {e}"

if __name__ == "__main__":
    # Test
    summarizer = SummarizerAgent()
    test_findings = {
        "Sub-topic A": "Finding A details...",
        "Sub-topic B": "Finding B details..."
    }
    print(summarizer.summarize("Test Topic", test_findings))
