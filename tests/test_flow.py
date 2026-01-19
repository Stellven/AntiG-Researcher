import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock external dependencies to allow implementation-agnostic testing
sys.modules['langchain_google_genai'] = MagicMock()
sys.modules['langchain_community'] = MagicMock()
sys.modules['langchain_community.tools'] = MagicMock()
sys.modules['langchain_core'] = MagicMock()
sys.modules['langchain_core.prompts'] = MagicMock()
sys.modules['langchain_core.output_parsers'] = MagicMock()
sys.modules['langchain_core.runnables'] = MagicMock()
sys.modules['ddgs'] = MagicMock()

from src.orchestrator import Orchestrator

class TestOrchestrator(unittest.TestCase):
    @patch('src.agents.planner.ChatGoogleGenerativeAI')
    @patch('src.agents.researcher.ChatGoogleGenerativeAI')
    @patch('src.agents.summarizer.ChatGoogleGenerativeAI')
    def test_orchestrator_flow(self, mock_summarizer_llm, mock_researcher_llm, mock_planner_llm):
        # 1. Mock Planner
        mock_planner_instance = mock_planner_llm.return_value
        # Mocking the chain invoke result for planner (it returns a dict)
        # The planner uses JsonOutputParser, so the chain output should be the dict directly if we mock the chain?
        # Actually in the code: chain = prompt | self.llm | self.parser
        # We are mocking ChatOpenAI, so we need to ensure the standard output is compatible or mock the whole chain.
        # It's easier to mock the `plan` method of the agent directly, but let's try to mock the LLM response first if possible,
        # or better yet, mock the agent methods to test just the orchestrator logic.
        pass

    @patch('src.orchestrator.PlannerAgent')
    @patch('src.orchestrator.ResearcherAgent')
    @patch('src.orchestrator.SummarizerAgent')
    def test_orchestrator_logic(self, MockSummarizer, MockResearcher, MockPlanner):
        # Setup Mocks
        planner = MockPlanner.return_value
        researcher = MockResearcher.return_value
        summarizer = MockSummarizer.return_value

        planner.plan.return_value = ["Subtopic 1", "Subtopic 2"]
        researcher.research.side_effect = [
            {"content": "Result 1", "sources": [{"title": "Source 1", "href": "http://source1.com"}]},
            {"content": "Result 2", "sources": [{"title": "Source 2", "href": "http://source2.com"}]}
        ]
        summarizer.summarize.return_value = "Final Report based on Result 1 and Result 2\n\n## References\n- [Source 1](http://source1.com)\n- [Source 2](http://source2.com)"

        # Run
        orchestrator = Orchestrator()
        report = orchestrator.run("Test Topic")

        # Verify
        planner.plan.assert_called_once_with("Test Topic")
        self.assertEqual(researcher.research.call_count, 2)
        summarizer.summarize.assert_called_once()
        self.assertEqual(report, "Final Report based on Result 1 and Result 2\n\n## References\n- [Source 1](http://source1.com)\n- [Source 2](http://source2.com)")
        print("\n✅ Orchestrator Flow Verification Passed!")

if __name__ == '__main__':
    unittest.main()
