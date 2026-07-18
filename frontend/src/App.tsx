import { useEffect, useState } from "react";
import { createTransaction, fetchSummary, fetchTransactions } from "./api";
import type { Summary, Transaction } from "./types";
import SummaryCards from "./components/SummaryCards";
import TransactionCapture from "./components/TransactionCapture";
import TransactionsTable from "./components/TransactionsTable";
import type { TransactionCreatePayload } from "./api";

const App = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<"summary" | "transactions" | "capture">("summary");

  const loadData = async () => {
    setError(null);
    setLoading(true);

    try {
      const [summaryData, transactionsData] = await Promise.all([
        fetchSummary(),
        fetchTransactions(),
      ]);
      setSummary(summaryData);
      setTransactions(transactionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload: TransactionCreatePayload) => {
    await createTransaction(payload);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Personal Finance Tracker
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Track every dollar with clarity.</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Monitor income, expenses, and account health with a clean dashboard and transaction capture flow.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { key: "summary", label: "Summary" },
              { key: "transactions", label: "Transactions" },
              { key: "capture", label: "Capture" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActivePage(item.key as typeof activePage)}
                className={`rounded-3xl px-5 py-3 text-sm font-semibold transition ${
                  activePage === item.key
                    ? "bg-sky-500 text-slate-950"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-500/40 bg-rose-950/80 p-6 text-rose-200">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-2 text-sm text-slate-300">{error}</p>
          </div>
        ) : null}

        {activePage === "summary" ? (
          <section className="grid gap-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-400">Dashboard</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-100">Financial summary</h2>
                </div>
                <button
                  onClick={loadData}
                  className="rounded-3xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-8">
                {loading && !summary ? (
                  <p className="text-slate-400">Loading summary...</p>
                ) : summary ? (
                  <SummaryCards summary={summary} />
                ) : null}
              </div>
            </div>
          </section>
        ) : activePage === "transactions" ? (
          <section className="grid gap-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">Transactions</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-100">Recent activity</h2>
                </div>
                <p className="text-sm text-slate-400">Showing latest transactions first.</p>
              </div>

              <div className="mt-8">
                {loading && transactions.length === 0 ? (
                  <p className="text-slate-400">Loading transactions...</p>
                ) : (
                  <TransactionsTable transactions={transactions} />
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-8">
            <TransactionCapture onCreate={handleCreate} onImportComplete={loadData} />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
