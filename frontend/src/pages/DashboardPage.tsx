import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useByDimension, useDistribution, useSummary } from "../hooks/useAnalytics";
import { formatUsd, formatUsdCompact } from "../lib/format";
import { Card } from "../components/ui";
import { StatCard } from "../components/StatCard";

const BAR = "#0f172a";
const PALETTE = ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const summary = useSummary();
  const byDept = useByDimension("department");
  const byCountry = useByDimension("country");
  const distribution = useDistribution();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active headcount" value={(summary.data?.headcount ?? 0).toLocaleString()} />
        <StatCard label="Total payroll (USD)" value={summary.data ? formatUsdCompact(summary.data.totalPayrollUsd) : "—"} sub="annualized, active only" />
        <StatCard label="Average salary" value={summary.data ? formatUsd(summary.data.averageUsd) : "—"} />
        <StatCard label="Median salary" value={summary.data ? formatUsd(summary.data.medianUsd) : "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Total pay by department (USD)">
          <BarChart data={byDept.data ?? []} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="group" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => formatUsdCompact(v)} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => formatUsd(v)} />
            <Bar dataKey="totalUsd" fill={BAR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Average pay by country (USD)">
          <BarChart data={byCountry.data ?? []} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="group" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => formatUsdCompact(v)} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => formatUsd(v)} />
            <Bar dataKey="avgUsd" fill={BAR} radius={[4, 4, 0, 0]}>
              {(byCountry.data ?? []).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Bar>
          </BarChart>
        </ChartCard>
      </div>

      <ChartCard title="Salary distribution (USD bands, headcount)">
        <BarChart data={distribution.data ?? []} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="band" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString()} employees`} />
          <Bar dataKey="count" fill={BAR} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}
