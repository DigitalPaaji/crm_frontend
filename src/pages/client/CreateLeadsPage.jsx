import React, { useEffect, useState } from "react";
import { base_url } from "../../components/utlis";
import { useSelector } from "react-redux";
import {
  UserPlus,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const fieldLabels = {
  name: "Full Name",
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

  attachment: "Attachment",
  image: "Image",
  document: "Document",

  customField1: "Custom Field 1",
  customField2: "Custom Field 2",
  customField3: "Custom Field 3",
  customField4: "Custom Field 4",
  customField5: "Custom Field 5",
};

const getInputType = (key) => {
  if (key === "email") return "email";
  if (key === "phone" || key === "alternatePhone" || key === "whatsappNumber")
    return "tel";
  if (key === "age" || key === "quantity" || key === "budget") return "number";
  if (key === "dob") return "date";
  if (key === "website") return "url";
  if (key === "attachment" || key === "image" || key === "document")
    return "file";

  return "text";
};

const CreateLeadsPage = () => {
  const { token } = useSelector((state) => state.token);

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchReq = async () => {
    try {
      setFetchLoading(true);
      setError("");

      const response = await fetch(`${base_url}/leadclient/get/allow`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch lead fields");
      }

      const visibleFields = Array.isArray(data.fields) ? data.fields : [];
      setFields(visibleFields);

      const defaultForm = {};

      visibleFields.forEach((field) => {
        defaultForm[field.key] = "";
      });

      setFormData(defaultForm);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);
      setError("");
      setMessage("");

      for (const field of fields) {
        if (field.required && !String(formData[field.key] || "").trim()) {
          throw new Error(`${fieldLabels[field.key] || field.key} is required`);
        }
      }

      const response = await fetch(`${base_url}/lead/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create lead");
      }

      setMessage("Lead created successfully");

      const resetData = {};
      fields.forEach((field) => {
        resetData[field.key] = "";
      });
      setFormData(resetData);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderField = (field) => {
    const label = fieldLabels[field.key] || field.key;
    const type = getInputType(field.key);

    if (field.key === "message" || field.key === "note" || field.key === "address" || field.key === "requirement") {
      return (
        <textarea
          value={formData[field.key] || ""}
          onChange={(e) => handleChange(field.key, e.target.value)}
          required={field.required}
          rows={4}
          placeholder={`Enter ${label}`}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
        />
      );
    }

    if (field.key === "gender") {
      return (
        <select
          value={formData[field.key] || ""}
          onChange={(e) => handleChange(field.key, e.target.value)}
          required={field.required}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      );
    }

    if (type === "file") {
      return (
        <input
          type="file"
          required={field.required}
          onChange={(e) => handleChange(field.key, e.target.files?.[0] || "")}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      );
    }

    return (
      <input
        type={type}
        value={formData[field.key] || ""}
        onChange={(e) => handleChange(field.key, e.target.value)}
        required={field.required}
        placeholder={`Enter ${label}`}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
      />
    );
  };

  useEffect(() => {
    if (token) {
      fetchReq();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <UserPlus size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-950">
                Create Lead
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Fill only allowed fields. Required fields are marked with{" "}
                <span className="font-bold text-red-500">*</span>
              </p>
            </div>
          </div>
        </div>

        {fetchLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="animate-spin" size={22} />
              Loading lead form...
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {message && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 size={18} />
                {message}
              </div>
            )}

            {fields.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                No lead fields allowed.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {fields.map((field) => {
                  const label = fieldLabels[field.key] || field.key;

                  const fullWidthFields = [
                    "message",
                    "note",
                    "address",
                    "requirement",
                  ];

                  return (
                    <div
                      key={field.key}
                      className={
                        fullWidthFields.includes(field.key)
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        {label}
                        {field.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </label>

                      {renderField(field)}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={submitLoading || fields.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {submitLoading ? "Saving..." : "Create Lead"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateLeadsPage;