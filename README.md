# Personal Finance Tracker

A modern personal finance tracker for managing income, expenses, budgets, and financial goals in one place.

## Overview

This project helps users monitor their financial health by organizing transactions, visualizing spending patterns, and staying on top of monthly budgets. It is designed to be simple, intuitive, and useful for everyday money management.

## Features

- Track income and expenses
- Categorize transactions for better insights
- View monthly and weekly spending summaries
- Set budgets and monitor progress
- Manage savings goals and financial targets
- Create dashboards with charts and trends
- Secure authentication and personal account management
- AI-based analysis and suggestions for saving money
- OCR capability to scan receipts

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Charting libraries for financial visualizations

### Backend

- Python
- FastAPI
- PostgreSQL
- OCR in Python for documents and receipts
- Import CSV, PDF, bank statements, and PhonePe statements
- Multi-agent framework using CrewAI and LangGraph
- REST APIs for transaction and budget management

## Project Structure

```text
personal-finance-tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── tsconfig.node.json
└── README.md
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Future Enhancements

- Recurring transaction support
- Export reports to CSV/PDF
- Multi-currency support
- Mobile-friendly UI improvements
- Advanced analytics and forecasting
