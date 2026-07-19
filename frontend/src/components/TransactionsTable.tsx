import type { Transaction } from "../types";

interface Props {
  transactions: Transaction[];
}

export default function TransactionsTable({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-slate-600">
        No transactions yet. Add one from the scan receipt page.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4">Description</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
              <td className="px-5 py-4 text-slate-600">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="px-5 py-4 text-slate-900">{transaction.description}</td>
              <td className="px-5 py-4 text-slate-600">{transaction.category}</td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    transaction.transaction_type === "income"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {transaction.transaction_type}
                </span>
              </td>
              <td className={`px-5 py-4 text-right font-semibold ${transaction.transaction_type === "expense" ? "text-rose-600" : "text-emerald-700"}`}>
                {transaction.transaction_type === "expense" ? "-" : "+"}₹{transaction.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
