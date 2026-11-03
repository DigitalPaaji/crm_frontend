
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { review_url } from "../../components/utlis";
import {
  FiSearch,
  FiUsers,
  FiStar,
  FiMail,
  FiPhone,
  FiCalendar,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";

const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const LIMIT = 20;

const UserReviewPage = () => {
  const { token } = useSelector((state) => state.token);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${review_url}/crm/review/user/get`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            limit: LIMIT,
            search: debouncedSearch.trim(),
          },
          signal,
        }
      );

      const data = response.data;

      setUsers(data.user || []);
      setPagination(
        data.pagination || {
          page: 1,
          totalPages: 1,
          total: 0,
        }
      );
    } catch (err) {
      if (axios.isCancel(err) || err.code === "ERR_CANCELED") return;

      setError(
        err?.response?.data?.message ||
          "Could not load users. Please try again."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchUsers(controller.signal);

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, token]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  const handleRetry = () => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
  };

  const startRecord =
    pagination.total === 0 ? 0 : (page - 1) * LIMIT + 1;

  const endRecord = Math.min(
    page * LIMIT,
    pagination.total
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FiUsers size={21} />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Review Users
              </h1>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Manage customers who have submitted reviews.
            </p>
          </div>

          <button
            onClick={() => {
              const controller = new AbortController();
              fetchUsers(controller.signal);
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {pagination.total || 0}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FiUsers size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Users on Current Page
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {users.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiStar size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Search Header */}
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                All Customers
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                View customer information and review activity.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search name, email or phone..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-50"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-5 flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-6 text-center">
              <FiAlertCircle size={28} className="text-red-500" />

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                onClick={handleRetry}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Table */}
          {!error && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Contact Information
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Reviews
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Joined Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      User ID
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {/* Loading Skeleton */}
                  {loading &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <td key={i} className="px-5 py-5">
                            <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {/* Users */}
                  {!loading &&
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="transition hover:bg-gray-50/80"
                      >
                        {/* Customer */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-base font-bold text-indigo-600">
                              {getInitial(user.name)}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-gray-800">
                                {user.name || "Unknown User"}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                Customer
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FiMail className="shrink-0 text-indigo-500" />
                              {user.email || "No email"}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FiPhone className="shrink-0 text-indigo-500" />
                              {user.phonenumber || "No phone"}
                            </div>
                          </div>
                        </td>

                        {/* Review Count */}
                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                            <FiStar className="fill-amber-400 text-amber-400" />
                            {user.reviewsCount || 0}
                            <span className="text-xs font-medium">
                              Reviews
                            </span>
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiCalendar className="text-gray-400" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-5 py-5">
                          <span
                            className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600"
                            title={user._id}
                          >
                            {user._id?.slice(-8)}
                          </span>
                        </td>
                      </tr>
                    ))}

                  {/* Empty State */}
                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                          <FiUsers size={25} />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-gray-800">
                          No users found
                        </h3>

                        <p className="mt-1 text-xs text-gray-400">
                          {search
                            ? "Try searching with another name, email or phone number."
                            : "No review users have registered yet."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!error && (
            <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-bold text-gray-800">
                  {startRecord}-{endRecord}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-800">
                  {pagination.total || 0}
                </span>{" "}
                users
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft size={16} />
                  Previous
                </button>

                <span className="rounded-lg bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600">
                  {page} / {pagination.totalPages || 1}
                </span>

                <button
                  disabled={
                    page >= pagination.totalPages || loading
                  }
                  onClick={() => setPage((prev) => prev + 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReviewPage;
