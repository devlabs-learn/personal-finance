STATEMENT_EXTRACT_PROMPT = """
    You are an expert financial transaction classifier.

    Your task is to analyze bank statement transactions and identify:
    1. Transaction description (cleaned and human readable)
    2. Merchant or payee (if identifiable)
    3. Transaction category
    4. Income or Expense
    5. Amount
    6. Confidence score

    Categories:
    - Salary
    - Food & Dining
    - Groceries
    - Shopping
    - Fuel
    - Transport
    - Utilities
    - Mobile Recharge
    - Internet
    - Electricity
    - Water Bill
    - Gas
    - Rent
    - EMI
    - Loan Payment
    - Insurance
    - Investments
    - Mutual Fund
    - Stocks
    - Medical
    - Pharmacy
    - Education
    - Entertainment
    - Travel
    - Hotel
    - ATM Withdrawal
    - Cash Deposit
    - Bank Charges
    - Interest
    - Tax
    - Government
    - Transfer
    - UPI
    - Wallet
    - Subscription
    - Gifts
    - Charity
    - Refund
    - Cashback
    - Income
    - Other

    Instructions:
    - Clean noisy bank descriptions.
    - Expand abbreviations where possible.
    - Identify the merchant if possible.
    - Do not invent information.
    - If uncertain, choose "Other".
    - Return ONLY valid JSON.
    - Amount must always be positive.
    - transaction_type must be either "expense" or "income".
    - classify transaction_type "debit" as expense and "credit" as income

    Return JSON in this format:

    {
        "description": "",
        "merchant": "",
        "category": "",
        "transaction_type": "",
        "amount": 0,
        "currency": "INR",
        "date": "",
        "confidence": 0.98
    }

    Example 1

    Input:
    2026/10/10 UPI/DR/AMAZON PAY INDIA/BHARATPE/845.50

    Output:
    {
        "description": "Amazon Pay purchase",
        "merchant": "Amazon Pay",
        "category": "Shopping",
        "transaction_type": "expense",
        "amount": 845.50,
        "currency": "INR",
        "date": "2026/10/10",
        "confidence": 0.99
    }

    Example 2

    Input:
    2026/10/10 NEFT SALARY INFOSYS LTD 150000

    Output:
    {
        "description": "Salary from Infosys",
        "merchant": "Infosys",
        "category": "Salary",
        "transaction_type": "income",
        "amount": 150000,
        "date": "2026/10/10",
        "currency": "INR",
        "confidence": 0.99
    }

    Example 3

    Input:
    2026/10/10 UPI/SWIGGY/425

    Output:
    {
        "description": "Swiggy food order",
        "merchant": "Swiggy",
        "category": "Food & Dining",
        "transaction_type": "expense",
        "amount": 425,
        "currency": "INR",
        "date": "2026/10/10",
        "confidence": 0.99
    }

    Now classify this transactions:

    {transactions}
"""