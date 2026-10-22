import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  FiEye,
  FiUser,
  FiMail,
  FiBriefcase,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiDelete,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { useSelector } from "react-redux";
import { agency_url } from "../../components/utlis";

const BRAND = "#0D2B45";

const glassSwal = Swal.mixin({
  customClass: {
    popup: "glass-swal-popup",
    confirmButton: "glass-swal-confirm",
    cancelButton: "glass-swal-cancel",
  },
  buttonsStyling: false,
});

const AdminTeacherPage = () => {
    const { token } = useSelector((state) => state.token);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);




  const fetchTeacher = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${agency_url}/crm/teacher/get-all`,{
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      const data = response.data;

      if (data?.success) {
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error(error);

      glassSwal.fire({
        icon: "error",
        title: "Failed to load",
        text: "Unable to fetch teachers. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, []);

  const handleToggleStatus = async (teacher) => {
    const nextStatus = !teacher.isActive;

    const confirm = await glassSwal.fire({
      icon: "warning",
      title: nextStatus
        ? "Activate teacher?"
        : "Deactivate teacher?",
      text: `${teacher.fullname} will be ${
        nextStatus ? "marked active" : "marked inactive"
      }.`,
      showCancelButton: true,
      confirmButtonText: nextStatus
        ? "Yes, activate"
        : "Yes, deactivate",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      setTogglingId(teacher._id);

      await axios.patch(
        `${agency_url}/crm/teacher/update-status/${teacher._id}`,
        {
          isActive: nextStatus,
        },
        {
            headers: {
      Authorization: `Bearer ${token}`,
    }}

      );

      setTeachers((prev) =>
        prev.map((t) =>
          t._id === teacher._id
            ? { ...t, isActive: nextStatus }
            : t
        )
      );

      glassSwal.fire({
        icon: "success",
        title: "Updated",
        text: `${teacher.fullname} is now ${
          nextStatus ? "active" : "inactive"
        }.`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);

      glassSwal.fire({
        icon: "error",
        title: "Update failed",
        text: "Could not change status. Please try again.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const filteredTeachers = useMemo(() => {
    if (!search.trim()) return teachers;

    const q = search.toLowerCase();

    return teachers.filter(
      (t) =>
        t.fullname?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q)
    );
  }, [teachers, search]);

  const initials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Glass Swal + background styling */}
      <style>{`
        .glass-swal-popup {
          background: rgba(255,255,255,0.55) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 22px !important;
          box-shadow: 0 8px 32px rgba(13,43,69,0.18);
        }

        .glass-swal-confirm {
          background: ${BRAND} !important;
          color: #fff !important;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin: 0 6px;
        }

        .glass-swal-cancel {
          background: rgba(15,23,42,0.08) !important;
          color: #334155 !important;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin: 0 6px;
        }
      `}</style>

      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: BRAND }}
      />

      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "#3a5a7a" }}
      />

      <div className="relative mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
                style={{ background: BRAND }}
              >
                <FiUsers size={16} />
              </span>

              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: BRAND }}
              >
                Admin
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Teachers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage teacher profiles and their active status.
            </p>
          </div>

          {/* Search + Create Button */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-white/50 bg-white/50 py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm backdrop-blur-xl outline-none transition focus:border-slate-300 focus:bg-white/80"
              />
            </div>

            <Link
              to="/admin/academy/teachers/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              style={{ background: BRAND }}
            >
              <FiUser size={17} />
              Create Teacher
            </Link>

          </div>
        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_32px_rgba(13,43,69,0.12)] backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">

              {/* Table Header */}
              <thead>
                <tr className="border-b border-white/50 bg-white/30 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Teacher</th>
                  <th className="px-5 py-3.5">Experience</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-white/40">

                {/* Loading */}
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr
                      key={i}
                      className="animate-pulse"
                    >
                      <td className="px-5 py-4">
                        <div className="h-3 w-4 rounded bg-slate-200/70" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200/70" />

                          <div className="space-y-2">
                            <div className="h-3 w-28 rounded bg-slate-200/70" />
                            <div className="h-3 w-40 rounded bg-slate-200/70" />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-3 w-16 rounded bg-slate-200/70" />
                      </td>

                      <td className="px-5 py-4">
                        <div className="h-6 w-12 rounded-full bg-slate-200/70" />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="ml-auto h-8 w-8 rounded-lg bg-slate-200/70" />
                      </td>
                    </tr>
                  ))
                ) : filteredTeachers.length === 0 ? (

                  /* Empty */
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60">
                          <FiUsers
                            className="text-slate-400"
                            size={20}
                          />
                        </div>

                        <p className="text-sm font-medium text-slate-500">
                          No teachers found
                        </p>

                        <Link
                          to="/admin/teacher/create"
                          className="mt-2 text-sm font-semibold hover:underline"
                          style={{ color: BRAND }}
                        >
                          Create your first teacher
                        </Link>
                      </div>
                    </td>
                  </tr>

                ) : (

                  /* Teachers */
                  filteredTeachers.map((teacher, index) => (
                    <tr
                      key={teacher._id}
                      className="transition-colors hover:bg-white/40"
                    >

                      {/* Number */}
                      <td className="px-5 py-4 text-slate-400">
                        {index + 1}
                      </td>

                      {/* Teacher */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          {teacher.profileImage ? (
                            <img
                              src={teacher.profileImage}
                              alt={teacher.fullname}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-white/70"
                            />
                          ) : (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                              style={{ background: BRAND }}
                            >
                              {initials(teacher.fullname)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {teacher.fullname}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {teacher.email}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-5 py-4 text-slate-600">
                        {teacher.experience
                          ? `${teacher.experience} yrs`
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <button
                        disabled={  togglingId === teacher._id}
                          onClick={() =>
                            handleToggleStatus(teacher)
                          }
                          // disabled={
                          //   togglingId === teacher._id
                          // }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 disabled:opacity-60 ${
                            teacher.isActive
                              ? ""
                              : "bg-slate-300"
                          }`}
                          style={
                            teacher.isActive
                              ? { background: BRAND }
                              : undefined
                          }
                          title={
                            teacher.isActive
                              ? "Active"
                              : "Inactive"
                          }
                        >
                          <span
                            className={`inline-block transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              teacher.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                            style={{
                              height: 18,
                              width: 18,
                            }}
                          />
                        </button>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right space-x-2">
                        <Link
                          to={teacher._id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/60 text-slate-600 shadow-sm ring-1 ring-white/50 transition hover:bg-white/90 hover:text-slate-900"
                          title="View details"
                        >
                            <FiEye size={16} />
                        </Link>

                       {/* {access.includes("deleteteacher") &&  <button
                          // to={teacher._id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/60 text-slate-600 shadow-sm ring-1 ring-white/50 transition hover:bg-white/90 hover:text-slate-900"
                          title="View details"
                        >
                          <FiDelete size={16} />
                            
                        </button>
} */}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AdminTeacherPage;

