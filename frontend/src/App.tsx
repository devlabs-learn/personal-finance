import { useEffect, useMemo, useState } from "react";
import { createTransaction, fetchSummary, fetchTransactions, parseTransactionFromDocument } from "./api";
import type { Summary, Transaction } from "./types";
import TransactionCapture from "./components/TransactionCapture";
import TransactionsTable from "./components/TransactionsTable";
import type { TransactionCreatePayload } from "./api";

const navItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "transactions", label: "Transactions" },
  { key: "insights", label: "AI Insights" },
  { key: "capture", label: "Scan Receipt" },
] as const;

type ActivePage = (typeof navItems)[number]["key"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const App = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleUploadFile = async (file: File) => {
    try {
      setError(null);
      setLoading(true);
      const parsed = await parseTransactionFromDocument(file);
      if (!parsed.length) {
        setError("No transactions could be extracted from the document.");
        return;
      }
      await loadData();
      setActivePage("transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse receipt.");
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
    setActivePage("transactions");
  };

  const filteredTransactions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      return [
        transaction.description,
        transaction.category,
        transaction.transaction_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [searchTerm, transactions]);

  const totalsByCategory = useMemo(() => {
    return transactions.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] ?? 0) + transaction.amount;
      return acc;
    }, {});
  }, [transactions]);

  const topCategories = useMemo(() => {
    return Object.entries(totalsByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));
  }, [totalsByCategory]);

  const monthlyCashFlow = useMemo(() => {
    if (!transactions.length) {
      return [
        { label: "Jan", value: 52000 },
        { label: "Feb", value: 64000 },
        { label: "Mar", value: 48000 },
        { label: "Apr", value: 72000 },
        { label: "May", value: 68000 },
      ];
    }

    const totals = transactions.reduce<Record<string, number>>((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] ?? 0) + (transaction.transaction_type === "income" ? transaction.amount : -transaction.amount);
      return acc;
    }, {});

    return Object.entries(totals)
      .sort((a, b) => monthNames.indexOf(a[0]) - monthNames.indexOf(b[0]))
      .slice(-5)
      .map(([label, value]) => ({ label, value }));
  }, [transactions]);

  const balanceScore = useMemo(() => {
    if (!summary) return 72;
    const ratio = summary.expenses ? summary.income / summary.expenses : 1;
    return Math.min(95, Math.max(55, Math.round(60 + ratio * 10)));
  }, [summary]);

  const exportTransactions = () => {
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...filteredTransactions.map((transaction) => [
        new Date(transaction.date).toLocaleDateString(),
        transaction.description,
        transaction.category,
        transaction.transaction_type,
        transaction.amount.toFixed(2),
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Personal Finance</p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-950">Sophisticated Navigator</h1>
            </div>

            <nav className="space-y-2 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActivePage(item.key)}
                  className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activePage === item.key
                      ? "bg-slate-950 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setActivePage("capture")}
              className="mt-6 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Scan Receipt
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                  {activePage === "dashboard"
                    ? "Dashboard"
                    : activePage === "transactions"
                    ? "Transactions"
                    : activePage === "insights"
                    ? "AI Insights"
                    : "Receipt Scan"}
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950 capitalize">
                  {activePage === "dashboard"
                    ? "Overview"
                    : activePage === "transactions"
                    ? "Recent activity"
                    : activePage === "insights"
                    ? "Your financial health"
                    : "Capture transaction"}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {activePage === "transactions" ? (
                  <>
                    <button
                      type="button"
                      onClick={exportTransactions}
                      className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Export
                    </button>
                    <button
                      type="button"
                      onClick={loadData}
                      className="rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Refresh
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={loadData}
                    className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Refresh data
                  </button>
                )}
              </div>
            </div>

            {activePage === "transactions" ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
                <label className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-slate-400">🔍</span>
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search transactions..."
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  />
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePage("capture")}
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Add transaction
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">Unable to load data</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : null}

          {activePage === "dashboard" ? (
            <section className="grid gap-6">
              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Total balance</p>
                      <h3 className="mt-3 text-5xl font-semibold text-slate-950">{formatCurrency(summary?.balance ?? 0)}</h3>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                        Track your available funds, monthly momentum, and the latest cash flow insights from every transaction.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-900">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Health score</p>
                      <p className="mt-3 text-4xl font-semibold">{balanceScore}</p>
                      <p className="mt-2 text-sm text-slate-600">Excellent based on your recent activity</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Income</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{formatCurrency(summary?.income ?? 0)}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Expenses</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{formatCurrency(summary?.expenses ?? 0)}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Net flow</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{formatCurrency((summary?.income ?? 0) - (summary?.expenses ?? 0))}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Monthly Income</p>
                    <h3 className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(summary?.income ?? 0)}</h3>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Latest forecast</p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      Based on current spending, you are projected to finish the month with a strong buffer across your key categories.
                    </p>
                    <div className="mt-6 flex items-center gap-3 text-sm text-slate-700">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">Savings +12%</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">Bills paid</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Cash flow</p>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600">Last 5 entries</span>
                  </div>
                  <div className="mt-8 grid gap-3">
                    {monthlyCashFlow.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-end gap-3">
                          <div className="h-4 w-full rounded-full bg-slate-100">
                            <div
                              className="h-4 rounded-full bg-slate-900"
                              style={{ width: `${Math.min(100, Math.max(12, (item.value / 90000) * 100))}%` }}
                            />
                          </div>
                          <span className="w-16 text-right text-sm text-slate-600">{formatCurrency(item.value)}</span>
                        </div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Top categories</p>
                  <div className="mt-6 space-y-4">
                    {topCategories.length ? (
                      topCategories.map((category) => {
                        const fraction = summary?.income ? Math.min(100, Math.round((category.amount / summary.income) * 100)) : 24;
                        return (
                          <div key={category.category} className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-slate-700">
                              <span>{category.category}</span>
                              <span>{formatCurrency(category.amount)}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(12, fraction)}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">No category data available yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Recent transactions</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">Latest ledger activity</h3>
                  </div>
                  <p className="text-sm text-slate-500">Showing the five most recent items.</p>
                </div>
                <div className="mt-6">
                  <TransactionsTable transactions={recentTransactions} />
                </div>
              </div>
            </section>
          ) : activePage === "transactions" ? (
            <section className="grid gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">
                  {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? "" : "s"} found.
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                {loading && !transactions.length ? (
                  <p className="text-slate-500">Loading transactions…</p>
                ) : (
                  <TransactionsTable transactions={filteredTransactions} />
                )}
              </div>
            </section>
          ) : activePage === "insights" ? (
            <section className="grid gap-6">
              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Financial Health Score</p>
                      <h3 className="mt-3 text-5xl font-semibold text-slate-950">{balanceScore}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                        Your score is up 4 points this month due to consistent savings and reduced discretionary spending.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-900">
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Trend</p>
                      <p className="mt-3 text-2xl font-semibold text-emerald-700">+4 points</p>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">Savings +12%</span>
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Bills paid</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Scan receipt</p>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-700">Quick add</span>
                  </div>
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-2xl">📄</p>
                    <p className="mt-4 text-lg font-semibold text-slate-900">Tap to scan or upload</p>
                    <p className="mt-2 text-sm text-slate-600">Auto-extracts vendor, total, and category.</p>
                    <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) handleUploadFile(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Smart Recommendations</p>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-700">Personalized</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-950">Unused Subscription Detected</h4>
                          <p className="mt-2 text-sm text-slate-600">You could save ₹1,250/mo. We noticed you haven't used "StreamFlix" in 3 months.</p>
                        </div>
                        <button className="text-sm font-semibold text-rose-600">Cancel</button>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-950">Optimize Savings</h4>
                          <p className="mt-2 text-sm text-slate-600">Move ₹40,000 from Checking to High-Yield Savings to earn an extra ₹200 this month.</p>
                        </div>
                        <button className="text-sm font-semibold text-emerald-700">Transfer</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Spending Forecast</p>
                  <div className="mt-6 h-52 rounded-3xl bg-slate-50 p-4">
                    <div className="flex h-full items-end gap-3">
                      {monthlyCashFlow.map((point, index) => (
                        <div key={index} className="flex-1">
                          <div className="h-40 rounded-t-3xl bg-slate-300" style={{ height: `${Math.max(24, Math.min(100, Math.abs(point.value) / 1200))}%` }} />
                          <p className="mt-3 text-center text-sm text-slate-500">{point.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-6 text-sm leading-6 text-slate-600">
                    Projected to finish <strong className="text-emerald-700">₹10,000 under budget</strong> this month.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="grid gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <TransactionCapture onCreate={handleCreate} onImportComplete={loadData} />
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
