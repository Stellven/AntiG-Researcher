from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from ddgs import DDGS

class ResearcherAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro-latest", temperature=0)

    def research(self, sub_topic: str, instructions: str = None):
        """
        Conducts research on a sub-topic using search tools.
        Returns a dict: {"content": str, "sources": list}
        """
        sources = []
        search_results_text = ""
        
        # 1. Search for information using multiple sources
        
        # --- Commercial Search Engines (Priority) ---
        import os
        combined_search_results = []
        
        # Priority 1: Tavily
        if os.getenv("TAVILY_API_KEY"):
            try:
                from tavily import TavilyClient
                tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
                response = tavily.search(query=sub_topic, search_depth="advanced", max_results=5)
                for r in response.get('results', []):
                    title = r.get('title', 'No Title')
                    href = r.get('url', '#')
                    body = r.get('content', '')
                    sources.append({'title': title, 'href': href, 'source_type': 'Tavily'})
                    search_results_text += f"[Tavily] Source: {title}\nURL: {href}\nContent: {body}\n\n"
                    combined_search_results.append(href)
            except Exception as e:
                search_results_text += f"\nError during Tavily search: {e}\n"

        # Priority 2: Serper (if Tavily not used)
        elif os.getenv("SERPER_API_KEY"):
            try:
                from langchain_community.utilities import GoogleSerperAPIWrapper
                search = GoogleSerperAPIWrapper()
                results = search.results(sub_topic)
                for r in results.get('organic', [])[:5]:
                    title = r.get('title', 'No Title')
                    href = r.get('link', '#')
                    body = r.get('snippet', '')
                    sources.append({'title': title, 'href': href, 'source_type': 'Serper'})
                    search_results_text += f"[Serper] Source: {title}\nURL: {href}\nContent: {body}\n\n"
                    combined_search_results.append(href)
            except Exception as e:
                search_results_text += f"\nError during Serper search: {e}\n"
        
        # Priority 3: DuckDuckGo (Fallback)
        else:
             try:
                with DDGS() as ddgs:
                    # Get top 10 results
                    results = [r for r in ddgs.text(sub_topic, max_results=10)]
                    
                for result in results:
                    title = result.get('title', 'No Title')
                    href = result.get('href', '#')
                    body = result.get('body', '')
                    sources.append({'title': title, 'href': href, 'source_type': 'DuckDuckGo'})
                    search_results_text += f"[DuckDuckGo] Source: {title}\nURL: {href}\nContent: {body}\n\n"
             except Exception as e:
                search_results_text += f"\nError during DDG search: {e}\n"

        # --- Wikipedia ---
        try:
            import wikipedia
            # wikipedia.set_lang("en") # Default is en, but good to know
            wiki_results = wikipedia.search(sub_topic, results=2)
            for page_title in wiki_results:
                try:
                    page = wikipedia.page(page_title, auto_suggest=False)
                    title = page.title
                    href = page.url
                    summary = page.summary[:1000] # Limit summary length
                    sources.append({'title': title, 'href': href, 'source_type': 'Wikipedia'})
                    search_results_text += f"[Wikipedia] Source: {title}\nURL: {href}\nContent: {summary}\n\n"
                except Exception as page_error:
                   # Handle DisambiguationError or PageError
                   continue
        except Exception as e:
             search_results_text += f"\nError during Wikipedia search: {e}\n"

        # --- Arxiv ---
        try:
            import arxiv
            client = arxiv.Client()
            search = arxiv.Search(
                query = sub_topic,
                max_results = 3,
                sort_by = arxiv.SortCriterion.Relevance
            )
            for r in client.results(search):
                title = r.title
                href = r.entry_id
                summary = r.summary[:1000]
                sources.append({'title': title, 'href': href, 'source_type': 'Arxiv'})
                search_results_text += f"[Arxiv] Title: {title}\nURL: {href}\nAbstract: {summary}\n\n"
        except Exception as e:
            search_results_text += f"\nError during Arxiv search: {e}\n"

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
    researcher = ResearcherAgent()
    print(researcher.research("AI applications in radiology"))
