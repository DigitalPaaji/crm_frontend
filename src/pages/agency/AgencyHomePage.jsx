import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { base_url } from "../../components/utlis";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";

import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ListTodo,
  RefreshCw,
  Sparkles,
} from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

// ---------- shared chart styling ----------
ChartJS.defaults.font.family =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#64748b";

const tooltip = {
  backgroundColor: "#0f172a",
  padding: 10,
  cornerRadius: 8,
  titleFont: { weight: "600" },
  displayColors: true,
  boxPadding: 4,
};

const PALETTE = [
  "#0f766e",
  "#2563eb",
  "#d97706",
  "#7c3aed",
  "#e11d48",
  "#0891b2",
  "#65a30d",
  "#db2777",
  "#475569",
  "#ca8a04",
];

const PRIORITY_COLORS = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };

// ---------- helpers ----------
const formatLabel = (value) => {
  if (!value) return "Not specified";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getMonthName = (month, year) =>
  new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// =====================================================
// MAIN
// =====================================================
const AgencyHomePage = () => {
  const { token } = useSelector((state) => state.token);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  // keep a ref so refresh doesn't replace the page with a skeleton
  const dashboardRef = React.useRef(null);
  useEffect(() => {
    dashboardRef.current = dashboard;
  }, [dashboard]);

  const fetchData = useCallback(async () => {
    try {
      dashboardRef.current ? setRefreshing(true) : setLoading(true);
      setError("");

      const response = await fetch(`${base_url}/auth/dashboard`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const result = await response.json();
      if (!result.success)
        throw new Error(result.message || "Error loading dashboard");

      setDashboard(result.data);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  if (loading) return <Skeleton />;

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-sm shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Couldn't load your dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          <button
            onClick={fetchData}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { summary, charts } = dashboard;

  const conversion = summary.totalLeads
    ? (summary.convertedLeads / summary.totalLeads) * 100
    : 0;

  // ---------- chart data ----------
  const donut = (items, colors) => ({
    labels: items.map((i) => formatLabel(i._id)),
    datasets: [
      {
        data: items.map((i) => i.count),
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  });

  const statusData = donut(charts.leadsByStatus, PALETTE);
  const sourceData = donut(charts.leadsBySource, PALETTE);
  const taskStatusData = donut(charts.tasksByStatus, [
    "#f59e0b",
    "#2563eb",
    "#10b981",
  ]);

  const serviceData = {
    labels: charts.leadsByLeadFor.map((i) => i._id || "Not specified"),
    datasets: [
      {
        label: "Leads",
        data: charts.leadsByLeadFor.map((i) => i.count),
        backgroundColor: "#0f766e",
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const monthlyData = {
    labels: charts.monthlyLeads.map((i) =>
      getMonthName(i._id.month, i._id.year)
    ),
    datasets: [
      {
        label: "New leads",
        data: charts.monthlyLeads.map((i) => i.count),
        borderColor: "#0f766e",
        borderWidth: 2.5,
        fill: true,
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          if (!chart.chartArea) return "rgba(15,118,110,0.08)";
          const g = chart.ctx.createLinearGradient(
            0,
            chart.chartArea.top,
            0,
            chart.chartArea.bottom
          );
          g.addColorStop(0, "rgba(15,118,110,0.22)");
          g.addColorStop(1, "rgba(15,118,110,0)");
          return g;
        },
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#0f766e",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const priorityData = {
    labels: charts.tasksByPriority.map((i) => formatLabel(i._id)),
    datasets: [
      {
        label: "Tasks",
        data: charts.tasksByPriority.map((i) => i.count),
        backgroundColor: charts.tasksByPriority.map(
          (i) => PRIORITY_COLORS[String(i._id).toLowerCase()] || "#94a3b8"
        ),
        borderRadius: 8,
        maxBarThickness: 56,
      },
    ],
  };

  // ---------- options ----------
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: { legend: { display: false }, tooltip },
  };

  const gridColor = "#eef2f6";

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { display: false }, tooltip },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: gridColor },
        border: { display: false },
      },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  const columnOptions = {
    ...lineOptions,
    interaction: { mode: "nearest", intersect: true },
  };

  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: gridColor },
        border: { display: false },
      },
      y: { grid: { display: false }, border: { display: false } },
    },
  };

  const serviceHeight = Math.max(240, charts.leadsByLeadFor.length * 40 + 40);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* ============ HEADER ============ */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-1">
              {greeting()}
            </h1>
            <p className="text-slate-500 mt-1">
              {summary.todayFollowups > 0
                ? `You have ${summary.todayFollowups} follow-up${
                    summary.todayFollowups > 1 ? "s" : ""
                  } to make today.`
                : "No follow-ups due today."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {updatedAt && (
              <span className="text-xs text-slate-400 hidden sm:block">
                Updated{" "}
                {updatedAt.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            Couldn't refresh: {error}. Showing the last loaded data.
          </div>
        )}

        {/* ============ FOLLOW-UPS (the thing to act on) ============ */}
        <section
          aria-label="Follow-ups"
          className="bg-white border border-slate-200 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden"
        >
          <FollowupCell
            icon={<AlertCircle size={18} />}
            label="Overdue"
            value={summary.overdueFollowups}
            hint={
              summary.overdueFollowups > 0
                ? "Needs a call or message"
                : "You're all caught up"
            }
            tone={summary.overdueFollowups > 0 ? "red" : "slate"}
          />
          <FollowupCell
            icon={<CalendarDays size={18} />}
            label="Due today"
            value={summary.todayFollowups}
            hint="Scheduled for today"
            tone="teal"
          />
          <FollowupCell
            icon={<CalendarClock size={18} />}
            label="Upcoming"
            value={summary.upcomingFollowups}
            hint="Scheduled later"
            tone="slate"
          />
        </section>

        {/* ============ KPIs ============ */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-300">Conversion rate</p>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-5xl font-semibold tracking-tight tabular-nums">
                {conversion.toFixed(1)}%
              </span>
              <span className="text-sm text-slate-400 pb-1.5">
                {summary.convertedLeads} of {summary.totalLeads} leads
                converted
              </span>
            </div>
            <div
              className="mt-5 h-2 rounded-full bg-white/10 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(conversion)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-teal-400"
                style={{ width: `${Math.min(conversion, 100)}%` }}
              />
            </div>
          </div>

          <StatCard
            icon={<Sparkles size={18} />}
            label="Interested leads"
            value={summary.interestedLeads}
            note={`${summary.totalLeads} total leads`}
          />
          <StatCard
            icon={<ListTodo size={18} />}
            label="Total tasks"
            value={summary.totalTasks}
            note="Across your team"
          />
        </section>

        {/* ============ LEAD GROWTH ============ */}
        <ChartCard
          title="Lead growth"
          subtitle="New leads created each month"
        >
          <div className="h-[300px]">
            {charts.monthlyLeads.length > 0 ? (
              <Line data={monthlyData} options={lineOptions} />
            ) : (
              <EmptyChart message="No leads added yet" />
            )}
          </div>
        </ChartCard>

        {/* ============ STATUS + SOURCE ============ */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Pipeline" subtitle="Leads by current status">
            <DonutWithLegend
              items={charts.leadsByStatus}
              data={statusData}
              options={donutOptions}
              colors={PALETTE}
              centerLabel="Leads"
            />
          </ChartCard>

          <ChartCard title="Lead sources" subtitle="Where your leads come from">
            <DonutWithLegend
              items={charts.leadsBySource}
              data={sourceData}
              options={donutOptions}
              colors={PALETTE}
              centerLabel="Leads"
            />
          </ChartCard>
        </div>

        {/* ============ SERVICES ============ */}
        <ChartCard
          title="Leads by service"
          subtitle="What your leads are asking for"
        >
          <div style={{ height: serviceHeight }}>
            {charts.leadsByLeadFor.length > 0 ? (
              <Bar data={serviceData} options={horizontalBarOptions} />
            ) : (
              <EmptyChart message="No service data yet" />
            )}
          </div>
        </ChartCard>

        {/* ============ TASKS ============ */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Task progress" subtitle="Tasks by status">
            <DonutWithLegend
              items={charts.tasksByStatus}
              data={taskStatusData}
              options={donutOptions}
              colors={["#f59e0b", "#2563eb", "#10b981"]}
              centerLabel="Tasks"
              emptyMessage="No tasks yet. Create one to track it here."
            />
          </ChartCard>

          <ChartCard title="Task priority" subtitle="How urgent your tasks are">
            <div className="h-[260px]">
              {charts.tasksByPriority.length > 0 ? (
                <Bar data={priorityData} options={columnOptions} />
              ) : (
                <EmptyChart message="No tasks yet. Create one to track it here." />
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTS
// =====================================================

const TONES = {
  red: { chip: "bg-red-50 text-red-600", value: "text-red-600" },
  teal: { chip: "bg-teal-50 text-teal-700", value: "text-slate-900" },
  slate: { chip: "bg-slate-100 text-slate-600", value: "text-slate-900" },
};

const FollowupCell = ({ icon, label, value, hint, tone = "slate" }) => (
  <div className="p-5 flex items-center gap-4">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TONES[tone].chip}`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`text-2xl font-semibold tabular-nums leading-tight ${TONES[tone].value}`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-400 mt-0.5 truncate">{hint}</p>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, note }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
    <div className="flex items-center gap-2 text-slate-500">
      <span className="text-teal-700">{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
    <div className="mt-4">
      <p className="text-4xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      <p className="text-xs text-slate-400 mt-1">{note}</p>
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <div className="mb-5">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </section>
);

// Doughnut with total in the middle and a readable legend (name, count, share)
const DonutWithLegend = ({
  items,
  data,
  options,
  colors,
  centerLabel,
  emptyMessage = "No data available",
}) => {
  const total = items.reduce((sum, i) => sum + i.count, 0);

  if (!items.length) {
    return (
      <div className="h-[240px]">
        <EmptyChart message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-[220px] h-[220px] shrink-0">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-semibold text-slate-900 tabular-nums">
            {total}
          </span>
          <span className="text-xs text-slate-500">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <li key={`${item._id}-${idx}`} className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="text-sm text-slate-700 flex-1 truncate">
              {formatLabel(item._id)}
            </span>
            <span className="text-sm font-medium text-slate-900 tabular-nums">
              {item.count}
            </span>
            <span className="text-xs text-slate-400 w-10 text-right tabular-nums">
              {total ? Math.round((item.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const EmptyChart = ({ message = "No data available" }) => (
  <div className="h-full min-h-[120px] flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
    {message}
  </div>
);

const Skeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div
      className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-pulse"
      aria-busy="true"
    >
      <div>
        <div className="h-4 w-40 bg-slate-200 rounded mb-3" />
        <div className="h-8 w-56 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-72 bg-slate-200 rounded" />
      </div>
      <div className="h-24 bg-white border border-slate-200 rounded-2xl" />
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 h-40 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-white border border-slate-200 rounded-2xl" />
        <div className="h-40 bg-white border border-slate-200 rounded-2xl" />
      </div>
      <div className="h-80 bg-white border border-slate-200 rounded-2xl" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-72 bg-white border border-slate-200 rounded-2xl" />
        <div className="h-72 bg-white border border-slate-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

export default AgencyHomePage;