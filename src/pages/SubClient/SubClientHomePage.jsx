import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  CalendarClock,
  Clock3,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Building2,
  Mail,
  Globe,
} from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";
import { base_url } from "../../components/utlis";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const SubClientHomePage = () => {
  const { token } = useSelector((state) => state.subuser);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(
    async (signal, isRefresh = false) => {
      if (!token) {
        setError("Authentication token was not found.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${base_url}/subclient/aboutclient`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to fetch dashboard details."
          );
        }

        setDashboard(data.dashboard);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(
            requestError.message ||
              "Something went wrong while loading the dashboard."
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(undefined, true);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error && !dashboard) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const {
    client,
    leads,
    subUsers,
    followUps,
    recentLeads = [],
    upcomingFollowUps = [],
  } = dashboard || {};

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          client={client}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total leads"
            value={leads?.total || 0}
            description="All leads in your account"
            icon={Users}
            iconClasses="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="New leads"
            value={leads?.new || 0}
            description="Recently added leads"
            icon={UserPlus}
            iconClasses="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Converted"
            value={leads?.converted || 0}
            description={`${leads?.conversionRate || 0}% conversion rate`}
            icon={UserCheck}
            iconClasses="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Lost leads"
            value={leads?.lost || 0}
            description={`${leads?.lostRate || 0}% lost rate`}
            icon={UserX}
            iconClasses="bg-red-50 text-red-600"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <LeadStatusChart leads={leads} />

          <FollowUpChart followUps={followUps} />
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SmallStatCard
            title="Follow-up leads"
            value={leads?.followUp || 0}
            icon={TrendingUp}
          />

          <SmallStatCard
            title="Today's follow-ups"
            value={followUps?.today || 0}
            icon={CalendarClock}
          />

          <SmallStatCard
            title="Overdue follow-ups"
            value={followUps?.overdue || 0}
            icon={AlertTriangle}
          />

          <SmallStatCard
            title="Upcoming follow-ups"
            value={followUps?.upcoming || 0}
            icon={Clock3}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <RecentLeads leads={recentLeads} />

          <div className="space-y-6">
            <SubUserOverview subUsers={subUsers} />

            <UpcomingFollowUps followUps={upcomingFollowUps} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SubClientHomePage;

const DashboardHeader = ({
  client,
  refreshing,
  onRefresh,
}) => {
  const logoUrl = getImageUrl(client?.logo);

  return (
    <header className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={client?.agencyname || "Client"}
              className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xl font-bold text-white">
              {getInitial(client?.agencyname || client?.ownername)}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-600">
              Client dashboard
            </p>

            <h1 className="truncate text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome,{" "}
              {client?.ownername || client?.agencyname || "Client"}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              {client?.agencyname && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={15} />
                  {client.agencyname}
                </span>
              )}

              {client?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={15} />
                  {client.email}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <Globe size={15} />
                Website: {client?.website ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
              client?.active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {client?.active ? "Active account" : "Inactive account"}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid border-t border-slate-100 bg-slate-50/70 sm:grid-cols-3">
        <HeaderDetail
          label="Account validity"
          value={formatDate(client?.validity)}
        />

        <HeaderDetail
          label="Total sub-users"
          value={client?.subUserCount ?? 0}
        />

        <HeaderDetail
          label="Last login"
          value={formatDateTime(client?.lastlogin)}
          border
        />
      </div>
    </header>
  );
};

const HeaderDetail = ({ label, value }) => {
  return (
    <div className="border-b border-slate-100 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClasses,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

const SmallStatCard = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-900">
          {value}
        </p>

        <p className="mt-0.5 text-sm text-slate-500">
          {title}
        </p>
      </div>
    </div>
  );
};

const LeadStatusChart = ({ leads }) => {
  const chartData = useMemo(
    () => ({
      labels: ["New", "Follow-up", "Converted", "Lost"],
      datasets: [
        {
          label: "Leads",
          data: [
            leads?.new || 0,
            leads?.followUp || 0,
            leads?.converted || 0,
            leads?.lost || 0,
          ],
          backgroundColor: [
            "rgba(59, 130, 246, 0.75)",
            "rgba(139, 92, 246, 0.75)",
            "rgba(16, 185, 129, 0.75)",
            "rgba(239, 68, 68, 0.75)",
          ],
          borderColor: [
            "rgb(59, 130, 246)",
            "rgb(139, 92, 246)",
            "rgb(16, 185, 129)",
            "rgb(239, 68, 68)",
          ],
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 52,
        },
      ],
    }),
    [leads]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          padding: 12,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          grid: {
            color: "rgba(148, 163, 184, 0.15)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    }),
    []
  );

  return (
    <ChartCard
      title="Lead status overview"
      description="Distribution of leads by current status."
    >
      <div className="h-[320px]">
        <Bar data={chartData} options={options} />
      </div>
    </ChartCard>
  );
};

const FollowUpChart = ({ followUps }) => {
  const total =
    (followUps?.today || 0) +
    (followUps?.overdue || 0) +
    (followUps?.upcoming || 0);

  const hasData = total > 0;

  const chartData = useMemo(
    () => ({
      labels: ["Today", "Overdue", "Upcoming"],
      datasets: [
        {
          data: hasData
            ? [
                followUps?.today || 0,
                followUps?.overdue || 0,
                followUps?.upcoming || 0,
              ]
            : [1],
          backgroundColor: hasData
            ? [
                "rgba(59, 130, 246, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(16, 185, 129, 0.8)",
              ]
            : ["rgba(226, 232, 240, 1)"],
          borderWidth: 0,
          hoverOffset: hasData ? 6 : 0,
        },
      ],
    }),
    [followUps, hasData]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          display: hasData,
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 16,
          },
        },
        tooltip: {
          enabled: hasData,
        },
      },
    }),
    [hasData]
  );

  return (
    <ChartCard
      title="Follow-up activity"
      description={`${followUps?.total || 0} total follow-ups`}
    >
      <div className="relative h-[320px]">
        <Doughnut data={chartData} options={options} />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="mb-9 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {followUps?.total || 0}
            </p>

            <p className="text-xs font-medium text-slate-500">
              Total
            </p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

const ChartCard = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
};

const RecentLeads = ({ leads }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900">
          Recent leads
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Recently created leads in your account.
        </p>
      </div>

      {leads.length === 0 ? (
        <EmptyState message="No recent leads found." />
      ) : (
        <>
          <div className="divide-y divide-slate-100 md:hidden">
            {leads.map((lead) => (
              <div key={lead._id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {getLeadName(lead)}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {lead.email || lead.phone || "No contact details"}
                    </p>
                  </div>

                  <StatusBadge status={lead.status} />
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Created {formatDateTime(lead.createdAt)}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeading>Lead</TableHeading>
                  <TableHeading>Contact</TableHeading>
                  <TableHeading>Status</TableHeading>
                  <TableHeading>Created</TableHeading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                          {getInitial(getLeadName(lead))}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {getLeadName(lead)}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Lead ID: {lead._id?.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                      <p>{lead.email || "No email"}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {lead.phone || "No phone"}
                      </p>
                    </td>

                    <td className="px-5 py-4 sm:px-6">
                      <StatusBadge status={lead.status} />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 sm:px-6">
                      {formatDateTime(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const SubUserOverview = ({ subUsers }) => {
  const total = subUsers?.total || 0;
  const active = subUsers?.active || 0;
  const inactive = subUsers?.inactive || 0;

  const activePercentage =
    total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Sub-users
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Team account overview
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Users size={21} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <OverviewValue label="Total" value={total} />
        <OverviewValue label="Active" value={active} />
        <OverviewValue label="Inactive" value={inactive} />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">
            Active accounts
          </span>

          <span className="font-bold text-slate-700">
            {activePercentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${activePercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const OverviewValue = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-4">
      <p className="text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
};

const UpcomingFollowUps = ({ followUps }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900">
          Upcoming follow-ups
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your next scheduled activities.
        </p>
      </div>

      {followUps.length === 0 ? (
        <EmptyState message="No upcoming follow-ups found." />
      ) : (
        <div className="divide-y divide-slate-100">
          {followUps.map((followUp) => (
            <div
              key={followUp._id}
              className="flex items-start gap-3 p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarClock size={19} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {followUp.lead?.name ||
                    `${followUp.lead?.firstName || ""} ${
                      followUp.lead?.lastName || ""
                    }`.trim() ||
                    "Lead follow-up"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDateTime(followUp.date)}
                </p>

                {followUp.by?.name && (
                  <p className="mt-1 text-xs text-slate-400">
                    Assigned to {followUp.by.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    new: "bg-blue-50 text-blue-700",
    follow_up: "bg-violet-50 text-violet-700",
    converted: "bg-emerald-50 text-emerald-700",
    lost: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
};

const TableHeading = ({ children }) => {
  return (
    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
      {children}
    </th>
  );
};

const EmptyState = ({ message }) => {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <CalendarClock size={21} />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">
        {message}
      </p>
    </div>
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-7 h-40 rounded-2xl bg-white" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="h-[400px] rounded-2xl bg-white" />
          <div className="h-[400px] rounded-2xl bg-white" />
        </div>

        <div className="mt-6 h-80 rounded-2xl bg-white" />
      </div>
    </div>
  );
};

const getLeadName = (lead) => {
  if (lead?.name?.trim()) {
    return lead.name.trim();
  }

  const fullName = `${lead?.firstName || ""} ${
    lead?.lastName || ""
  }`.trim();

  return fullName || "Unnamed lead";
};

const getInitial = (name) => {
  return name?.trim()?.charAt(0)?.toUpperCase() || "C";
};

const formatStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) {
    return "Never";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getImageUrl = (path) => {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  try {
    return `${new URL(base_url).origin}${path}`;
  } catch {
    return `${base_url}${path}`;
  }
};