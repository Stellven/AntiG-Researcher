import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

class PlannerAgent:
    def __init__(self):
        # Using gemini-pro as it is widely available
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro-latest", temperature=0)
        self.parser = JsonOutputParser()

    def plan(self, topic: str, custom_prompt: str = None):
        """
        Decomposes the research topic into sub-topics.
        """
        system_instructions = "You are a research planner. Your task is to break down a user-provided research topic into 3-5 distinct sub-topics for detailed analysis. Return the result as a JSON object with a key 'sub_topics' containing a list of strings."
        
        if custom_prompt:
            system_instructions += f"\n\nIMPORTANT USER INSTRUCTIONS: {custom_prompt}\nAdjust the sub-topics to strictly adhere to these instructions."

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_instructions),
            ("user", "Research Topic: {topic}")
        ])
        
        chain = prompt | self.llm | self.parser
        
        try:
            result = chain.invoke({"topic": topic})
            return result.get("sub_topics", [])
        except Exception as e:
            print(f"Error in planning: {e}")
            return []

if __name__ == "__main__":
    # Test
    planner = PlannerAgent()
    print(planner.plan("The future of AI in Healthcare"))
