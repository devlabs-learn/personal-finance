import { useState } from "react";
import { parseTransactionFromDocument } from "../api";
import type { TransactionCreatePayload } from "../api";
import type { TransactionType } from "../types";

interface Props {
  onCreate: (payload: TransactionCreatePayload) => Promise<void>;
  onImportComplete?: () => Promise<void>;
}

const defaultForm = {
  description: "",
  amount: 0,
  transaction_type: "expense" as TransactionType,
  category: "Uncategorized",
  date: new Date().toISOString().slice(0, 10),
};

export default function TransactionCapture({ onCreate, onImportComplete }: Props) {
  const [form, setForm] = useState<TransactionCreatePayload>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = <K extends keyof TransactionCreatePayload>(field: K, value: string) => {
    setForm((current) => ({
      ...current,
      [field]:
        field === "amount"
          ? Number(value)
          : field === "transaction_type"
          ? (value as TransactionType)
          : value,
    } as TransactionCreatePayload));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      await onCreate({
        ...form,
        date: form.date ? new Date(form.date).toISOString() : undefined,
      });
      setForm({
        ...defaultForm,
        transaction_type: "expense",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please choose a document or receipt first.");
      return;
    }

    setError(null);
    setMessage(null);
    setParsing(true);

    try {
      const parsedTransactions = await parseTransactionFromDocument(selectedFile);
      if (!parsedTransactions.length) {
        throw new Error("No transactions were found in the document.");
      }

      setForm({
        ...defaultForm,
        transaction_type: "expense",
      });
      setMessage(
        parsedTransactions.length === 1
          ? "Imported 1 transaction from the document."
          : `Imported ${parsedTransactions.length} transactions from the document.`,
      );
      await onImportComplete?.();
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse document.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <form
      onSubmit={submitForm}
      className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/20"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-sky-400">Capture transaction</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-100">Add income or expense</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Description
          <input
            value={form.description}
            onChange={(event) => handleChange("description", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500"
            placeholder="Salary, groceries, rent..."
            required
          />
        </label>

        <label className="block text-sm text-slate-300">
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount === 0 ? "" : form.amount}
            onChange={(event) => handleChange("amount", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500"
            placeholder="0.00"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm text-slate-300">
          Type
          <select
            value={form.transaction_type}
            onChange={(event) => handleChange("transaction_type", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label className="block text-sm text-slate-300">
          Category
          <input
            value={form.category}
            onChange={(event) => handleChange("category", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500"
            placeholder="Uncategorized"
            required
          />
        </label>

        <label className="block text-sm text-slate-300">
          Date
          <input
            type="date"
            value={form.date}
            onChange={(event) => handleChange("date", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <p className="text-sm font-semibold text-slate-200">Upload receipt or PDF</p>
        <p className="mt-1 text-sm text-slate-400">The app can parse a receipt image or PDF and prefill the form.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100"
          />
          <button
            type="button"
            onClick={handleFileUpload}
            disabled={parsing || !selectedFile}
            className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {parsing ? "Parsing..." : "Parse document"}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        {submitting ? "Saving..." : "Save transaction"}
      </button>
    </form>
  );
}
