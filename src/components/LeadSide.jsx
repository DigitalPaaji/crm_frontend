import React, { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import { base_url } from "./utlis";

const initialFormData = {
  note: "",
  nextFollowUp: "",
  reminderSent: false,
};

const LeadSide = ({ token, id }) => {
  const [allLeads, setAllLeads] = useState([]);
  const [notesData, setNotesData] = useState(initialFormData);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAllLeads = useCallback(async () => {
    if (!id || !token) return;

    try {
      setFetchLoading(true);

      const response = await fetch(
        `${base_url}/leadclient/followup/get/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch follow-ups");
      }

      const followUps = Array.isArray(data)
        ? data
        : Array.isArray(data.followUps)
          ? data.followUps
          : [];

      setAllLeads(followUps);
    } catch (error) {
      toast.error(error.message || "Unable to fetch follow-ups");
    } finally {
      setFetchLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;

    setNotesData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNotesSubmit = async (event) => {
    event.preventDefault();

    if (!notesData.note.trim()) {
      toast.error("Please enter a follow-up note");
      return;
    }

    if (!notesData.nextFollowUp) {
      toast.error("Please select the next follow-up date");
      return;
    }

    try {
      setSubmitLoading(true);

      const response = await fetch(
        `${base_url}/leadclient/followup/create/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note: notesData.note.trim(),
            nextFollowUp: notesData.nextFollowUp,
            reminderSent: notesData.reminderSent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create follow-up");
      }

      toast.success(data.message || "Follow-up created successfully");

      if (data.followUp) {
        setAllLeads((previous) => [data.followUp, ...previous]);
      } else {
        await fetchAllLeads();
      }

      setNotesData(initialFormData);
    } catch (error) {
      toast.error(error.message || "Unable to create follow-up");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No date";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatDateTime = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

 return (
  <div className="flex h-full min-h-[600px] flex-col bg-slate-50">
    {/* Follow-up history */}
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Follow-up history
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {allLeads.length} follow-up
              {allLeads.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Clock3 size={20} className="text-slate-400" />
        </div>

        <div className="p-5">
          {fetchLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2 size={26} className="animate-spin text-blue-600" />
            </div>
          ) : allLeads.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FileText size={22} />
              </div>

              <h3 className="font-medium text-slate-800">
                No follow-ups added
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add the first follow-up using the form below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allLeads.map((followUp, index) => (
                <div
                  key={followUp._id || index}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          <CalendarDays size={13} />
                          Next: {formatDate(followUp.nextFollowUp)}
                        </span>

                        {followUp.reminderSent && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <Bell size={13} />
                            Reminder enabled
                          </span>
                        )}
                      </div>

                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {followUp.note || "No note added"}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDateTime(followUp.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Add follow-up section at bottom */}
    <form
      onSubmit={handleNotesSubmit}
      className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_25px_rgba(15,23,42,0.08)]"
    >
      <div className="mx-auto max-w-4xl space-y-3">
        <textarea
          name="note"
          rows={3}
          maxLength={2000}
          value={notesData.note}
          onChange={handleInputChange}
          placeholder="Write follow-up note..."
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="date"
              name="nextFollowUp"
              value={notesData.nextFollowUp}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <label className="flex h-11 cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4">
            <span className="flex items-center gap-2 text-sm text-slate-700">
              <Bell size={17} className="text-slate-500" />
              Reminder
            </span>

            <input
              type="checkbox"
              name="reminderSent"
              checked={notesData.reminderSent}
              onChange={handleInputChange}
              className="peer sr-only"
            />

            <div className="relative h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-blue-600">
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <button
            type="submit"
            disabled={submitLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={17} />
                Add follow-up
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  </div>
);
};

export default LeadSide;