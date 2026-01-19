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
        print("🤖 欢迎使用多智能体研究员系统！")
        print("提示：运行 'python main.py' 可启动 Web 界面。")
        topic = input("请输入您的研究主题：").strip()
        if not topic:
            print("❌ 未提供主题。正在退出。")
            return

    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ 错误：未找到 GOOGLE_API_KEY 环境变量。")
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
