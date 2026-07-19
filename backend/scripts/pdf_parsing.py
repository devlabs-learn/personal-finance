from app.parser.pdf_parser import parse_transactions
from app.agent.extract_agent import extract_transactions

content = parse_transactions("data/statements.pdf")
transactions = extract_transactions(content)

print(transactions)