import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Globe2,
  LayersPlus,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { base_url } from "./utlis";

const GetAllClients = ({setCreatClientToggle}) => {
  const { token } = useSelector((state) => state.token);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchAllClients = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${base_url}/client/getall`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch clients");
      }

      setClients(Array.isArray(data.clients) ? data.clients : []);
    } catch (error) {
      const message = error.message || "Unable to fetch clients";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllClients();
  }, [fetchAllClients]);

  const updateClient = async (clientId, field, value) => {
    const previousClients = clients;

    // Optimistic update
    setClients((currentClients) =>
      currentClients.map((client) =>
        client._id === clientId
          ? {
              ...client,
              [field]: value,
            }
          : client
      )
    );

    try {
      setUpdatingId(`${clientId}-${field}`);

      /*
        Change this API route according to your backend.

        Example:
        PATCH /client/update/:id

        Body:
        {
          active: true
        }

        or:
        {
          website: false
        }

        or:
        {
          subUserCount: 5
        }
      */

      const response = await fetch(`${base_url}/client/update/${clientId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update client");
      }

      if (data.client) {
        setClients((currentClients) =>
          currentClients.map((client) =>
            client._id === clientId ? data.client : client
          )
        );
      }

      toast.success(data.message || "Client updated successfully");
    } catch (error) {
      // Rollback optimistic update
      setClients(previousClients);

      toast.error(error.message || "Unable to update client");
    } finally {
      setUpdatingId("");
    }
  };

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return clients;

    return clients.filter((client) => {
      return (
        client.ownername?.toLowerCase().includes(query) ||
        client.agencyname?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query)
      );
    });
  }, [clients, search]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getValidityStatus = (validity) => {
    if (!validity) {
      return {
        label: "No validity",
        className: "bg-slate-100 text-slate-600",
      };
    }

    const today = new Date();
    const validityDate = new Date(validity);

    today.setHours(0, 0, 0, 0);
    validityDate.setHours(0, 0, 0, 0);

    const difference = validityDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        label: "Expired",
        className: "bg-red-50 text-red-700",
      };
    }

    if (daysLeft <= 7) {
      return {
        label: `${daysLeft} days left`,
        className: "bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "Active plan",
      className: "bg-emerald-50 text-emerald-700",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Clients
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage client access, website status and sub-users.
            </p>
          </div>
<div>
          <button
            type="button"
            onClick={fetchAllClients}
            disabled={loading}
            className="inline-flex h-10 mx-5 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={()=>setCreatClientToggle(true)}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LayersPlus
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Create
          </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Building2 size={20} />}
            label="Total Clients"
            value={clients.length}
          />

          <StatCard
            icon={<Users size={20} />}
            label="Active Clients"
            value={clients.filter((client) => client.active).length}
          />

          <StatCard
            icon={<Globe2 size={20} />}
            label="Website Enabled"
            value={clients.filter((client) => client.website).length}
          />
        </div>

        {/* Table container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Search */}
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">
                All clients
              </h2>

              <p className="text-sm text-slate-500">
                {filteredClients.length} client
                {filteredClients.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search client..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3">
              <Loader2 size={30} className="animate-spin text-blue-600" />

              <p className="text-sm text-slate-500">
                Loading clients...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
              <p className="font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchAllClients}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Building2 size={22} />
              </div>

              <h3 className="font-medium text-slate-800">
                No clients found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or add a new client.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <TableHeading>Client</TableHeading>
                    <TableHeading>Contact</TableHeading>
                    <TableHeading>Validity</TableHeading>
                    <TableHeading>Sub-users</TableHeading>
                    <TableHeading>Website</TableHeading>
                    <TableHeading>Account status</TableHeading>
                    <TableHeading>Last login</TableHeading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client) => {
                    const validityStatus = getValidityStatus(client.validity);

                    const activeLoading =
                      updatingId === `${client._id}-active`;

                    const websiteLoading =
                      updatingId === `${client._id}-website`;

                    const subUserLoading =
                      updatingId === `${client._id}-subUserCount`;

                    return (
                      <tr
                        key={client._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Client */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {client.logo ? (
                              <img
                                src={client.logo}
                                alt={client.agencyname || "Client"}
                                className="h-11 w-11 rounded-xl border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-semibold uppercase text-blue-700">
                                {client.agencyname?.charAt(0) ||
                                  client.ownername?.charAt(0) ||
                                  "C"}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-52 truncate font-semibold text-slate-900">
                                {client.agencyname || "No agency name"}
                              </p>

                              <p className="mt-0.5 max-w-52 truncate text-sm text-slate-500">
                                {client.ownername || "No owner name"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={15} className="shrink-0 text-slate-400" />

                            <span className="max-w-60 truncate">
                              {client.email || "No email"}
                            </span>
                          </div>
                        </td>

                        {/* Validity */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <CalendarDays
                              size={16}
                              className="text-slate-400"
                            />

                            {formatDate(client.validity)}
                          </div>

                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${validityStatus.className}`}
                          >
                            {validityStatus.label}
                          </span>
                        </td>

                        {/* Sub-user count */}
                        <td className="px-5 py-4">
                          <div className="relative w-24">
                            <select
                              value={client.subUserCount ?? 0}
                              disabled={subUserLoading}
                              onChange={(event) =>
                                updateClient(
                                  client._id,
                                  "subUserCount",
                                  Number(event.target.value)
                                )
                              }
                              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {Array.from({ length: 11 }, (_, index) => (
                                <option key={index} value={index}>
                                  {index}
                                </option>
                              ))}
                            </select>

                            {subUserLoading && (
                              <Loader2
                                size={15}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
                              />
                            )}
                          </div>
                        </td>

                        {/* Website toggle */}
                        <td className="px-5 py-4">
                          <Toggle
                            checked={Boolean(client.website)}
                            loading={websiteLoading}
                            label={
                              client.website ? "Enabled" : "Disabled"
                            }
                            onChange={() =>
                              updateClient(
                                client._id,
                                "website",
                                !client.website
                              )
                            }
                          />
                        </td>

                        {/* Active toggle */}
                        <td className="px-5 py-4">
                          <Toggle
                            checked={Boolean(client.active)}
                            loading={activeLoading}
                            label={client.active ? "Active" : "Inactive"}
                            onChange={() =>
                              updateClient(
                                client._id,
                                "active",
                                !client.active
                              )
                            }
                          />
                        </td>

                        {/* Last login */}
                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-600">
                            {client.lastlogin
                              ? formatDate(client.lastlogin)
                              : "Never logged in"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Added {formatDate(client.createdAt)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <p className="text-sm text-slate-500">
          {label}
        </p>

        <p className="text-xl font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
};

const TableHeading = ({ children }) => {
  return (
    <th className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
};

const Toggle = ({
  checked,
  loading,
  label,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={loading}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-slate-300"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span
          className={`absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        >
          {loading && (
            <Loader2
              size={11}
              className="animate-spin text-slate-600"
            />
          )}
        </span>
      </button>

      <span
        className={`text-sm font-medium ${
          checked ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default GetAllClients;