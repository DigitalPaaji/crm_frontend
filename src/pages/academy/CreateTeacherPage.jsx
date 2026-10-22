import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiBriefcase,
  FiBookOpen,
  FiFileText,
  FiAward,
  FiClock,
  FiArrowLeft,
  FiSave,
  FiLoader,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { agency_url } from "../../components/utlis";
import { useSelector } from "react-redux";


const BRAND = "#0D2B45";

const CreateTeacherPage = () => {
  const navigate = useNavigate();

const { token } = useSelector((state) => state.token);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    designation: "",
    specialization: "",
    bio: "",
    qualification: "",
    experience: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullname.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Full name required",
        text: "Please enter teacher's full name.",
      });
    }

    if (!formData.email.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter teacher's email.",
      });
    }

    if (!formData.password) {
      return Swal.fire({
        icon: "warning",
        title: "Password required",
        text: "Please enter a password.",
      });
    }

    if (formData.password.length < 6) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid password",
        text: "Password must be at least 6 characters.",
      });
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${agency_url}/crm/teacher/create`,
        {
          fullname: formData.fullname.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          designation: formData.designation.trim(),
          specialization: formData.specialization.trim(),
          bio: formData.bio.trim(),
          qualification: formData.qualification.trim(),
          experience: formData.experience
            ? Number(formData.experience)
            : 0,
        },
         {
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      if (response.data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Teacher Created",
          text:
            response.data?.message ||
            "Teacher has been created successfully.",
          timer: 1600,
          showConfirmButton: false,
        });

        navigate("/admin/academy/teachers");
      } else {
        Swal.fire({
          icon: "error",
          title: "Creation failed",
          text:
            response.data?.message ||
            "Unable to create teacher.",
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Creation failed",
        text:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0D2B45] focus:bg-white focus:ring-2 focus:ring-[#0D2B45]/10";

  const labelClass =
    "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <section className="relative   bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: BRAND }}
      />

      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "#3a5a7a" }}
      />

      <div className="relative mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
                style={{ background: BRAND }}
              >
                <FiUser size={16} />
              </span>

              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: BRAND }}
              >
                Admin
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create Teacher
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add a new teacher to your platform.
            </p>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/admin/academy/teachers")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-900"
          >
            <FiArrowLeft size={16} />
            Back to Teachers
          </button>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-white/60 bg-white/50 shadow-[0_8px_32px_rgba(13,43,69,0.12)] backdrop-blur-2xl"
        >

          {/* Card Header */}
          <div className="border-b border-slate-200/70 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: BRAND }}
              >
                <FiUser size={18} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Teacher Information
                </h2>

                <p className="text-xs text-slate-500">
                  Enter the teacher's account and professional details.
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Full Name */}
              <div>
                <label className={labelClass}>
                  Full Name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>
                  Email <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="teacher@example.com"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>
                  Phone
                </label>

                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Designation */}
              <div>
                <label className={labelClass}>
                  Designation
                </label>

                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Teacher"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className={labelClass}>
                  Specialization
                </label>

                <div className="relative">
                  <FiBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Qualification */}
              <div>
                <label className={labelClass}>
                  Qualification
                </label>

                <div className="relative">
                  <FiAward className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. M.Sc, B.Ed"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className={labelClass}>
                  Experience
                </label>

                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="number"
                    name="experience"
                    min="0"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Years of experience"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

           
              <div className="md:col-span-2">
                <label className={labelClass}>
                  Bio
                </label>

                <div className="relative">
                  <FiFileText className="absolute left-3 top-3.5 text-slate-400" />

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Write a short biography..."
                    className={`${inputClass} resize-none pl-10`}
                  />
                </div>
              </div>

            </div>
          </div>

          
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 bg-white/30 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">

            <button
              type="button"
              onClick={() => navigate("/admin/teacher")}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiArrowLeft size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: BRAND }}
            >
              {loading ? (
                <>
                  <FiLoader
                    size={17}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <FiSave size={17} />
                  Create Teacher
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateTeacherPage;

