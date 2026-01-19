import argparse
import os
import sys
import warnings

# Suppress Pydantic V1 user warning on newer Python versions
warnings.filterwarnings("ignore", category=UserWarning, module="langchain_core._api.deprecation")

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.orchestrator import Orchestrator
from dotenv import load_dotenv

# Load environment variables (API Keys)
load_dotenv()

def main():
    parser = argparse.ArgumentParser(description="Multi-Agent AI Researcher")
    parser.add_argument("topic", type=str, nargs="?", help="The research topic")
    parser.add_argument("--cli", action="store_true", help="Launch in CLI mode (default if topic provided)")
    parser.add_argument("--web", action="store_true", help="Launch the Web Interface (Default behavior now)")
    
    args = parser.parse_args()

    # Determine mode
    # If a topic is provided, assume CLI mode unless --web is forced (though that would be ambiguous, we can prioritize topic)
    # If --cli is set, valid CLI mode.
    # Otherwise, default to Web Interface.
    
    should_run_cli = args.cli or args.topic
    
    if not should_run_cli or args.web:
        print("🌐 Starting Web Interface...")
        import uvicorn
        # We need to import the app string dynamically or assumes src/web/server.py exists
        uvicorn.run("src.web.server:app", host="127.0.0.1", port=8000, reload=False)
        return
    
    # CLI Mode
    topic = args.topic
    if not topic:
        print("🤖 Welcome to the Multi-Agent Researcher!")
        print("Tip: Run 'python main.py' to start the Web UI.")
        topic = input("Please enter your research topic: ").strip()
        if not topic:
            print("❌ No topic provided. Exiting.")
            return

    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ Error: GOOGLE_API_KEY not found in environment variables.")
        return

    orchestrator = Orchestrator()
    report = orchestrator.run(topic)
    
    if report:
        print("\n\n" + "="*50)
        print("📄 FINAL REPORT")
        print("="*50 + "\n")
        print(report)
        
        # Save to file
        filename = f"{topic.replace(' ', '_').lower()}_report.md"
        with open(filename, "w") as f:
            f.write(report)
        print(f"\n💾 Report saved to {filename}")

if __name__ == "__main__":
    main()
