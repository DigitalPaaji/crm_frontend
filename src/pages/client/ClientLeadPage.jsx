"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  Eye,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { base_url } from "../../components/utlis";

const hiddenKeys = [
  "_id",
  "__v",
  "client",
  "subclient",
  "createdBy",
  "assignedTo",
  "active",
  "updatedAt",
];

const labelMap = {
  name: "Name",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  alternatePhone: "Alt Phone",
  whatsappNumber: "WhatsApp",
  gender: "Gender",
  age: "Age",
  dob: "DOB",

  companyName: "Company",
  designation: "Designation",
  industry: "Industry",
  website: "Website",
  gstNumber: "GST",

  address: "Address",
  city: "City",
  state: "State",
  country: "Country",
  pincode: "Pincode",

  service: "Service",
  product: "Product",
  requirement: "Requirement",
  budget: "Budget",
  timeline: "Timeline",
  quantity: "Quantity",
  projectType: "Project Type",

  source: "Source",
  leadSource: "Lead Source",
  campaignName: "Campaign",
  adName: "Ad Name",
  referralName: "Referral",

  preferredContactMethod: "Contact Method",
  preferredCallTime: "Call Time",
  message: "Message",
  note: "Note",

  attachment: "Attachment",
  image: "Image",
  document: "Document",

  customField1: "Custom Field 1",
  customField2: "Custom Field 2",
  customField3: "Custom Field 3",
  customField4: "Custom Field 4",
  customField5: "Custom Field 5",

  status: "Status",
  createdAt: "Created At",
};

const dateFilters = ["today", "week", "month", "year", "all"];

const formatHeading = (key) => {
  if (labelMap[key]) {
    return labelMap[key];
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
};

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "-";
  }

  if (
    key === "createdAt" ||
    key === "updatedAt" ||
    key === "dob"
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  return String(value);
};

const hasValue = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string" && value.trim() === "") {
    return false;
  }

  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return false;
  }

  return true;
};

const getStatusClasses = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  const statusClasses = {
    new: "bg-blue-50 text-blue-700 ring-blue-200",
    contacted: "bg-amber-50 text-amber-700 ring-amber-200",
    qualified: "bg-violet-50 text-violet-700 ring-violet-200",
    converted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    lost: "bg-red-50 text-red-700 ring-red-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    pending: "bg-orange-50 text-orange-700 ring-orange-200",
  };

  return (
    statusClasses[normalizedStatus] ||
    "bg-slate-100 text-slate-700 ring-slate-200"
  );
};

const getSearchableValues = (lead) => {
  const normalValues = Object.entries(lead)
    .filter(([, value]) => {
      return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      );
    })
    .map(([, value]) => String(value));

  const subClientValues = [
    lead?.subclient?.name,
    lead?.subclient?.email,
    lead?.subclient ? "Sub User" : "Admin",
  ].filter(Boolean);

  return [...normalValues, ...subClientValues];
};

const SubClientLeadPage = () => {
  const { token } = useSelector((state) => state.token);

  const [dateFilter, setDateFilter] = useState("today");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchLeads = async (sort) => {
    if (!token) {
      setLeads([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${base_url}/leadclient/lead/get?sort=${encodeURIComponent(
          sort
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to fetch leads."
        );
      }

      /*
       * Supports these response formats:
       *
       * 1. Direct array:
       *    [{ ... }]
       *
       * 2. Object:
       *    { success: true, leads: [{ ... }] }
       *
       * 3. Object:
       *    { success: true, lead: [{ ... }] }
       */
      const leadList = Array.isArray(data)
        ? data
        : Array.isArray(data?.leads)
          ? data.leads
          : Array.isArray(data?.lead)
            ? data.lead
            : [];

      setLeads(leadList);
    } catch (fetchError) {
      console.error(fetchError);

      setLeads([]);
      setError(
        fetchError?.message ||
          "Something went wrong while fetching leads."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(dateFilter);
  }, [dateFilter, token]);

  const filteredLeads = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return leads;
    }

    return leads.filter((lead) => {
      return getSearchableValues(lead).some((value) =>
        String(value).toLowerCase().includes(searchValue)
      );
    });
  }, [leads, search]);

  const tableColumns = useMemo(() => {
    if (filteredLeads.length === 0) {
      return [];
    }

    const allKeys = Array.from(
      new Set(
        filteredLeads.flatMap((lead) =>
          Object.keys(lead)
        )
      )
    );

    const keysWithData = allKeys.filter((key) => {
      if (hiddenKeys.includes(key)) {
        return false;
      }

      return filteredLeads.some((lead) =>
        hasValue(lead[key])
      );
    });

    const preferredColumns = [
      "name",
      "phone",
      "email",
      "companyName",
      "service",
      "product",
      "requirement",
      "status",
      "createdAt",
    ];

    const sortedKeys = [
      ...preferredColumns.filter((key) =>
        keysWithData.includes(key)
      ),
      ...keysWithData.filter(
        (key) => !preferredColumns.includes(key)
      ),
    ];

    return sortedKeys.slice(0, 5);
  }, [filteredLeads]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-200">
                <Users size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                  Client Leads
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View, search and manage your client
                  leads.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="min-w-28 rounded-2xl bg-slate-100 px-5 py-3 text-center">
                <p className="text-2xl font-bold text-slate-950">
                  {filteredLeads.length}
                </p>

                <p className="text-xs font-medium text-slate-500">
                  Showing
                </p>
              </div>

              <div className="min-w-28 rounded-2xl bg-slate-950 px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {leads.length}
                </p>

                <p className="text-xs font-medium text-slate-300">
                  Total Leads
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {dateFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDateFilter(item)}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold capitalize transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  dateFilter === item
                    ? "bg-slate-950 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <CalendarDays size={15} />
                {item}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search name, phone, creator..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3">
              <Loader2
                className="animate-spin text-slate-950"
                size={28}
              />

              <p className="text-sm font-medium text-slate-500">
                Loading leads...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Users size={24} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Unable to load leads
              </h2>

              <p className="mt-2 max-w-md text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchLeads(dateFilter)}
                className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Try Again
              </button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Search size={24} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No leads found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "No leads match your search."
                  : `No leads found for ${dateFilter}.`}
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="border-b border-slate-200 bg-slate-100">
                  <tr>
                    <th className="w-16 px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    {tableColumns.map((key) => (
                      <th
                        key={key}
                        className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {formatHeading(key)}
                      </th>
                    ))}

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Created By
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead, index) => (
                    <tr
                      key={lead._id || index}
                      className="group transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {index + 1}
                      </td>

                      {tableColumns.map((key) => (
                        <td
                          key={key}
                          className="max-w-64 px-5 py-4 text-sm font-medium text-slate-700"
                        >
                          {key === "status" ? (
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ring-inset ${getStatusClasses(
                                lead[key]
                              )}`}
                            >
                              {formatValue(
                                key,
                                lead[key]
                              )}
                            </span>
                          ) : key === "name" ? (
                            <div>
                              <p className="font-semibold capitalize text-slate-900">
                                {formatValue(
                                  key,
                                  lead[key]
                                )}
                              </p>

                              {lead.email && (
                                <p className="mt-1 text-xs font-normal text-slate-500">
                                  {lead.email}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="line-clamp-2">
                              {formatValue(
                                key,
                                lead[key]
                              )}
                            </p>
                          )}
                        </td>
                      ))}

                      {/* Created By */}
                      <td className="px-5 py-4">
                        {lead?.subclient?.name ? (
                          <div className="flex min-w-44 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-700 ring-4 ring-blue-50">
                              {lead.subclient.name
                                .trim()
                                .charAt(0) || "S"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold capitalize text-slate-900">
                                {lead.subclient.name}
                              </p>

                              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600">
                                <UserRound size={12} />
                                Sub User
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-w-44 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white ring-4 ring-slate-100">
                              A
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Admin
                              </p>

                              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                                <ShieldCheck size={12} />
                                Administrator
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`${lead._id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
    </div>
  );
};

export default SubClientLeadPage;