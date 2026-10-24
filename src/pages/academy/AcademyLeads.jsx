import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GrFormView } from "react-icons/gr";

import {
  FiFilter,
  FiRefreshCw,
  FiPhone,
  FiMail,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiX,
  FiUsers,
  FiUserCheck,
} from "react-icons/fi";

import { agency_url } from "../../components/utlis";
import { useSelector } from "react-redux";

const ALL_STATUSES = [
  "NEW",
  "COUNSELING",
  "DEMO",
  "DEMODONE",
  "ACTIVE",
  "INACTIVE",
  "CONVERTED",
  "NOT_INTERESTED",
];

const SOURCE_OPTIONS = [
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "GOOGLE",
  "WHATSAPP",
  "REFERRAL",
  "CALL",
  "WALK_IN",
  "OTHER",
];

const statusColors = {
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  COUNSELING: "bg-purple-100 text-purple-700 border-purple-200",
  DEMO: "bg-cyan-100 text-cyan-700 border-cyan-200",
  DEMODONE: "bg-teal-100 text-teal-700 border-teal-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-orange-100 text-orange-700 border-orange-200",
  CONVERTED: "bg-green-100 text-green-700 border-green-200",
  NOT_INTERESTED: "bg-gray-100 text-gray-700 border-gray-200",
};

const priorityColors = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

const sourceColors = {
  WEBSITE: "bg-indigo-50 text-indigo-700",
  FACEBOOK: "bg-blue-50 text-blue-700",
  INSTAGRAM: "bg-pink-50 text-pink-700",
  GOOGLE: "bg-red-50 text-red-700",
  WHATSAPP: "bg-green-50 text-green-700",
  REFERRAL: "bg-purple-50 text-purple-700",
  CALL: "bg-amber-50 text-amber-700",
  WALK_IN: "bg-teal-50 text-teal-700",
  OTHER: "bg-gray-50 text-gray-700",
};

// Supports both plain strings and populated objects.
const getValue = (value) => {
  if (typeof value === "string") return value;
  return value?.key || value?.name || value?.value || "";
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const formatLabel = (value = "") =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AcademyLeads = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useSelector((state) => state.token);

  // Read filters from the URL with safe defaults.
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 20;

  const status = searchParams.get("status") || "";
  const source = searchParams.get("source") || "";
  const date = searchParams.get("date") || "";
  const isToday = date === "today";

  const [leads, setLeads] = useState([]);
  const [allStatus, setAllStatus] = useState([]);
  const [todayStatus, setTodayStatus] = useState([]);
  const [allSource, setAllSource] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Update several URL filters in ONE update and reset pagination.
  const updateFilters = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      params.set("page", "1");

      if (!params.get("limit")) {
        params.set("limit", "20");
      }

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  // Single-key helper kept for the dropdowns.
  const updateFilter = (key, value) => updateFilters({ [key]: value });

  const changePage = (newPage) => {
    const totalPages = Math.max(1, pagination.totalPages || 1);

    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));

    if (!params.get("limit")) {
      params.set("limit", String(limit));
    }

    setSearchParams(params);
  };

  const changeLimit = (newLimit) => {
    const params = new URLSearchParams(searchParams);

    params.set("limit", String(newLimit));
    params.set("page", "1");

    
    setSearchParams(params);
  };

  // Fetch status and source counts from the backend.
  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);

    try {
      const response = await axios.get(
        `${agency_url}/crm/leads/getleadstatus`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (!data?.success) {
        throw new Error(
          data?.error || data?.message || "Failed to fetch counts"
        );
      }

      const todayCount = data.todayStatus || {};
      const statusCounts = data.leadStauts || {};
      const sourceCounts = data.leadsource || {};

      setAllStatus(
        Object.entries(statusCounts).map(([key, val]) => ({
          key,
          val: Number(val) || 0,
        }))
      );

      setTodayStatus(
        Object.entries(todayCount).map(([key, val]) => ({
          key,
          val: Number(val) || 0,
        }))
      );

      setAllSource(
        Object.entries(sourceCounts).map(([key, val]) => ({
          key,
          val: Number(val) || 0,
        }))
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch status counts"));
    } finally {
      setStatusLoading(false);
    }
  }, [token]);

  // Fetch paginated and filtered leads.
  const fetchLeads = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      if (status) params.set("status", status);
      if (source) params.set("source", source);
      if (date) params.set("date", date);

      const response = await axios.get(
        `${agency_url}/crm/leads/get?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data?.success === false) {
        throw new Error(data?.message || "Failed to fetch leads");
      }

      const result = data?.data || {};

      setLeads(Array.isArray(result.leads) ? result.leads : []);

      setPagination((previous) => ({
        ...previous,
        ...(result.pagination || {}),
        currentPage: Number(result.pagination?.currentPage ?? page),
        limit: Number(result.pagination?.limit ?? limit),
        totalCount: Number(result.pagination?.totalCount ?? 0),
        totalPages: Math.max(1, Number(result.pagination?.totalPages ?? 1)),
        hasNextPage: result.pagination?.hasNextPage ?? false,
        hasPreviousPage: result.pagination?.hasPreviousPage ?? false,
      }));
    } catch (error) {
      setLeads([]);
      toast.error(getErrorMessage(error, "Failed to fetch leads"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, source, date, token]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Delete lead.
  const handleDelete = async (id) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this lead? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      // Change this URL if your backend uses a different delete route.
      const response = await axios.delete(
        `${agency_url}/crm/leads/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to delete lead");
      }

      toast.success("Lead deleted successfully");

      setLeads((previous) => previous.filter((lead) => lead._id !== id));

      setPagination((previous) => ({
        ...previous,
        totalCount: Math.max(0, previous.totalCount - 1),
      }));

      await fetchStatus();

      if (leads.length === 1 && page > 1) {
        changePage(page - 1);
      } else {
        await fetchLeads();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete lead"));
    } finally {
      setDeletingId(null);
    }
  };

  const hasFilters = Boolean(status || source || date);

  const totalPages = Math.max(1, pagination.totalPages || 1);
  const startItem = pagination.totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, pagination.totalCount);

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter(
    (number) =>
      number === 1 ||
      number === totalPages ||
      (number >= page - 1 && number <= page + 1)
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800 md:text-3xl">
              <span className="rounded-xl bg-indigo-600 p-2 text-white shadow-lg">
                <FiUsers size={24} />
              </span>
              Lead Management
            </h1>

            <p className="ml-12 mt-1 text-sm text-gray-500">
              Manage and track all student leads.
            </p>
          </div>
        </div>

        {/* Status statistics */}
        <div className="mb-6 space-y-5">
          {/* Today's leads by status */}
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Leads by Today
            </h2>

            {statusLoading && todayStatus.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
                Loading status counts...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
                {(todayStatus.length
                  ? todayStatus
                  : ALL_STATUSES.map((key) => ({ key, val: 0 }))
                ).map((item) => {
                  const active = isToday && status === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        active
                          ? updateFilters({ status: "", date: "" })
                          : updateFilters({ status: item.key, date: "today" })
                      }
                      aria-pressed={active}
                      className={`rounded-xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        active ? "ring-2 ring-indigo-400 ring-offset-1" : ""
                      } ${
                        statusColors[item.key] ||
                        "border-gray-100 bg-white text-gray-700"
                      }`}
                    >
                      <p className="text-[10px] font-semibold uppercase opacity-80">
                        {formatLabel(item.key)}
                      </p>
                      <p className="mt-1 text-xl font-bold">{item.val}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* All-time leads by status */}
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Leads by Status
            </h2>

            {statusLoading && allStatus.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
                Loading status counts...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
                {(allStatus.length
                  ? allStatus
                  : ALL_STATUSES.map((key) => ({ key, val: 0 }))
                ).map((item) => {
                  const active = !isToday && status === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        updateFilters({
                          status: active ? "" : item.key,
                          date: "",
                        })
                      }
                      aria-pressed={active}
                      className={`rounded-xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        active ? "ring-2 ring-indigo-400 ring-offset-1" : ""
                      } ${
                        statusColors[item.key] ||
                        "border-gray-100 bg-white text-gray-700"
                      }`}
                    >
                      <p className="text-[10px] font-semibold uppercase opacity-80">
                        {formatLabel(item.key)}
                      </p>
                      <p className="mt-1 text-xl font-bold">{item.val}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Source statistics */}
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Leads by Source
            </h2>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-9">
              {(allSource.length
                ? allSource
                : SOURCE_OPTIONS.map((key) => ({ key, val: 0 }))
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    updateFilter("source", source === item.key ? "" : item.key)
                  }
                  aria-pressed={source === item.key}
                  className={`rounded-xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    source === item.key
                      ? "ring-2 ring-indigo-400 ring-offset-1"
                      : ""
                  } ${sourceColors[item.key] || sourceColors.OTHER}`}
                >
                  <p className="text-[10px] font-semibold uppercase opacity-80">
                    {formatLabel(item.key)}
                  </p>
                  <p className="mt-1 text-xl font-bold">{item.val}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FiFilter className="text-indigo-600" />

            <h2 className="font-semibold text-gray-700">Filters</h2>

            {/* {hasFilters && (

               <Link
                to="/admin/academy/leads?page=1&limit=20"
                onClick={() => setLeads([])}
                className="ml-auto flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
              ><FiX size={14} />  Clear filters </Link>
            
            )} */}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <select
              value={status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              {(allStatus.length
                ? allStatus.map((item) => item.key)
                : ALL_STATUSES
              ).map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>

            <select
              value={source}
              onChange={(event) => updateFilter("source", event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-label="Filter by source"
            >
              <option value="">All Sources</option>
              {(allSource.length
                ? allSource.map((item) => item.key)
                : SOURCE_OPTIONS
              ).map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>

            {/* Today toggle */}
            <button
              type="button"
              onClick={() => updateFilters({ date: isToday ? "" : "today" })}
              aria-pressed={isToday}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                isToday
                  ? "border-indigo-300 bg-indigo-600 text-white shadow-sm"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {isToday ? "Today only" : "Show today's leads"}
              {isToday && <FiX size={14} />}
            </button>

            <select
              value={limit}
              onChange={(event) => changeLimit(Number(event.target.value))}
              className="min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-label="Results per page"
            >
              {[10, 20, 50, 100].map((number) => (
                <option key={number} value={number}>
                  {number} / page
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Leads table */}
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                <tr>
                  {[
                    "#",
                    "Name",
                    "Contact",
                    "Location",
                    "Source",
                    "Status",
                    "Priority",
                    "Created",
                    "Actions",
                  ].map((heading, index) => (
                    <th
                      key={heading}
                      className={`whitespace-nowrap px-4 py-3 font-semibold text-gray-700 ${
                        index === 8 ? "text-center" : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FiRefreshCw
                          className="animate-spin text-indigo-600"
                          size={28}
                        />
                        <p className="text-sm text-gray-500">Loading leads...</p>
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FiUsers size={40} className="text-gray-300" />
                        <p className="font-medium text-gray-500">
                          No leads found
                        </p>
                        <p className="text-xs text-gray-400">
                          Try changing your filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, index) => {
                    const leadStatus = getValue(lead.status);
                    const leadSource = getValue(lead.source);
                    const priority = getValue(lead.priority);

                    return (
                      <tr
                        key={lead._id}
                        className="transition-colors hover:bg-indigo-50/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                          {(page - 1) * limit + index + 1}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow">
                              {lead.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800">
                                {lead.name || "Unnamed"}
                              </p>

                              {lead.converted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600">
                                  <FiUserCheck size={10} />
                                  Converted
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-700">
                              <FiPhone
                                size={12}
                                className="shrink-0 text-gray-400"
                              />
                              {lead.phone || "-"}
                            </p>

                            {lead.email && (
                              <p className="flex max-w-[180px] items-center gap-1.5 truncate text-xs text-gray-500">
                                <FiMail
                                  size={12}
                                  className="shrink-0 text-gray-400"
                                />
                                {lead.email}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="flex items-center gap-1.5 text-xs text-gray-700">
                            <FiMapPin
                              size={12}
                              className="shrink-0 text-gray-400"
                            />
                            {[lead.city, lead.state]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                              sourceColors[leadSource] || sourceColors.OTHER
                            }`}
                          >
                            {formatLabel(leadSource) || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                              statusColors[leadStatus] || statusColors.NEW
                            }`}
                          >
                            {formatLabel(leadStatus) || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-bold ${
                              priorityColors[priority] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatLabel(priority) || "-"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                          {formatDate(lead.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/academy/leads/${lead._id}`)
                              }
                              className="rounded-md p-1.5 text-indigo-600 transition hover:bg-indigo-50"
                              title="View"
                              aria-label={`View ${lead.name || "lead"}`}
                            >
                              <GrFormView size={25} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row">
            <p className="text-center text-sm text-gray-600 sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-800">{startItem}</span>{" "}
              to{" "}
              <span className="font-semibold text-gray-800">{endItem}</span> of{" "}
              <span className="font-semibold text-gray-800">
                {pagination.totalCount}
              </span>{" "}
              leads
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => changePage(1)}
                className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="First page"
                aria-label="First page"
              >
                <FiChevronsLeft size={16} />
              </button>

              <button
                type="button"
                disabled={!pagination.hasPreviousPage || loading}
                onClick={() => changePage(page - 1)}
                className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Previous page"
                aria-label="Previous page"
              >
                <FiChevronLeft size={16} />
              </button>

              {pageNumbers.map((number, index) => (
                <React.Fragment key={number}>
                  {index > 0 && pageNumbers[index - 1] !== number - 1 && (
                    <span className="px-1 text-gray-400">...</span>
                  )}

                  <button
                    type="button"
                    onClick={() => changePage(number)}
                    disabled={loading}
                    aria-current={page === number ? "page" : undefined}
                    className={`h-9 min-w-[36px] rounded-md px-2 text-sm font-semibold transition ${
                      page === number
                        ? "bg-indigo-600 text-white shadow-md"
                        : "border border-gray-300 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {number}
                  </button>
                </React.Fragment>
              ))}

              <button
                type="button"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => changePage(page + 1)}
                className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Next page"
                aria-label="Next page"
              >
                <FiChevronRight size={16} />
              </button>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => changePage(totalPages)}
                className="rounded-md border border-gray-300 p-2 text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Last page"
                aria-label="Last page"
              >
                <FiChevronsRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AcademyLeads;