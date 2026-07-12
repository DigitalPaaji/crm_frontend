import React, { useEffect, useMemo, useState } from "react";
import { base_url } from "../../components/utlis";
import { useSelector } from "react-redux";
import {
  Eye,
  Loader2,
  X,
  Users,
  Search,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";

const hiddenKeys = [
  "_id",
  "__v",
  "client",
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

const formatHeading = (key) => {
  if (labelMap[key]) return labelMap[key];

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "-";

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "-";
  }

  if (key === "createdAt" || key === "updatedAt" || key === "dob") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
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
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

const SubClientLeadPage = () => {
  const { token } = useSelector((state) => state.subuser);

  const [dateFilter, setDateFilter] = useState("today");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchLeads = async (sort) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${base_url}/leadclient/lead/get?sort=${sort}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setLeads(Array.isArray(data.leads) ? data.leads : []);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.log(error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLeads(dateFilter);
    }
  }, [dateFilter, token]);

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads;

    const searchValue = search.toLowerCase();

    return leads.filter((lead) =>
      Object.values(lead).some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchValue)
      )
    );
  }, [leads, search]);

  const tableColumns = useMemo(() => {
    if (filteredLeads.length === 0) return [];

    const keys = Object.keys(filteredLeads[0]).filter(
      (key) => !hiddenKeys.includes(key)
    );

    const keysWithData = keys.filter((key) =>
      filteredLeads.some((lead) => hasValue(lead[key]))
    );

    return keysWithData.slice(0, 5);
  }, [filteredLeads]);

  

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Users size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-950">
                  Client Leads
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  View and filter your client leads.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-100 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-slate-950">
                {filteredLeads.length}
              </p>
              <p className="text-xs font-medium text-slate-500">Total Leads</p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["today", "week", "month", "year", "all"].map((item) => (
              <button
                key={item}
                onClick={() => setDateFilter(item)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${
                  dateFilter === item
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="animate-spin" size={22} />
                Loading leads...
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center">
              <p className="text-sm font-medium text-slate-500">
                No leads found.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
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

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead, index) => (
                    <tr
                      key={lead._id || index}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {index + 1}
                      </td>

                      {tableColumns.map((key) => (
                        <td
                          key={key}
                          className="px-5 py-4 text-sm font-medium text-slate-700"
                        >
                          {key === "status" ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                              {formatValue(key, lead[key])}
                            </span>
                          ) : (
                            formatValue(key, lead[key])
                          )}
                        </td>
                      ))}

                      <td className="px-5 py-4 text-right">
                        <Link
                        to={`${lead._id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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