from crewai import Agent, Crew, Task, LLM

from app.agent.prompts import STATEMENT_EXTRACT_PROMPT

# For LLM specific config
# llm = LLM(
#     model  =  '',
#     api_base= '',
#     api_key= ''
# )

def extract_transactions(content: str) -> str:
    """Run content through a CrewAI agent and return the agent's raw text output."""
    agent = Agent(
        role="Finance Tracker",
        goal="Extract financial transactions from receipts, documents and bank statements",
        backstory="You interpret merchant names, amounts, dates, and categorize expenses or income.",
        allow_delegation=False,
        # llm = llm
    )

    task = Task(
        description=STATEMENT_EXTRACT_PROMPT,
        expected_output="A JSON array of objects with keys: description, merchant, currency, amount, transaction_type, category, date",
        agent=agent,
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
    )

    result = crew.kickoff(inputs={"transactions": content})

    return str(result).strip()
