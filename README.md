# Multi_Agent_System_With_CrewAi

🚀 Multi Agent System with CrewAI
A modular multi-agent architecture built using CrewAI to automate stock research, analysis, and trading decision workflows through coordinated AI agents.

📌 Overview
This project demonstrates how multiple AI agents can collaborate to simulate a real-world financial workflow:

🔍 Research market data

📊 Analyze insights

📈 Generate trading decisions

Each responsibility is handled by a specialized agent, orchestrated using CrewAI.

🧠 Architecture
The system is divided into agents, tasks, and tools:

👨‍💻 Agents
Research Agent → Collects stock-related data

Analyst Agent → Interprets and evaluates data

Trader Agent → Makes trading decisions based on analysis

📋 Tasks
analyse_task.py → Defines analysis workflow

trade_task.py → Defines trading execution logic

🛠 Tools
stock_research_tool.py → Fetches and processes stock data

🎯 Orchestration
crew.py → Connects agents + tasks into a workflow

main.py → Entry point to run the system

🔄 Workflow
Research agent gathers stock data

Analyst agent processes and evaluates insights

Trader agent makes decision (buy/sell/hold)

💡 Key Features
✅ Modular multi-agent design

✅ Clear separation of responsibilities

✅ Extendable architecture (add more agents easily)

✅ Real-world workflow simulation

✅ Clean orchestration using CrewAI

🧪 Use Cases
Automated financial research

Decision-support systems

AI workflow orchestration demos

Learning multi-agent systems
