import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  FiEye,
  FiMail,
  FiPhone,
  FiSearch,
  FiUsers,
  FiPlus,
  FiX,
  FiLock,
  FiBookOpen,
  FiHash,
  FiUser,
} from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { FaCashRegister, FaIndianRupeeSign, FaRegEyeSlash, FaRupeeSign } from "react-icons/fa6";
import { MdBookOnline } from "react-icons/md";
import { IoIosCash } from "react-icons/io";
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

const initialForm = {
  fullname: "",
  email: "",
  password: "",
  phone: "",
  studentId: "",
  subjects: [],
};

const StudentsPageadmin = () => {
  const { token } = useSelector((state) => state.token);


  const [searchParams] = useSearchParams();
const fullname = searchParams.get("fullname") ?? "";
  const email = searchParams.get("email") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const creatingquery = searchParams.get("creating")=="true";



  const [students, setStudents] = useState([]);
  const [allSubject, setAllSubject] = useState([]);

  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(creatingquery);
  const [creating, setCreating] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  const [form, setForm] = useState({
     fullname,
  email,
  password: "",
  phone,
  studentId: "",
  subjects: [],
  coursefees:"",
installments :{}


  });



  

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${agency_url}/crm/students/get-all`, {
            headers: {
      Authorization: `Bearer ${token}`,
     }}
      );

      const data = response.data;

      if (data?.success) {
        setStudents(data.students || []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Fetch students error:", error);

      glassSwal.fire({
        icon: "error",
        title: "Failed to load",
        text: "Unable to fetch students. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);

      const response = await axios.get(
        `${agency_url}/crm/subject/get`, {
            headers: {
      Authorization: `Bearer ${token}`,
     }}
      );

      const data = response.data;

      if (data?.success) {
        setAllSubject(data.subjects || []);
      } else {
        setAllSubject([]);
      }
    } catch (error) {
      console.error("Fetch subjects error:", error);

      setAllSubject([]);

      glassSwal.fire({
        icon: "error",
        title: "Subject Error",
        text: "Unable to fetch subjects.",
      });
    } finally {
      setSubjectsLoading(false);
    }
  };

 


  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleSubjectChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );

    setForm((prev) => ({
      ...prev,
      subjects: selectedIds,
    }));
  };



  const removeSubject = (subjectId) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter(
        (id) => id !== subjectId
      ),
    }));
  };

  
  const handleCreateStudent = async (e) => {
    e.preventDefault();

    if (!form.fullname.trim()) {
      return glassSwal.fire({
        icon: "warning",
        title: "Full name required",
        text: "Please enter student's full name.",
      });
    }

    if (!form.email.trim()) {
      return glassSwal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter student's email.",
      });
    }

    if (!form.password) {
      return glassSwal.fire({
        icon: "warning",
        title: "Password required",
        text: "Please enter a password.",
      });
    }

    if (!form.studentId.trim()) {
      return glassSwal.fire({
        icon: "warning",
        title: "Student ID required",
        text: "Please enter student ID.",
      });
    }

    if (!form.subjects.length) {
      return glassSwal.fire({
        icon: "warning",
        title: "Subject required",
        text: "Please select at least one subject.",
      });
    }

    try {
      setCreating(true);

      const payload = {
        fullname: form.fullname.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        studentId: form.studentId.trim(),
  coursefees:form.coursefees,
  installments:form.installments,

      
        subjects: form.subjects,
      };

   

      const response = await axios.post(
        `${agency_url}/crm/students/create`,
        payload, {
            headers: {
      Authorization: `Bearer ${token}`,
     }}
      );

      const data = response.data;

      if (!data?.success) {
        throw new Error(
          data?.message || "Unable to create student"
        );
      }

      await glassSwal.fire({
        icon: "success",
        title: "Student Created",
        text: "Student account has been created successfully.",
        timer: 1600,
        showConfirmButton: false,
      });

      // Reset form
      setForm(initialForm);

      // Close modal
      setShowCreateModal(false);

      // Refresh list
      fetchStudents();
    } catch (error) {
      console.error("Create student error:", error);

      glassSwal.fire({
        icon: "error",
        title: "Creation failed",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to create student.",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (student) => {
    const nextStatus = !student.isActive;

    const confirm = await glassSwal.fire({
      icon: "warning",
      title: nextStatus
        ? "Activate student?"
        : "Deactivate student?",
      text: `${student.fullname} will be ${
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
      setTogglingId(student._id);

      const response = await axios.patch(
        `${agency_url}/crm/students/update-status/${student._id}`,
        {
          isActive: nextStatus,
        },
         {
            headers: {
      Authorization: `Bearer ${token}`,
     }}
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to update status"
        );
      }

      setStudents((prev) =>
        prev.map((item) =>
          item._id === student._id
            ? {
                ...item,
                isActive: nextStatus,
              }
            : item
        )
      );

      glassSwal.fire({
        icon: "success",
        title: "Updated",
        text: `${student.fullname} is now ${
          nextStatus ? "active" : "inactive"
        }.`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Status update error:", error);

      glassSwal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error?.response?.data?.message ||
          "Could not change student status.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;

    const q = search.toLowerCase();

    return students.filter((student) => {
      return (
        student.fullname
          ?.toLowerCase()
          .includes(q) ||
        student.email
          ?.toLowerCase()
          .includes(q) ||
        student.studentId
          ?.toLowerCase()
          .includes(q) ||
        student.phone
          ?.toLowerCase()
          .includes(q)
      );
    });
  }, [students, search]);


  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();


  const openCreateModal = () => {
    setForm(initialForm);
    setShowCreateModal(true);
  };


  const closeCreateModal = () => {
    if (creating) return;

    setForm(initialForm);
    setShowCreateModal(false);
  };

  const handelSubjectadd=(subjid)=>{

const subjects = form.subjects.includes(subjid) ? form.subjects.filter((itm)=>itm !=subjid )  : [...form.subjects,subjid]

setForm(prev=>({...prev,subjects}))

  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      {/*   */}

      <style>{`
        .glass-swal-popup {
          background: rgba(255,255,255,0.75) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 22px !important;
          box-shadow: 0 8px 32px rgba(13,43,69,0.18);
        }

        .glass-swal-confirm {
          background: ${BRAND} !important;
          color: #fff !important;
          padding: 9px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin: 0 6px;
        }

        .glass-swal-cancel {
          background: rgba(15,23,42,0.08) !important;
          color: #334155 !important;
          padding: 9px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin: 0 6px;
        }

        .student-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: rgba(255,255,255,0.8);
          padding: 11px 13px 11px 40px;
          font-size: 14px;
          color: #334155;
          outline: none;
          transition: all 0.2s;
        }

        .student-input:focus {
          border-color: ${BRAND};
          background: white;
          box-shadow: 0 0 0 3px rgba(13,43,69,0.08);
        }

        .subject-select {
          width: 100%;
          min-height: 130px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: rgba(255,255,255,0.8);
          padding: 10px;
          font-size: 14px;
          color: #334155;
          outline: none;
          transition: all 0.2s;
        }

        .subject-select:focus {
          border-color: ${BRAND};
          background: white;
          box-shadow: 0 0 0 3px rgba(13,43,69,0.08);
        }

        .subject-select option {
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 3px;
        }

        .subject-select option:checked {
          background: ${BRAND};
          color: white;
        }
      `}</style>

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: BRAND }}
      />

      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: "#3a5a7a" }}
      />

      <div className="relative mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

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
                Teacher
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage student profiles, subjects and account status.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <div className="relative w-full sm:w-72">

              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search students..."
                className="w-full rounded-xl border border-white/50 bg-white/60 py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm backdrop-blur-xl outline-none transition focus:border-slate-300 focus:bg-white"
              />

            </div>



            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: BRAND }}
            >
              <FiPlus size={17} />
              Add Student
            </button>







          </div>
        </div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

          {/* Total */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Students
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {students.length}
                </p>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: BRAND }}
              >
                <FiUsers />
              </div>

            </div>

          </div>

          {/* Active */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Active Students
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {
                    students.filter(
                      (student) => student.isActive
                    ).length
                  }
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                ✓
              </div>

            </div>

          </div>

          {/* Inactive */}
          <div className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Inactive Students
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-500">
                  {
                    students.filter(
                      (student) => !student.isActive
                    ).length
                  }
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FiUsers />
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/50 shadow-[0_8px_32px_rgba(13,43,69,0.12)] backdrop-blur-2xl">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left text-sm">

              <thead>

                <tr className="border-b border-white/60 bg-white/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">

                  <th className="px-5 py-4">
                    #
                  </th>

                  <th className="px-5 py-4">
                    Student
                  </th>

                  <th className="px-5 py-4">
                    Student ID
                  </th>

                  <th className="px-5 py-4">
                    Phone
                  </th>

                 
<th className="px-5 py-4">
                    Course fee
                  </th>

                  <th className="px-5 py-4">
                    Pending fee
                  </th>
                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-white/50">

                {/* Loading */}
                {loading ? (

                  Array.from({ length: 5 }).map(
                    (_, index) => (

                      <tr
                        key={index}
                        className="animate-pulse"
                      >

                        <td className="px-5 py-5">
                          <div className="h-3 w-4 rounded bg-slate-200" />
                        </td>

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-3">

                            <div className="h-10 w-10 rounded-full bg-slate-200" />

                            <div className="space-y-2">

                              <div className="h-3 w-28 rounded bg-slate-200" />

                              <div className="h-3 w-40 rounded bg-slate-200" />

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-5">
                          <div className="h-3 w-20 rounded bg-slate-200" />
                        </td>

                        <td className="px-5 py-5">
                          <div className="h-3 w-24 rounded bg-slate-200" />
                        </td>

                        <td className="px-5 py-5">
                          <div className="h-6 w-24 rounded bg-slate-200" />
                        </td>

                        <td className="px-5 py-5">
                          <div className="h-6 w-11 rounded-full bg-slate-200" />
                        </td>

                        <td className="px-5 py-5">
                          <div className="ml-auto h-8 w-8 rounded bg-slate-200" />
                        </td>

                      </tr>

                    )
                  )

                ) : filteredStudents.length === 0 ? (

                  /* Empty */
                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >

                      <div className="flex flex-col items-center gap-3">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70">

                          <FiUsers
                            className="text-slate-400"
                            size={23}
                          />

                        </div>

                        <p className="text-sm font-semibold text-slate-600">
                          No students found
                        </p>

                        <p className="text-xs text-slate-400">
                          Try another search or create a new student.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  /* Students */
                  filteredStudents.map(
                    (student, index) => (

                      <tr
                        key={student._id}
                        className="transition-colors hover:bg-white/50"
                      >

                        {/* Number */}
                        <td className="px-5 py-4 text-slate-400">
                          {index + 1}
                        </td>

                        {/* Student */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                              style={{
                                background: BRAND,
                              }}
                            >
                              {initials(
                                student.fullname
                              )}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-800">
                                {student.fullname}
                              </p>

                              <p className="flex items-center gap-1 truncate text-xs text-slate-500">

                                <FiMail size={11} />

                                {student.email}

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Student ID */}
                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">

                            <FiHash size={12} />

                            {student.studentId || "—"}

                          </span>

                        </td>

                        {/* Phone */}
                        <td className="px-5 py-4 text-slate-600">

                          {student.phone ? (

                            <span className="flex items-center gap-2 text-xs">

                              <FiPhone size={13} />

                              {student.phone}

                            </span>

                          ) : (
                            "—"
                          )}

                        </td>

                          <td className="px-5 py-4 text-slate-600">

                          {student.coursefees ? (

                            <span className="flex items-center   text-xs">

                              <FaIndianRupeeSign size={12} />

                              {student.coursefees}

                            </span>

                          ) : (
                            "—"
                          )}

                        </td>



  <td className="px-5 py-4 text-slate-600">

                          {student.coursefees ? (

                            <span className="flex items-center   text-xs">

                              <FaIndianRupeeSign size={12} />

                              {student.coursefees - student.submitedfees}

                            </span>

                          ) : (
                            "—"
                          )}

                        </td>



                        {/* Status */}
                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              handleToggleStatus(
                                student
                              )
                            }
                            disabled={
                              togglingId ===
                              student._id
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 disabled:opacity-50 ${
                              student.isActive
                                ? ""
                                : "bg-slate-300"
                            }`}
                            style={
                              student.isActive
                                ? {
                                    background: BRAND,
                                  }
                                : undefined
                            }
                            title={
                              student.isActive
                                ? "Active"
                                : "Inactive"
                            }
                          >

                            <span
                              className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                student.isActive
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />

                          </button>

                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">

                          <Link
                            to={student._id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/70 text-slate-600 shadow-sm ring-1 ring-white/60 transition hover:bg-white hover:text-slate-900"
                            title="View student"
                          >
                            <FiEye size={16} />
                          </Link>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          CREATE STUDENT MODAL
      ===================================================== */}

      {showCreateModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">

          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-7">

            {/* Close */}
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={creating}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
            >
              <FiX />
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-10">

              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
                style={{
                  background: BRAND,
                }}
              >
                <FiUser size={20} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Create Student
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a new student account and assign subjects.
              </p>

            </div>

            {/* FORM */}
            <form onSubmit={handleCreateStudent}>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Fullname */}
                <div>

                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Full Name
                  </label>

                  <div className="relative">

                    <FiUser
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="fullname"
                      value={form.fullname}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="student-input"
                    />

                  </div>

                </div>

                {/* Student ID */}
                <div>

                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Student ID
                  </label>

                  <div className="relative">

                    <FiHash
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="studentId"
                      value={form.studentId}
                      onChange={handleChange}
                      placeholder="e.g. STU-001"
                      className="student-input"
                    />

                  </div>

                </div>

                {/* Email */}
                <div>

                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Email
                  </label>

                  <div className="relative">

                    <FiMail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="student@example.com"
                      className="student-input"
                    />

                  </div>

                </div>

                {/* Phone */}
                <div>

                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Phone
                  </label>

                  <div className="relative">

                    <FiPhone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="student-input"
                    />

                  </div>

                </div>

                {/* Password */}
                <div className="sm:col-span-2">

                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Password
                  </label>

                  <div className="relative">

                    <FiLock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create login password"
                      className="student-input"
                    />

                  </div>

                </div>

                {/* =================================================
                    SUBJECTS
                ================================================= */}

                <div className="sm:col-span-2">

                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Subjects
                  </label>

                  <div className="relative">

                    <FiBookOpen
                      className="pointer-events-none absolute left-3 top-3 z-10 text-slate-400"
                    />

                    {subjectsLoading ? (

                      <div className="flex min-h-[130px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400">

                        Loading subjects...

                      </div>

                    ) : allSubject.length === 0 ? (

                      <div className="flex min-h-[130px] items-center justify-center rounded-xl border border-red-100 bg-red-50 text-sm text-red-500">

                        No subjects available.

                      </div>

                    ) : (

                   <div className="flex ps-10 flex-wrap items-center gap-2.5">
  {allSubject.map((item) => {
    const isSelected = form.subjects.includes(item._id);

    return (
      <button
        type="button"
        key={item._id}
        onClick={() => handelSubjectadd(item._id)}
        className={`
          group inline-flex items-center gap-2
          rounded-full border px-4 py-2
          text-xs font-semibold
          transition-all duration-200
          ${
            isSelected
              ? "border-green-300 bg-green-50 text-green-700 shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
          }
        `}
      >
        {/* Check / Plus */}
        <span
          className={`
            flex h-4 w-4 items-center justify-center
            rounded-full text-[10px] font-bold
            transition-all
            ${
              isSelected
                ? "bg-green-500 text-white"
                : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
            }
          `}
        >
          {isSelected ? "✓" : "+"}
        </span>

        {item.title}
      </button>
    );
  })}
</div>

                    )}

                  </div>

                 

                </div>


<div className="sm:col-span-2">
   <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Course Fees
                  </label>

                  <div className="relative">

                    <FaCashRegister
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      name="coursefees"
                      value={form.coursefees}
                      onChange={handleChange}
                      placeholder="Enter Cousrse Fees"
                      className="student-input"
                    />

                  </div>


</div>






<div className="sm:col-span-2">
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Registration Fees
  </label>

  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Amount (₹)
        </label>

        <input
          type="number"
          min="0"
          placeholder="Enter amount"
          value={form.installments?.registration?.amount ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                registration: {
                  ...prev.installments?.registration,
                  amount: e.target.value,
                },
              },
            }))
          }
          className="student-input w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Payment Date
        </label>

        <input
          type="date"
          value={form.installments?.registration?.date ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                registration: {
                  ...prev.installments?.registration,
                  date: e.target.value,
                },
              },
            }))
          }
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>

    {/* Payment Mode */}
    <div className="mt-4">
      <label className="mb-2 block text-xs font-medium text-slate-500">
        Payment Mode
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* Online */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                registration: {
                  ...prev.installments?.registration,
                  mode: "online",
                },
              },
            }))
          }
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            form.installments?.registration?.mode === "online"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <MdBookOnline className="text-lg" />
          Online
        </button>

        {/* Offline */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                registration: {
                  ...prev.installments?.registration,
                  mode: "offline",
                },
              },
            }))
          }
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            form.installments?.registration?.mode === "offline"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <IoIosCash className="text-xl" />
          Offline
        </button>
      </div>

      {!form.installments?.registration?.mode && (
        <p className="mt-2 text-xs text-slate-400">
          Select a payment mode
        </p>
      )}
    </div>
  </div>
</div>

<div className="sm:col-span-2">
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    First  Installment
  </label>

  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Amount (₹)
        </label>

        <input
          type="number"
          min="0"
          placeholder="Enter amount"
          value={form.installments?.first_installment?.amount ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                first_installment: {
                  ...prev.installments?.first_installment,
                  amount: e.target.value,
                },
              },
            }))
          }
          className="student-input w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Payment Date
        </label>

        <input
          type="date"
          value={form.installments?.first_installment?.date ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                first_installment: {
                  ...prev.installments?.first_installment,
                  date: e.target.value,
                },
              },
            }))
          }
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>

    {/* Payment Mode */}
    <div className="mt-4">
      <label className="mb-2 block text-xs font-medium text-slate-500">
        Payment Mode
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* Online */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                first_installment: {
                  ...prev.installments?.first_installment,
                  mode: "online",
                },
              },
            }))
          }
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            form.installments?.first_installment?.mode === "online"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <MdBookOnline className="text-lg" />
          Online
        </button>

        {/* Offline */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                first_installment: {
                  ...prev.installments?.first_installment,
                  mode: "offline",
                },
              },
            }))
          }
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            form.installments?.first_installment?.mode === "offline"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <IoIosCash className="text-xl" />
          Offline
        </button>
      </div>

      {!form.installments?.first_installment?.mode && (
        <p className="mt-2 text-xs text-slate-400">
          Select a payment mode
        </p>
      )}
    </div>
  </div>
</div>








<div className="sm:col-span-2">
  <label className="mb-2 block text-sm font-semibold text-slate-700">
   Second  Installment
  </label>

  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Amount (₹)
        </label>

        <input
          type="number"
          min="0"
          placeholder="Enter amount"
          value={form.installments?.second_installment?.amount ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                second_installment: {
                  ...prev.installments?.second_installment,
                  amount: e.target.value,
                },
              },
            }))
          }
          className="student-input w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Payment Date
        </label>

        <input
          type="date"
          value={form.installments?.second_installment?.date ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                second_installment: {
                  ...prev.installments?.second_installment,
                  date: e.target.value,
                },
              },
            }))
          }
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>

    {/* Payment Mode */}
    <div className="mt-4">
      <label className="mb-2 block text-xs font-medium text-slate-500">
        Payment Mode
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* Online */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                second_installment: {
                  ...prev.installments?.second_installment,
                  mode: "online",
                },
              },
            }))
          }
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            form.installments?.second_installment?.mode === "online"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <MdBookOnline className="text-lg" />
          Online
        </button>

        {/* Offline */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                second_installment: {
                  ...prev.installments?.second_installment,
                  mode: "offline",
                },
              },
            }))
          }
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            form.installments?.second_installment?.mode === "offline"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <IoIosCash className="text-xl" />
          Offline
        </button>
      </div>

      {!form.installments?.second_installment?.mode && (
        <p className="mt-2 text-xs text-slate-400">
          Select a payment mode
        </p>
      )}
    </div>
  </div>
</div>






<div className="sm:col-span-2">
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Third Installment
  </label>

  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Amount (₹)
        </label>

        <input
          type="number"
          min="0"
          placeholder="Enter amount"
          value={form.installments?.third_installment?.amount ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                third_installment: {
                  ...prev.installments?.third_installment,
                  amount: e.target.value,
                },
              },
            }))
          }
          className="student-input w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Payment Date
        </label>

        <input
          type="date"
          value={form.installments?.third_installment?.date ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                third_installment: {
                  ...prev.installments?.third_installment,
                  date: e.target.value,
                },
              },
            }))
          }
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>

    {/* Payment Mode */}
    <div className="mt-4">
      <label className="mb-2 block text-xs font-medium text-slate-500">
        Payment Mode
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* Online */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                third_installment: {
                  ...prev.installments?.third_installment,
                  mode: "online",
                },
              },
            }))
          }
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            form.installments?.third_installment?.mode === "online"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <MdBookOnline className="text-lg" />
          Online
        </button>

        {/* Offline */}
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              installments: {
                ...prev.installments,
                third_installment: {
                  ...prev.installments?.third_installment,
                  mode: "offline",
                },
              },
            }))
          }
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
            form.installments?.third_installment?.mode === "offline"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <IoIosCash className="text-xl" />
          Offline
        </button>
      </div>

      {!form.installments?.third_installment?.mode && (
        <p className="mt-2 text-xs text-slate-400">
          Select a payment mode
        </p>
      )}
    </div>
  </div>
</div>


              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    subjectsLoading ||
                    allSubject.length === 0
                  }
                  className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: BRAND,
                  }}
                >

                  {creating ? (

                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                      Creating...
                    </>

                  ) : (

                    <>
                      <FiPlus size={16} />

                      Create Student
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </section>
  );
};

export default StudentsPageadmin;

