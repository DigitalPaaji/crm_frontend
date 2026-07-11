import React, { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  X,
  User,
  CalendarDays,
  BadgeCheck,
  Info,
  Mail,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
import { base_url } from "./utlis";

const labelMap = {
  name: "Name",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  alternatePhone: "Alternate Phone",
  whatsappNumber: "WhatsApp Number",
  gender: "Gender",
  age: "Age",
  dob: "Date of Birth",

  companyName: "Company Name",
  designation: "Designation",
  industry: "Industry",
  website: "Website",
  gstNumber: "GST Number",

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
  campaignName: "Campaign Name",
  adName: "Ad Name",
  referralName: "Referral Name",

  preferredContactMethod: "Preferred Contact Method",
  preferredCallTime: "Preferred Call Time",
  message: "Message",
  note: "Note",

  status: "Status",
  active: "Active",
  createdAt: "Created At",
  updatedAt: "Updated At",
};

const hideKeys = ["_id", "__v", "client", "createdBy", "updatedAt"];

const formatHeading = (key) => {
  if (labelMap[key]) return labelMap[key];

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (key === "createdAt" || key === "updatedAt" || key === "dob") {
    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: key === "dob" ? undefined : "2-digit",
        minute: key === "dob" ? undefined : "2-digit",
      });
    }
  }

  return String(value);
};

const getIcon = (key) => {
  if (["name", "firstName", "lastName", "gender", "age", "dob"].includes(key)) {
    return User;
  }

  if (["email"].includes(key)) {
    return Mail;
  }

  if (["phone", "alternatePhone", "whatsappNumber"].includes(key)) {
    return Phone;
  }

  if (["city", "state", "country", "pincode", "address"].includes(key)) {
    return MapPin;
  }

  if (
    ["companyName", "designation", "industry", "website", "gstNumber"].includes(
      key
    )
  ) {
    return Building2;
  }

  if (["createdAt", "updatedAt"].includes(key)) {
    return CalendarDays;
  }

  if (["status", "active"].includes(key)) {
    return BadgeCheck;
  }

  return Info;
};

const ClientLeadSide = ({ id, token, onClose }) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLead = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${base_url}/leadclient/lead/get/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch lead");
      }

      setLead(data.lead);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchLead();
    }
  }, [id, token]);

  const leadFields = useMemo(() => {
    if (!lead) return [];

    return Object.entries(lead).filter(([key, value]) => {
      if (hideKeys.includes(key)) return false;
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;

      return true;
    });
  }, [lead]);

  return (
    <div className="  ">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Lead Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View complete lead information
              </p>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={22} />
              Loading lead...
            </div>
          </div>
        ) : error ? (
          <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : !lead ? (
          <div className="m-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No lead found.
          </div>
        ) : (
          <div className="p-5">
            <div className="mb-5 rounded-3xl bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <User size={26} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    {lead.name ||
                      `${lead.firstName || ""} ${lead.lastName || ""}`.trim() ||
                      "Lead"}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {lead.status && (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold capitalize text-emerald-200">
                        {lead.status}
                      </span>
                    )}

                    {lead.createdAt && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                        {formatValue("createdAt", lead.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {leadFields.map(([key, value]) => {
                const Icon = getIcon(key);

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Icon size={16} />
                      <p className="text-xs font-bold uppercase tracking-wide">
                        {formatHeading(key)}
                      </p>
                    </div>

                    <p className="break-words text-sm font-semibold text-slate-900">
                      {formatValue(key, value)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Lead ID
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                {lead._id}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientLeadSide;