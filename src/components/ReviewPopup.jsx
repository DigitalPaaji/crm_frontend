import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { review_url } from "./utlis";

import {
  FiX,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiStar,
  FiCalendar,
  FiTrash2,
  FiPower,
  FiLoader,
  FiMessageSquare,
  FiExternalLink,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const ReviewPopup = ({ id, setSelected }) => {
  const { token } = useSelector((state) => state.token);

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const closePopup = () => {
    setSelected(null);
  };

  // Fetch client details
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${review_url}/crm/review/get/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClient(response.data.client);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load client details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Toggle client status
  const toggleStatus = async () => {
    if (!client) return;

    const action = client.active ? "deactivate" : "activate";

    if (!window.confirm(`Are you sure you want to ${action} this client?`)) {
      return;
    }

    try {
      setActionLoading(true);

      // Replace endpoint with your actual backend route if different.
      const response = await axios.patch(
        `${review_url}/crm/client/status/${id}`,
        { active: !client.active },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setClient((prev) => ({
          ...prev,
          active: !prev.active,
        }));
      }
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to update client status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delete client
  const deleteClient = async () => {
    if (!window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(true);

      // Replace endpoint with your actual backend route if different.
      const response = await axios.delete(
        `${review_url}/crm/client/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        closePopup();
      }
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to delete client."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        onClick={closePopup}
      >
        <div
          className="flex items-center gap-3 rounded-xl bg-white px-8 py-7 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <FiLoader className="animate-spin text-xl text-indigo-600" />
          <span className="text-sm font-medium text-gray-600">
            Loading client details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/45 p-3 sm:p-5"
      onClick={closePopup}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Client Details
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Manage client information and reviews
            </p>
          </div>

          <button
            onClick={closePopup}
            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <FiX size={19} />
          </button>
        </div>

        {error ? (
          <div className="m-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            <FiAlertCircle size={20} />
            {error}
            <button
              onClick={fetchData}
              className="ml-auto font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : client ? (
          <>
            {/* Content */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">

              {/* Client Profile */}
              <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <FiUser size={24} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold capitalize text-gray-900">
                      {client.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {client.businessName}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                    client.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {client.active ? "Active Account" : "Inactive Account"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Total Reviews</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {client.reviews?.length || 0}
                  </h3>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">Average Rating</p>
                  <h3 className="mt-2 flex items-center gap-1 text-2xl font-bold text-gray-900">
                    {client.reviews?.length
                      ? (
                          client.reviews.reduce(
                            (sum, review) => sum + review.rating,
                            0
                          ) / client.reviews.length
                        ).toFixed(1)
                      : "0.0"}
                    <FiStar className="text-amber-400" size={19} />
                  </h3>
                </div>

                <div className="col-span-2 rounded-xl border border-gray-200 p-4 sm:col-span-1">
                  <p className="text-xs text-gray-500">QR Generated</p>
                  <h3 className="mt-2 text-lg font-bold text-gray-900">
                    {client.hasGeneratedQr ? "Yes" : "No"}
                  </h3>
                </div>
              </div>

              {/* Information */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  Contact Information
                </h3>

                <div className="grid gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-800">
                        {client.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiMail className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="break-all text-sm font-medium text-gray-800">
                        {client.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Place ID</p>
                      <p className="break-all text-sm font-medium text-gray-800">
                        {client.placeId || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Created At</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(client.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* QR Details */}
              {client.savedQrUrl && (
                <section className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        QR Code Details
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Expiry: {formatDate(client.expiryDate)}
                      </p>
                    </div>

                    <a
                      href={client.savedQrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                    >
                      View QR <FiExternalLink />
                    </a>
                  </div>
                </section>
              )}

              {/* Reviews */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <FiMessageSquare className="text-indigo-600" />
                    Customer Reviews
                  </h3>

                  <span className="text-xs text-gray-500">
                    {client.reviews?.length || 0} reviews
                  </span>
                </div>

                <div className="space-y-3">
                  {client.reviews?.length > 0 ? (
                    client.reviews.map((review) => (
                      <div
                        key={review._id}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                size={15}
                                className={
                                  star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }
                              />
                            ))}

                            <span className="ml-1 text-xs font-semibold text-gray-700">
                              {review.rating}/5
                            </span>
                          </div>

                          <span className="text-[11px] text-gray-400">
                            {formatDate(review.time)}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-gray-600">
                          {review.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center">
                      <FiMessageSquare className="mx-auto mb-2 text-2xl text-gray-300" />
                      <p className="text-sm text-gray-500">
                        No reviews available yet.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <button
                disabled={actionLoading}
                onClick={deleteClient}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <FiTrash2 />
                Delete Client
              </button>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  onClick={closePopup}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  disabled={actionLoading}
                  onClick={toggleStatus}
                  className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${
                    client.active
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionLoading ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <FiPower />
                  )}

                  {client.active ? "Deactivate Client" : "Activate Client"}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ReviewPopup;
