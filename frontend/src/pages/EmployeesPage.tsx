import { useMemo, useState } from "react";
import { useEmployees, useFilterOptions } from "../hooks/useEmployees";
import { useDebounced } from "../hooks/useDebounced";
import type { Employee, EmployeeQuery } from "../lib/types";
import { formatLocal, formatUsd } from "../lib/format";
import { Card, Input } from "../components/ui";
import { Dropdown } from "../components/Dropdown";
import { StatusBadge } from "../components/StatusBadge";
import { EditSalaryDialog } from "../components/EditSalaryDialog";

const SORT_FIELDS = [
  { value: "lastName", label: "Name" },
  { value: "salaryUsd" /* mapped below */, label: "Salary" },
  { value: "department", label: "Department" },
  { value: "country", label: "Country" },
  { value: "hireDate", label: "Hire date" },
];

export function EmployeesPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput);
  const [filters, setFilters] = useState({
    country: "",
    department: "",
    level: "",
    status: "",
  });
  const [sortBy, setSortBy] = useState("lastName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Employee | null>(null);

  const { data: options } = useFilterOptions();

  // salaryUsd is a computed field; the API sorts on the underlying baseSalary.
  const apiSortBy = sortBy === "salaryUsd" ? "baseSalary" : sortBy;

  const query: EmployeeQuery = useMemo(
    () => ({
      page,
      pageSize: 25,
      search: search || undefined,
      country: filters.country || undefined,
      department: filters.department || undefined,
      level: filters.level || undefined,
      status: filters.status || undefined,
      sortBy: apiSortBy,
      sortDir,
    }),
    [page, search, filters, apiSortBy, sortDir],
  );

  const { data, isLoading, isError, error } = useEmployees(query);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name, email, code…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
        <Dropdown
          value={filters.country}
          onValueChange={(v) => setFilter("country", v)}
          placeholder="All countries"
          options={[
            { value: "", label: "All countries" },
            ...(options?.countries ?? []).map((c) => ({ value: c, label: c })),
          ]}
        />
        <Dropdown
          value={filters.department}
          onValueChange={(v) => setFilter("department", v)}
          placeholder="All departments"
          options={[
            { value: "", label: "All departments" },
            ...(options?.departments ?? []).map((d) => ({
              value: d,
              label: d,
            })),
          ]}
        />
        <Dropdown
          value={filters.level}
          onValueChange={(v) => setFilter("level", v)}
          placeholder="All levels"
          width="w-32"
          options={[
            { value: "", label: "All levels" },
            ...(options?.levels ?? []).map((l) => ({ value: l, label: l })),
          ]}
        />
        <Dropdown
          value={filters.status}
          onValueChange={(v) => setFilter("status", v)}
          placeholder="All statuses"
          width="w-36"
          options={[
            { value: "", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "ON_LEAVE", label: "On leave" },
            { value: "TERMINATED", label: "Terminated" },
          ]}
        />
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-slate-500">Sort</span>
          <Dropdown
            value={sortBy}
            onValueChange={setSortBy}
            width="w-36"
            options={SORT_FIELDS.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
          />
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100"
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 text-right font-medium">
                Salary (local)
              </th>
              <th className="px-4 py-3 text-right font-medium">Salary (USD)</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-red-500">
                  {(error as Error).message}
                </td>
              </tr>
            )}
            {data?.data.map((e) => (
              <tr
                key={e.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-slate-400">{e.email}</div>
                </td>
                <td className="px-4 py-3">{e.department}</td>
                <td className="px-4 py-3">{e.country}</td>
                <td className="px-4 py-3">{e.level}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatLocal(e.baseSalary, e.currencySymbol)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {formatUsd(e.salaryUsd)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(e)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {data && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {(data.pagination.page - 1) * data.pagination.pageSize + 1}–
            {Math.min(
              data.pagination.page * data.pagination.pageSize,
              data.pagination.total,
            )}{" "}
            of {data.pagination.total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-100"
            >
              Prev
            </button>
            <span>
              Page {data.pagination.page} / {data.pagination.totalPages}
            </span>
            <button
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {editing && (
        <EditSalaryDialog employee={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
