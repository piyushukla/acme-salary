import { useState } from "react";
import type { Employee } from "../lib/types";
import { useUpdateEmployee } from "../hooks/useEmployees";
import { Input, Select } from "./ui";

const CURRENCIES = ["USD", "INR", "GBP", "EUR", "SGD", "BRL", "CAD", "AUD"];
const STATUSES = ["ACTIVE", "ON_LEAVE", "TERMINATED"];

export function EditSalaryDialog({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const update = useUpdateEmployee();
  const [baseSalary, setBaseSalary] = useState(String(employee.baseSalary));
  const [currencyCode, setCurrencyCode] = useState(employee.currencyCode);
  const [status, setStatus] = useState(employee.status);

  const save = () => {
    update.mutate(
      { id: employee.id, data: { baseSalary: Number(baseSalary), currencyCode, status } },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">Edit salary</h2>
        <p className="mt-1 text-sm text-slate-500">{employee.name} · {employee.employeeCode}</p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Base salary (local)</span>
            <Input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Currency</span>
            <Select value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} className="mt-1 w-full">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full">
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </Select>
          </label>
        </div>

        {update.isError && (
          <p className="mt-3 text-sm text-red-600">{(update.error as Error).message}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={update.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {update.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
