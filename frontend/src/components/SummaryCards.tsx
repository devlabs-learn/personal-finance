import type { Summary } from "../types";

interface Props {
  summary: Summary;
}

const statClasses =
  "rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm";

export default function SummaryCards({ summary }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className={statClasses}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Income</p>
        <p className="mt-4 text-3xl font-semibold text-slate-950">₹{summary.income.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-600">Total income recorded</p>
      </div>
      <div className={statClasses}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Expenses</p>
        <p className="mt-4 text-3xl font-semibold text-slate-950">₹{summary.expenses.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-600">Total expense recorded</p>
      </div>
      <div className={statClasses}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Balance</p>
        <p className="mt-4 text-3xl font-semibold text-slate-950">₹{summary.balance.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-600">Income minus expenses</p>
      </div>
    </div>
  );
}
