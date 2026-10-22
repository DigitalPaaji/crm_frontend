
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiUser,
  FiUsers,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiBookOpen,
  FiTarget,
  FiFlag,
  FiClock,
  FiUserCheck,
  FiUserPlus,
  FiHeart,
  FiHome,
  FiFileText,
  FiEdit2,
  FiRefreshCw,
  FiCheckCircle,
  FiGlobe,
  FiMonitor,
  FiSmartphone,
  FiAward,
  FiShield,
} from "react-icons/fi";

import { agency_url } from "../../components/utlis";
import { useSelector } from "react-redux";

const statusStyles = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-200",
  COUNSELING: "bg-purple-50 text-purple-700 ring-purple-200",
  DEMO: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  DEMODONE: "bg-teal-50 text-teal-700 ring-teal-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-orange-50 text-orange-700 ring-orange-200",
  CONVERTED: "bg-green-50 text-green-700 ring-green-200",
  NOT_INTERESTED: "bg-gray-100 text-gray-600 ring-gray-200",
};

const priorityStyles = {
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  HIGH: "bg-red-50 text-red-700 ring-red-200",
};

const sourceStyles = {
  WEBSITE: "bg-indigo-50 text-indigo-700",
  FACEBOOK: "bg-blue-50 text-blue-700",
  INSTAGRAM: "bg-pink-50 text-pink-700",
  GOOGLE: "bg-red-50 text-red-700",
  WHATSAPP: "bg-green-50 text-green-700",
  REFERRAL: "bg-purple-50 text-purple-700",
  CALL: "bg-amber-50 text-amber-700",
  WALK_IN: "bg-teal-50 text-teal-700",
  OTHER: "bg-gray-100 text-gray-700",
};

const formatLabel = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value, includeTime = false) => {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : {}),
  });
};

const getInitials = (name = "") => {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "L"
  );
};

const InfoItem = ({
  icon: Icon,
  label,
  value,
  fullWidth = false,
}) => (
  <div
    className={`flex min-w-0 gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 ${
      fullWidth ? "sm:col-span-2" : ""
    }`}
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100">
      <Icon size={18} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value !== null && value !== undefined && value !== ""
          ? value
          : "Not provided"}
      </p>
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="font-bold text-gray-800">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>

    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

const AcademyLeadfullPage = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.token);
  const navigate = useNavigate();

  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) {
      toast.error("Lead ID is missing");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(
        `${agency_url}/crm/leads/get/${id}`,{
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      const data = response.data;

      // Supports { lead: {...} }, { data: { lead: {...} } }
      // and { data: {...leadFields} } response structures.
      const lead =
        data?.lead ??
        data?.data?.lead ??
        data?.data;

      if (
        !lead ||
        typeof lead !== "object" ||
        Array.isArray(lead) ||
        !lead._id
      ) {
        throw new Error(data?.message || "Lead not found");
      }

      setOriginalData(lead);
    } catch (error) {
      setOriginalData(null);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch lead"
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const lead = originalData;

  const handlePhoneCall = () => {
    if (!lead?.phone) {
      toast.info("Phone number is not available");
      return;
    }

    window.location.href = `tel:${lead.phone}`;
  };

  const handleEmail = () => {
    if (!lead?.email) {
      toast.info("Email address is not available");
      return;
    }

    window.location.href = `mailto:${lead.email}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FiRefreshCw size={25} className="animate-spin" />
          </div>
          <h2 className="mt-4 font-semibold text-gray-800">
            Loading lead details
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Please wait while we fetch the information.
          </p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FiUsers size={26} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-800">
            Lead not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            This lead may have been deleted, or the information could not
            be loaded.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={fetchData}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <FiRefreshCw size={15} />
              Try again
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = lead.status || "NEW";
  const priority = lead.priority || "MEDIUM";
  const source = lead.source || "OTHER";

  const location = [lead.city, lead.state]
    .filter(Boolean)
    .join(", ");

  const createdBy =
    typeof lead.createdBy === "object"
      ? lead.createdBy
      : null;

  const statusClass =
    statusStyles[status] || statusStyles.NEW;

  const priorityClass =
    priorityStyles[priority] || priorityStyles.MEDIUM;

  const sourceClass =
    sourceStyles[source] || sourceStyles.OTHER;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Top navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <FiArrowLeft size={17} />
            Back to Leads
          </button>

          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <FiRefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Profile header */}
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600" />

          <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full border-[24px] border-white/10" />
          <div className="absolute right-32 top-12 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative px-5 pb-6 pt-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl font-extrabold text-indigo-700 shadow-lg">
                  {getInitials(lead.name)}
                </div>

                <div className="min-w-0 sm:pb-1">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-100">
                    Student Lead Profile
                  </p>

                  <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">
                    {lead.name || "Unnamed Lead"}
                  </h1>

                  <p className="mt-1 text-sm text-indigo-100">
                    Lead ID: {lead._id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/admin/leads/${lead._id}`)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                <FiEdit2 size={16} />
                Edit Lead
              </button>
            </div>

            {/* Status badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${statusClass}`}
              >
                <FiTarget size={13} />
                {formatLabel(status)}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${priorityClass}`}
              >
                <FiFlag size={13} />
                {formatLabel(priority)} Priority
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${sourceClass}`}
              >
                <FiGlobe size={13} />
                {formatLabel(source)}
              </span>

              {lead.converted && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-200">
                  <FiCheckCircle size={13} />
                  Converted
                </span>
              )}
            </div>

            {/* Contact buttons */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePhoneCall}
                disabled={!lead.phone}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiPhone size={16} />
                Call Lead
              </button>

              <button
                type="button"
                onClick={handleEmail}
                disabled={!lead.email}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiMail size={16} />
                Send Email
              </button>
            </div>
          </div>
        </section>

        {/* Quick information cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiPhone size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">
                Phone Number
              </p>
              <p className="mt-1 break-all font-bold text-gray-800">
                {lead.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FiBookOpen size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">
                Interested Course
              </p>
              <p className="mt-1 break-words font-bold text-gray-800">
                {lead.interestedCourse || lead.course || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiCalendar size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">
                Lead Created
              </p>
              <p className="mt-1 font-bold text-gray-800">
                {formatDate(lead.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FiMapPin size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">
                Location
              </p>
              <p className="mt-1 break-words font-bold text-gray-800">
                {location || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* Personal information */}
            <SectionCard
              icon={FiUser}
              title="Personal Information"
              subtitle="Basic details of the student lead"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={FiUser}
                  label="Full Name"
                  value={lead.name}
                />

                <InfoItem
                  icon={FiUsers}
                  label="Father's Name"
                  value={lead.father}
                />

                <InfoItem
                  icon={FiUsers}
                  label="Mother's Name"
                  value={lead.mother}
                />

                <InfoItem
                  icon={FiCalendar}
                  label="Date of Birth"
                  value={formatDate(lead.dob)}
                />

                <InfoItem
                  icon={FiUserCheck}
                  label="Gender"
                  value={formatLabel(lead.gender)}
                />

                <InfoItem
                  icon={FiHeart}
                  label="Marital Status"
                  value={formatLabel(lead.marital)}
                />

                <InfoItem
                  icon={FiAward}
                  label="Qualification"
                  value={lead.qualification}
                />

                <InfoItem
                  icon={FiMapPin}
                  label="City"
                  value={lead.city}
                />

                <InfoItem
                  icon={FiMapPin}
                  label="State"
                  value={lead.state}
                />

                <InfoItem
                  icon={FiHome}
                  label="Address"
                  value={lead.address}
                  fullWidth
                />
              </div>
            </SectionCard>

            {/* Contact information */}
            <SectionCard
              icon={FiSmartphone}
              title="Contact Information"
              subtitle="Phone, email and guardian contact"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={FiPhone}
                  label="Primary Phone"
                  value={lead.phone}
                />

                <InfoItem
                  icon={FiPhone}
                  label="Guardian Phone"
                  value={lead.guardianPhone}
                />

                <InfoItem
                  icon={FiMail}
                  label="Email Address"
                  value={lead.email}
                  fullWidth
                />
              </div>
            </SectionCard>

            {/* Course details */}
            <SectionCard
              icon={FiBookOpen}
              title="Course & Admission Details"
              subtitle="Course preferences and demonstration status"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={FiBookOpen}
                  label="Current / Selected Course"
                  value={lead.course}
                />

                <InfoItem
                  icon={FiTarget}
                  label="Interested Course"
                  value={lead.interestedCourse}
                />

                <InfoItem
                  icon={FiMonitor}
                  label="Preferred Learning Mode"
                  value={formatLabel(lead.preferredMode)}
                />

                <InfoItem
                  icon={FiCheckCircle}
                  label="Conversion Status"
                  value={lead.converted ? "Converted" : "Not converted"}
                />

                <InfoItem
                  icon={FiCalendar}
                  label="Demo Details"
                  value={
                    lead.demo && typeof lead.demo === "object"
                      ? JSON.stringify(lead.demo)
                      : lead.demo
                  }
                  fullWidth
                />
              </div>
            </SectionCard>

            {/* Notes */}
            <SectionCard
              icon={FiFileText}
              title="Notes & Remarks"
              subtitle="Additional information about this lead"
            >
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                  {lead.notes || "No notes have been added for this lead."}
                </p>
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <SectionCard
              icon={FiTarget}
              title="Lead Overview"
              subtitle="Current lead tracking information"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Current Status
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${statusClass}`}
                    >
                      {formatLabel(status)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500">
                    Priority
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${priorityClass}`}
                    >
                      {formatLabel(priority)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500">
                    Lead Source
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${sourceClass}`}
                    >
                      {formatLabel(source)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500">
                    Preferred Mode
                  </p>
                  <p className="mt-1 font-semibold capitalize text-gray-800">
                    {lead.preferredMode || "Not specified"}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={FiUserPlus}
              title="Created By"
              subtitle="Staff member who added this lead"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                  {getInitials(createdBy?.name)}
                </div>

                <div className="min-w-0">
                  <p className="break-words font-bold text-gray-800">
                    {createdBy?.name || "Unknown"}
                  </p>
                  <p className="mt-1 break-all text-xs text-gray-500">
                    {createdBy?.email || "Email not available"}
                  </p>
                </div>
              </div>

              {createdBy?._id && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                  <FiShield size={15} className="shrink-0" />
                  <span className="break-all">
                    Staff ID: {createdBy._id}
                  </span>
                </div>
              )}
            </SectionCard>

            <SectionCard
              icon={FiClock}
              title="Activity Timeline"
              subtitle="Record creation and latest update"
            >
              <div className="relative space-y-5 pl-1">
                <div className="absolute bottom-5 left-[9px] top-2 w-px bg-gray-200" />

                <div className="relative flex gap-3">
                  <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-4 ring-white">
                    <FiUserPlus size={11} />
                  </div>

                  <div className="min-w-0 pb-1">
                    <p className="text-sm font-semibold text-gray-800">
                      Lead Created
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(lead.createdAt, true)}
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-3">
                  <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-white">
                    <FiRefreshCw size={11} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      Last Updated
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(lead.updatedAt, true)}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </aside>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>
            Lead ID: <span className="font-medium text-gray-700">{lead._id}</span>
          </p>

          <p>
            Last modified: {formatDate(lead.updatedAt, true)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcademyLeadfullPage;
