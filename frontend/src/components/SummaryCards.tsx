import type { Summary } from "../types";

interface Props {
  summary: Summary;
}

const statClasses =
  "rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20";

export default function SummaryCards({ summary }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className={statClasses}>
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">Income</p>
        <p className="mt-4 text-3xl font-semibold text-emerald-300">${summary.income.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-400">Total income recorded</p>
      </div>
      <div className={statClasses}>
        <p className="text-sm uppercase tracking-[0.24em] text-rose-400">Expenses</p>
        <p className="mt-4 text-3xl font-semibold text-rose-300">${summary.expenses.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-400">Total expense recorded</p>
      </div>
      <div className={statClasses}>
        <p className="text-sm uppercase tracking-[0.24em] text-sky-400">Balance</p>
        <p className="mt-4 text-3xl font-semibold text-sky-300">${summary.balance.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-400">Income minus expenses</p>
      </div>
    </div>
  );
}
