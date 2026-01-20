from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from ddgs import DDGS
from ..skills.base import BaseSkill

class ResearcherAgent:
    def __init__(self, skills: list[BaseSkill] = None):
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro-latest", temperature=0)
        self.skills = skills or []

    def research(self, sub_topic: str, instructions: str = None):
        """
        Conducts research on a sub-topic using search tools.
        Returns a dict: {"content": str, "sources": list}
        """
        sources = []
        search_results_text = ""
        
        # 1. Search for information using provided skills
        if not self.skills:
             search_results_text += "No search skills configured.\n"

        for skill in self.skills:
            try:
                # print(f"Executing skill: {skill.name}") 
                result = skill.execute(sub_topic)
                
                if "error" in result:
                    search_results_text += f"\nError in {skill.name}: {result['error']}\n"
                    continue
                
                content = result.get("content", "")
                skill_sources = result.get("sources", [])
                
                if content:
                    search_results_text += content
                if skill_sources:
                    sources.extend(skill_sources)
                    
            except Exception as e:
                search_results_text += f"\nError executing skill {skill.name}: {e}\n"

        # 2. Summarize findings for this sub-topic
        system_instructions = "You are a researcher. Analyze the following search results and provide a concise summary relevant to the research sub-topic. If the search results are empty or irrelevant, state that."
        
        if instructions:
            system_instructions += f"\n\nSPECIFIC INSTRUCTIONS: {instructions}\nEnsure your analysis focuses on these instructions."

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_instructions),
            ("user", "Sub-topic: {sub_topic}\n\nSearch Results: {search_results}")
        ])
        
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({"sub_topic": sub_topic, "search_results": search_results_text})
            return {
                "content": response.content,
                "sources": sources
            }
        except Exception as e:
            return {
                "content": f"Error in research analysis: {e}",
                "sources": []
            }

if __name__ == "__main__":
    # Test
    from ..skills.search import DuckDuckGoSearchSkill
    researcher = ResearcherAgent(skills=[DuckDuckGoSearchSkill()])
    print(researcher.research("AI applications in radiology"))
