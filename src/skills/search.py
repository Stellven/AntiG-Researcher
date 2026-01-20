import os
import time
from typing import Any, Dict, List
from .base import BaseSkill
from ddgs import DDGS

class TavilySearchSkill(BaseSkill):
    name = "Tavily Search"
    description = "Searches the web using Tavily API."

    def execute(self, query: str, **kwargs) -> Dict[str, Any]:
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            return {"error": "Tavily API key not found."}
        
        try:
            from tavily import TavilyClient
            tavily = TavilyClient(api_key=api_key)
            response = tavily.search(query=query, search_depth="advanced", max_results=5)
            
            formatted_results = []
            sources = []
            results_text = ""
            
            for r in response.get('results', []):
                title = r.get('title', 'No Title')
                href = r.get('url', '#')
                body = r.get('content', '')
                sources.append({'title': title, 'href': href, 'source_type': 'Tavily'})
                results_text += f"[Tavily] Source: {title}\nURL: {href}\nContent: {body}\n\n"
            
            return {
                "content": results_text,
                "sources": sources
            }
        except Exception as e:
             return {"error": f"Error during Tavily search: {e}"}

class SerperSearchSkill(BaseSkill):
    name = "Serper Search"
    description = "Searches the web using Serper API."

    def execute(self, query: str, **kwargs) -> Dict[str, Any]:
        api_key = os.getenv("SERPER_API_KEY")
        if not api_key:
             return {"error": "Serper API key not found."}
        
        try:
            from langchain_community.utilities import GoogleSerperAPIWrapper
            search = GoogleSerperAPIWrapper()
            results = search.results(query)
            
            sources = []
            results_text = ""
            
            for r in results.get('organic', [])[:5]:
                title = r.get('title', 'No Title')
                href = r.get('link', '#')
                body = r.get('snippet', '')
                sources.append({'title': title, 'href': href, 'source_type': 'Serper'})
                results_text += f"[Serper] Source: {title}\nURL: {href}\nContent: {body}\n\n"
            
            return {
                "content": results_text,
                "sources": sources
            }
        except Exception as e:
            return {"error": f"Error during Serper search: {e}"}

class DuckDuckGoSearchSkill(BaseSkill):
    name = "DuckDuckGo Search"
    description = "Searches the web using DuckDuckGo."

    def execute(self, query: str, **kwargs) -> Dict[str, Any]:
        try:
            sources = []
            results_text = ""
            with DDGS() as ddgs:
                results = [r for r in ddgs.text(query, max_results=10)]
                
            for result in results:
                title = result.get('title', 'No Title')
                href = result.get('href', '#')
                body = result.get('body', '')
                sources.append({'title': title, 'href': href, 'source_type': 'DuckDuckGo'})
                results_text += f"[DuckDuckGo] Source: {title}\nURL: {href}\nContent: {body}\n\n"
            
            return {
                "content": results_text,
                "sources": sources
            }
        except Exception as e:
            return {"error": f"Error during DDG search: {e}"}

class WikipediaSearchSkill(BaseSkill):
    name = "Wikipedia Search"
    description = "Searches Wikipedia."

    def execute(self, query: str, **kwargs) -> Dict[str, Any]:
        try:
            import wikipedia
            wiki_results = wikipedia.search(query, results=2)
            
            sources = []
            results_text = ""
            
            for page_title in wiki_results:
                try:
                    page = wikipedia.page(page_title, auto_suggest=False)
                    title = page.title
                    href = page.url
                    summary = page.summary[:1000]
                    sources.append({'title': title, 'href': href, 'source_type': 'Wikipedia'})
                    results_text += f"[Wikipedia] Source: {title}\nURL: {href}\nContent: {summary}\n\n"
                except Exception:
                    continue
            
            return {
                "content": results_text,
                "sources": sources
            }
        except Exception as e:
             return {"error": f"Error during Wikipedia search: {e}"}

class ArxivSearchSkill(BaseSkill):
    name = "Arxiv Search"
    description = "Searches Arxiv for papers."

    def execute(self, query: str, **kwargs) -> Dict[str, Any]:
        try:
            import arxiv
            client = arxiv.Client()
            search = arxiv.Search(
                query = query,
                max_results = 3,
                sort_by = arxiv.SortCriterion.Relevance
            )
            
            sources = []
            results_text = ""
            
            for r in client.results(search):
                title = r.title
                href = r.entry_id
                summary = r.summary[:1000]
                sources.append({'title': title, 'href': href, 'source_type': 'Arxiv'})
                results_text += f"[Arxiv] Title: {title}\nURL: {href}\nAbstract: {summary}\n\n"
            
            return {
                "content": results_text,
                "sources": sources
            }
        except Exception as e:
             return {"error": f"Error during Arxiv search: {e}"}
