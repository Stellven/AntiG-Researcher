# AntiG-Researcher

AntiG-Researcher 是一个多智能体 AI 研究员系统，旨在自动化深度研究任务。它利用 Google Gemini 和 LangChain，通过协作的智能体网络将广泛的研究主题分解为子主题，进行深入的信息搜集，并最终合成一份全面的研究报告。

系统提供现代化的 Web 界面和简单的命令行界面 (CLI)，支持自定义研究指令以及导出 PDF 和 Word 格式的报告。

## ✨ 主要功能

- **多智能体架构**：
  - **Planner Agent (规划者)**：分析研究主题，将其拆解为逻辑清晰的子主题。
  - **Researcher Agent (研究员)**：针对每个子主题进行独立研究，利用多种搜索源获取信息。
  - **Summarizer Agent (总结者)**：整合所有研究发现，生成连贯、结构化的最终报告。
- **多源搜索**：集成 DuckDuckGo, Wikipedia, Arxiv, Tavily 等多种信息源，确保信息的广泛性和准确性。
- **双重交互界面**：
  - **Web UI**：基于 React + Vite + TailwindCSS 构建的现代化界面，支持实时进度查看、报告预览和导出。
  - **CLI**：简洁的命令行工具，适合快速启动研究任务。
- **报告导出**：支持将生成的 Markdown 报告导出为 PDF 和 Word (.docx) 格式。
- **高度可定制**：支持用户提供自定义 Prompt 和针对特定子主题的详细指令。

## 🛠️ 技术栈

- **后端**: Python, FastAPI, LangChain, Google Gemini (via `langchain-google-genai`)
- **前端**: React, Vite, TailwindCSS
- **搜索/工具**: DuckDuckGo Search, Wikipedia API, Arxiv API, Tavily API
- **文档处理**: `xhtml2pdf` (PDF导出), `python-docx` (Word导出)

## 📋 前置要求

- Python 3.8+
- Node.js & npm (仅用于前端开发)
- [Google AI Studio](https://aistudio.google.com/) API Key (用于访问 Gemini 模型)

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/Stellven/AntiG-Researcher.git
cd AntiG-Researcher
```

### 2. 环境配置

创建虚拟环境并安装 Python 依赖：

```bash
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 3. 设置环境变量

复制 `.env.example` 文件为 `.env`，并填入您的 API Key：

```bash
cp .env.example .env
```

在 `.env` 文件中编辑：

```env
GOOGLE_API_KEY=your_google_api_key_here
# 可选：Tavily API Key (如果使用 Tavily 搜索)
# TAVILY_API_KEY=your_tavily_api_key_here
```

### 4. 运行应用

**启动 Web 界面 (推荐)**：

```bash
python main.py
```
默认情况下，服务将在 `http://127.0.0.1:8000` 启动。前端页面已构建并由后端提供服务。

**启动 CLI 模式**：

```bash
python main.py --cli
```
或者直接指定主题：
```bash
python main.py "人工智能在医疗领域的应用"
```

## 💻 前端开发

如果您需要修改前端代码：

1. 进入 frontend 目录：
   ```bash
   cd frontend
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 构建生产版本 (构建产物将输出到 `frontend/dist`，供 Python 后端使用)：
   ```bash
   npm run build
   ```

## 📂 项目结构

```
AntiG-Researcher/
├── main.py                 # 项目入口 (CLI & Web server launcher)
├── requirements.txt        # Python 依赖
├── .env                    # 环境变量配置
├── src/
│   ├── orchestrator.py     # 协调各智能体的工作流
│   ├── agents/             # 智能体定义
│   │   ├── planner.py      # 规划智能体
│   │   ├── researcher.py   # 研究智能体
│   │   └── summarizer.py   # 总结智能体
│   └── web/
│       └── server.py       # FastAPI 后端服务
└── frontend/               # React 前端项目
    ├── src/
    ├── package.json
    └── vite.config.ts
```

## 📄 许可证

本项目采用 MIT 许可证。
