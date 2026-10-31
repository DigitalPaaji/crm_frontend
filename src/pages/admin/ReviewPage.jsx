import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FiSearch,
  FiEye,
  FiPhone,
  FiMail,
  FiMapPin,
  FiRefreshCw,
  FiExternalLink,
  FiX,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { FaGoogle, FaQrcode } from "react-icons/fa";
import { review_url } from "../../components/utlis";
import ReviewPopup from "../../components/ReviewPopup";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const getLocation = (qrUrl) => {
  try {
    return new URL(qrUrl).searchParams.get("location") || "—";
  } catch {
    return "—";
  }
};

// Returns `value` only after it has stopped changing for `delay` ms
const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const LIMIT = 20;

const ReviewPage = () => {
  const { token } = useSelector((state) => state.token);

  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchClients = async (signal) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${review_url}/crm/review/getall`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: LIMIT, search: debouncedSearch.trim() },
        signal,
      });
      const data = response.data;
      setClients(data.clients || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      if (axios.isCancel(err)) return; // stale request cancelled, ignore
      setError(err?.response?.data?.message || "Could not load clients. Please try again.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  // Runs when page changes or the debounced search settles
  useEffect(() => {
    const controller = new AbortController();
    fetchClients(controller.signal);
    return () => controller.abort(); // cancel previous in-flight request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // new search always starts from page 1
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Review clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? "client" : "clients"} with review links
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search name, business, phone"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-72"
            />
          </div>
          <button
            onClick={() => fetchClients()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

{selected && <ReviewPopup id={selected} setSelected={setSelected} /> }

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">QR expires</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading &&
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && clients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
                    {debouncedSearch
                      ? "No clients match your search."
                      : "No clients yet. Clients you add will appear here."}
                  </td>
                </tr>
              )}

              {!loading &&
                clients.map((c, index) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-500">
                      {(pagination.page - 1) * LIMIT + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold uppercase text-indigo-700">
                          {c.name?.charAt(0) || "?"}
                        </span>
                        <span className="font-medium capitalize text-slate-900">{c.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-700">{c.businessName || "—"}</td>

                    <td className="px-5 py-4 text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <FiPhone className="text-slate-400" />
                        {c.phone}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          c.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-700">{formatDate(c.expiryDate)}</td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelected(c._id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        <FiEye />
                        View review
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-sm text-slate-600">
          <span>
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    
    </div>
  );
};













export default ReviewPage;