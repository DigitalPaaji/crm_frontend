"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Building2,
  CalendarDays,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import { base_url } from "../../components/utlis";
import { Link } from "react-router-dom";

const OnBoardpage = () => {
  const { token } = useSelector((state) => state.token);

  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${base_url}/onboarding/get`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch onboarding clients"
          );
        }

        setClients(Array.isArray(result.clients) ? result.clients : []);
        setTotal(result.total || result.clients?.length || 0);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Onboarding fetch error:", error);
        setError(error.message || "Something went wrong");
        setClients([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [token]);

  const filteredClients = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return clients;

    return clients.filter((client) => {
      return [
        client.businessName,
        client.ownerName,
        client.email,
        client.phone,
        client.city,
      ].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [clients, search]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!token) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-center">
          <p className="font-semibold text-amber-800">
            Authentication token not found
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Please log in again to view onboarding clients.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <UsersRound size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Client Onboarding
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage submitted onboarding forms.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <UsersRound size={18} className="text-orange-500" />

            <span className="text-sm text-slate-500">Total clients</span>

            <span className="font-bold text-slate-900">{total}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Onboarding submissions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredClients.length} client
                {filteredClients.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search client..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center">
              <Loader2
                size={38}
                className="animate-spin text-orange-500"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Loading clients...
              </p>
            </div>
          ) : error ? (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="font-semibold text-red-700">
                Unable to load clients
              </p>

              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <UsersRound size={28} className="text-slate-400" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No clients found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No onboarding submission matches your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Business
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Owner
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      City
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client, index) => (
                    <tr
                      key={client._id}
                      className="group transition hover:bg-orange-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <Building2 size={19} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {client.businessName || "—"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              #{String(index + 1).padStart(2, "0")}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <UserRound
                            size={16}
                            className="text-slate-400"
                          />

                          <span>{client.ownerName || "—"}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <a
                            href={`mailto:${client.email}`}
                            className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-orange-600"
                          >
                            <Mail size={15} className="text-slate-400" />
                            {client.email || "—"}
                          </a>

                          <a
                            href={`tel:${client.phone}`}
                            className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-orange-600"
                          >
                            <Phone size={15} className="text-slate-400" />
                            {client.phone || "—"}
                          </a>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={16} className="text-slate-400" />
                          {client.city || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays
                            size={16}
                            className="text-slate-400"
                          />

                          {formatDate(client.createdAt)}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                        
                          to={`${client._id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default OnBoardpage;