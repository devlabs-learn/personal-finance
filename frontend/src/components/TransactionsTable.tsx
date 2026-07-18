import type { Transaction } from "../types";

interface Props {
  transactions: Transaction[];
}

const rowClass = "border-t border-slate-800 bg-slate-950/80";

export default function TransactionsTable({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-slate-400">
        No transactions yet. Add one from the capture page.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/20">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-slate-950/95 text-slate-300">
          <tr>
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4">Description</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className={rowClass}>
              <td className="px-5 py-4 text-slate-300">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="px-5 py-4 text-slate-200">{transaction.description}</td>
              <td className="px-5 py-4 text-slate-400">{transaction.category}</td>
              <td className="px-5 py-4 text-slate-300">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    transaction.transaction_type === "income"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {transaction.transaction_type}
                </span>
              </td>
              <td className="px-5 py-4 text-right font-semibold text-slate-100">
                {transaction.transaction_type === "expense" ? "-" : "+"}${transaction.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
