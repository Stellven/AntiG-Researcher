import concurrent.futures
from src.agents.planner import PlannerAgent
from src.agents.researcher import ResearcherAgent
from src.agents.summarizer import SummarizerAgent

class Orchestrator:
    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()
        self.summarizer = SummarizerAgent()

    def plan_research(self, topic: str, custom_prompt: str = None):
        """Phase 1: Generate a research plan."""
        print(f"🚀 Starting research planning on: {topic}")
        if custom_prompt:
            print(f"ℹ️ Custom Instructions: {custom_prompt}")
            
        print("💡 Planning...")
        sub_topics = self.planner.plan(topic, custom_prompt)
        if not sub_topics:
            print("❌ Failed to generate a plan.")
            return []
        print(f"📝 Sub-topics: {sub_topics}")
        return sub_topics

    def execute_research(self, sub_topics: list):
        """Phase 2: Conduct research on confirmed sub-topics."""
        print("🔍 Researching sub-topics...")
        research_findings = {}
        all_sources = []
        
    def execute_research(self, sub_topics: list):
        """Phase 2: Conduct research on confirmed sub-topics."""
        print("🔍 Researching sub-topics...")
        research_findings = {}
        all_sources = []
        
        # Helper to process input items (which could be strings or objects)
        task_items = []
        for item in sub_topics:
            if isinstance(item, str):
                task_items.append({"topic": item, "instructions": None})
            else:
                # Assume object with .topic and .instructions attributes (Pydantic model)
                task_items.append({"topic": item.topic, "instructions": getattr(item, "instructions", None)})

        # Using ThreadPoolExecutor for concurrent research since it's IO-bound (network calls)
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            # Map future to the topic string for reporting
            future_to_topic = {
                executor.submit(self.researcher.research, item["topic"], item["instructions"]): item["topic"] 
                for item in task_items
            }
            
            for future in concurrent.futures.as_completed(future_to_topic):
                sub = future_to_topic[future]
                try:
                    result = future.result()
                    # Result is now a dict {"content": ..., "sources": ...}
                    if isinstance(result, dict):
                        content = result.get("content", "")
                        sources = result.get("sources", [])
                        research_findings[sub] = content
                        all_sources.extend(sources)
                    else:
                        # Fallback for legacy or error string
                        research_findings[sub] = str(result)
                        
                    print(f"✅ Finished research on: {sub}")
                except Exception as exc:
                    print(f"❌ Error researching {sub}: {exc}")
                    research_findings[sub] = f"Error: {exc}"
        return research_findings, all_sources

    def generate_summary(self, topic: str, research_findings: dict, sources: list, custom_prompt: str = None):
        """Phase 3: Generate final report."""
        print("✍️ Summarizing findings...")
        final_report = self.summarizer.summarize(topic, research_findings, sources, custom_prompt)
        return final_report

    def run(self, topic: str, custom_prompt: str = None):
        """Legacy run method for CLI compatibility."""
        # 1. Plan
        sub_topics = self.plan_research(topic, custom_prompt)
        if not sub_topics:
            return None

        # 2. Research
        research_findings, all_sources = self.execute_research(sub_topics)

        # 3. Summarize
        return self.generate_summary(topic, research_findings, all_sources, custom_prompt)
