
import React, { useEffect, useMemo, useState } from "react";
import {
  Save,
  User,
  Building2,
  MapPin,
  BriefcaseBusiness,
  Megaphone,
  MessageSquareText,
  SlidersHorizontal,
  Loader2,
  CheckCircle2,
  XCircle,
  Fingerprint,
} from "lucide-react";
import { base_url } from "../../components/utlis";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const fieldGroups = [
  {
    title: "Basic Details",
    icon: User,
    fields: [
      { key: "name", label: "Full Name" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "alternatePhone", label: "Alternate Phone" },
      { key: "whatsappNumber", label: "WhatsApp Number" },
      { key: "gender", label: "Gender" },
      { key: "age", label: "Age" },
      { key: "dob", label: "Date of Birth" },
    ],
  },
  {
    title: "Company Details",
    icon: Building2,
    fields: [
      { key: "companyName", label: "Company Name" },
      { key: "designation", label: "Designation" },
      { key: "industry", label: "Industry" },
      { key: "website", label: "Website" },
      { key: "gstNumber", label: "GST Number" },
    ],
  },
  {
    title: "Location Details",
    icon: MapPin,
    fields: [
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
      { key: "pincode", label: "Pincode" },
    ],
  },
  {
    title: "Requirement Details",
    icon: BriefcaseBusiness,
    fields: [
      { key: "service", label: "Service" },
      { key: "product", label: "Product" },
      { key: "requirement", label: "Requirement" },
      { key: "budget", label: "Budget" },
      { key: "timeline", label: "Timeline" },
      { key: "quantity", label: "Quantity" },
      { key: "projectType", label: "Project Type" },
    ],
  },
  {
    title: "Marketing Details",
    icon: Megaphone,
    fields: [
      { key: "source", label: "Source" },
      { key: "leadSource", label: "Lead Source" },
      { key: "campaignName", label: "Campaign Name" },
      { key: "adName", label: "Ad Name" },
      { key: "referralName", label: "Referral Name" },
    ],
  },
  {
    title: "Communication Details",
    icon: MessageSquareText,
    fields: [
      {
        key: "preferredContactMethod",
        label: "Preferred Contact Method",
      },
      {
        key: "preferredCallTime",
        label: "Preferred Call Time",
      },
      { key: "message", label: "Message" },
      { key: "note", label: "Note" },
    ],
  },
  {
    title: "Custom Fields",
    icon: SlidersHorizontal,
    fields: [
      { key: "customField1", label: "Custom Field 1" },
      { key: "customField2", label: "Custom Field 2" },
      { key: "customField3", label: "Custom Field 3" },
      { key: "customField4", label: "Custom Field 4" },
      { key: "customField5", label: "Custom Field 5" },
    ],
  },
];

const allFields = fieldGroups.flatMap((group) => group.fields);

const createDefaultForm = () => {
  const data = {};

  allFields.forEach((field) => {
    data[field.key] = {
      show: false,
      required: false,
      uniqued: false,
    };
  });

  data.name = {
    show: true,
    required: true,
    uniqued: false,
  };

  data.email = {
    show: true,
    required: true,
    uniqued: true,
  };

  data.phone = {
    show: true,
    required: true,
    uniqued: true,
  };

  data.companyName = {
    show: true,
    required: false,
    uniqued: false,
  };

  data.city = {
    show: true,
    required: false,
    uniqued: false,
  };

  data.state = {
    show: true,
    required: false,
    uniqued: false,
  };

  data.service = {
    show: true,
    required: false,
    uniqued: false,
  };

  data.budget = {
    show: true,
    required: false,
    uniqued: false,
  };

  data.message = {
    show: true,
    required: false,
    uniqued: false,
  };

  return data;
};

const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  activeColor = "bg-emerald-600",
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
        checked ? activeColor : "bg-slate-300"
      } ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
};

const LeadRequClientPage = () => {
  const [formData, setFormData] = useState(createDefaultForm);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [message, setMessage] = useState("");
console.log(formData)
  const { token } = useSelector((state) => state.token);

  const stats = useMemo(() => {
    const shown = allFields.filter(
      (field) => formData[field.key]?.show
    ).length;

    const required = allFields.filter(
      (field) => formData[field.key]?.required
    ).length;

    const unique = allFields.filter(
      (field) => formData[field.key]?.uniqued
    ).length;

    return {
      shown,
      required,
      unique,
      total: allFields.length,
    };
  }, [formData]);

  const handleToggle = (fieldKey, type) => {
    setFormData((prev) => {
      const current = prev[fieldKey];

      if (!current) {
        return prev;
      }

      if (type === "show") {
        const newShow = !current.show;

        return {
          ...prev,
          [fieldKey]: {
            ...current,
            show: newShow,

            // When hidden, required and unique are disabled.
            required: newShow ? current.required : false,
            uniqued: newShow ? current.uniqued : false,
          },
        };
      }

      // Required and unique cannot be enabled
      // while the field is hidden.
      if (!current.show) {
        return prev;
      }

      if (type === "required") {
        return {
          ...prev,
          [fieldKey]: {
            ...current,
            required: !current.required,
          },
        };
      }

      if (type === "uniqued") {
        return {
          ...prev,
          [fieldKey]: {
            ...current,
            uniqued: !current.uniqued,
          },
        };
      }

      return prev;
    });
  };

  const fetchLeadRequirement = async () => {
    if (!token) return;

    try {
      setFetchLoading(true);

      const response = await fetch(
        `${base_url}/leadclient/get/requ`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch lead requirement"
        );
      }

      const data = result?.data;

      if (data) {
        const updatedData = createDefaultForm();

        allFields.forEach((field) => {
          if (data[field.key]) {
            updatedData[field.key] = {
              show: Boolean(data[field.key].show),
              required: Boolean(
                data[field.key].required
              ),
              uniqued: Boolean(
                data[field.key].uniqued
              ),
            };
          }
        });

        setFormData(updatedData);
        setActive(data.active !== false);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message ||
          "Failed to fetch lead requirement"
      );
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) {
      setMessage("Authentication token is required");
      toast.error("Authentication token is required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        ...formData,
        active,
      };

      const response = await fetch(
        `${base_url}/leadclient/create/requ`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Failed to save lead requirement"
        );
      }

      setMessage(
        data?.message ||
          "Lead requirement saved successfully"
      );

      toast.success(
        data?.message ||
          "Lead requirement saved successfully"
      );
    } catch (error) {
      const errorMessage =
        error?.message ||
        "Failed to save lead requirement";

      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadRequirement();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <SlidersHorizontal size={14} />
                Client Lead Form Settings
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Lead Requirement Fields
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Control which fields are visible, required,
                and unique in the client lead form.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-100 px-4 py-3">
                <p className="text-xl font-bold text-slate-950">
                  {stats.total}
                </p>

                <p className="text-xs text-slate-500">
                  Total
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                <p className="text-xl font-bold text-emerald-700">
                  {stats.shown}
                </p>

                <p className="text-xs text-emerald-700">
                  Shown
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 px-4 py-3">
                <p className="text-xl font-bold text-orange-700">
                  {stats.required}
                </p>

                <p className="text-xs text-orange-700">
                  Required
                </p>
              </div>

              <div className="rounded-2xl bg-violet-50 px-4 py-3">
                <p className="text-xl font-bold text-violet-700">
                  {stats.unique}
                </p>

                <p className="text-xs text-violet-700">
                  Unique
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setActive((prev) => !prev)
                }
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {active ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <XCircle size={17} />
                )}

                {active
                  ? "Form Active"
                  : "Form Disabled"}
              </button>

              {fetchLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2
                    className="animate-spin"
                    size={16}
                  />

                  Loading...
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || fetchLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <Save size={18} />
              )}

              {loading
                ? "Saving..."
                : "Save Settings"}
            </button>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {message}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {fieldGroups.map((group) => {
            const Icon = group.icon;

            return (
              <div
                key={group.title}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-950">
                        {group.title}
                      </h2>

                      <p className="text-xs text-slate-500">
                        {group.fields.length} fields
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {group.fields.map((field) => {
                    const value =
                      formData[field.key] || {
                        show: false,
                        required: false,
                        uniqued: false,
                      };

                    return (
                      <div
                        key={field.key}
                        className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[minmax(220px,1fr)_auto_auto_auto] md:items-center"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {field.label}
                          </p>

                          <p className="text-xs text-slate-400">
                            Field key: {field.key}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 md:w-36">
                          <span className="text-sm font-medium text-slate-600">
                            Show
                          </span>

                          <Toggle
                            checked={value.show}
                            activeColor="bg-emerald-600"
                            onChange={() =>
                              handleToggle(
                                field.key,
                                "show"
                              )
                            }
                          />
                        </div>

                        <div
                          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 md:w-40 ${
                            value.show
                              ? "bg-orange-50"
                              : "bg-slate-50"
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              value.show
                                ? "text-orange-700"
                                : "text-slate-400"
                            }`}
                          >
                            Required
                          </span>

                          <Toggle
                            checked={value.required}
                            disabled={!value.show}
                            activeColor="bg-orange-500"
                            onChange={() =>
                              handleToggle(
                                field.key,
                                "required"
                              )
                            }
                          />
                        </div>

                        <div
                          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 md:w-40 ${
                            value.show
                              ? "bg-violet-50"
                              : "bg-slate-50"
                          }`}
                        >
                          <span
                            className={`flex items-center gap-2 text-sm font-medium ${
                              value.show
                                ? "text-violet-700"
                                : "text-slate-400"
                            }`}
                          >
                            <Fingerprint size={15} />
                            Unique
                          </span>

                          <Toggle
                            checked={value.uniqued}
                            disabled={!value.show}
                            activeColor="bg-violet-600"
                            onChange={() =>
                              handleToggle(
                                field.key,
                                "uniqued"
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-4 mt-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-600">
              <span>
                <strong className="text-slate-950">
                  {stats.shown}
                </strong>{" "}
                visible,
              </span>

              <span>
                <strong className="text-orange-700">
                  {stats.required}
                </strong>{" "}
                required,
              </span>

              <span>
                <strong className="text-violet-700">
                  {stats.unique}
                </strong>{" "}
                unique.
              </span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || fetchLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <Save size={18} />
              )}

              {loading
                ? "Saving..."
                : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadRequClientPage;

