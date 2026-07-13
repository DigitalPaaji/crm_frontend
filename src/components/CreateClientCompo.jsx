"use client";

import React, { useState } from "react";
import {
  User,
  Building2,
  Mail,
  Lock,
  CalendarDays,
  ImagePlus,
  Loader2,
  Save,
} from "lucide-react";
import { base_url } from "./utlis";
import { useSelector } from "react-redux";

const CreateClientCompo = ({setCreatClientToggle}) => {
  const [formData, setFormData] = useState({
    ownername: "",
    agencyname: "",
    email: "",
    password: "",
    validity: "",
  });
const { token } = useSelector((state) => state.token);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      data.append("ownername", formData.ownername);
      data.append("agencyname", formData.agencyname);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("validity", formData.validity);

      if (logo) {
        data.append("logo", logo);
      }

      const response = await fetch(`${base_url}/client/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,  
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create client");
      }

      alert("Client created successfully");

      setFormData({
        ownername: "",
        agencyname: "",
        email: "",
        password: "",
        validity: "",
      });

      setLogo(null);
      setPreview("");
    } catch (error) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#9b6a3a]">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#24160f]">
            Create New Client
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#75675d]">
            Add client owner details, agency information, login credentials and
            account validity.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_20px_70px_rgba(90,64,40,0.12)]"
        >
          <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
            <div className="p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <InputBox
                  label="Owner Name"
                  name="ownername"
                  value={formData.ownername}
                  onChange={handleChange}
                  icon={<User size={18} />}
                  placeholder="Enter owner name"
                />

                <InputBox
                  label="Agency Name"
                  name="agencyname"
                  value={formData.agencyname}
                  onChange={handleChange}
                  icon={<Building2 size={18} />}
                  placeholder="Enter agency name"
                />

                <InputBox
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={<Mail size={18} />}
                  placeholder="client@example.com"
                />

                <InputBox
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock size={18} />}
                  placeholder="Create password"
                />

                <InputBox
                  label="Validity"
                  name="validity"
                  type="date"
                  value={formData.validity}
                  onChange={handleChange}
                  icon={<CalendarDays size={18} />}
                />
              </div>
<div className="flex justify-between items-center mt-8">
              <div className=" flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#42551e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#243a18] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Create Client
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ownername: "",
                      agencyname: "",
                      email: "",
                      password: "",
                      validity: "",
                    });
                    setLogo(null);
                    setPreview("");
                  }}
                  className="rounded-2xl border border-[#e2d5c3] px-6 py-3 text-sm font-semibold text-[#4d392c] transition hover:bg-[#f8f1e8]"
                >
                  Reset Form
                </button>
              </div>
              <div onClick={()=>setCreatClientToggle(false)} className="bg-red-600 text-white font-medium px-4 py-2 rounded-lg cursor-pointer">Cancel</div>
              </div>
            </div>

            <div className="border-t border-[#eadfce] bg-[#fbf7f1] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <label className="mb-3 block text-sm font-semibold text-[#2b1710]">
                Client Logo
              </label>

              <label
                htmlFor="logo"
                className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#d8c4aa] bg-white p-5 text-center transition hover:border-[#9b6a3a] hover:bg-[#fffaf3]"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Logo preview"
                    className="h-36 w-36 rounded-2xl object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f3eadf] text-[#9b6a3a]">
                    <ImagePlus size={34} />
                  </div>
                )}

                <p className="mt-4 text-sm font-semibold text-[#2b1710]">
                  Upload Logo
                </p>
                <p className="mt-1 text-xs text-[#75675d]">
                  PNG, JPG or WEBP allowed
                </p>

                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {logo && (
                <p className="mt-3 truncate text-xs text-[#75675d]">
                  Selected: {logo.name}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputBox = ({
  label,
  name,
  value,
  onChange,
  icon,
  type = "text",
  placeholder = "",
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#2b1710]">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-2xl border border-[#e5d8c7] bg-[#fffdf9] px-4 py-3 transition focus-within:border-[#9b6a3a] focus-within:ring-4 focus-within:ring-[#9b6a3a]/10">
        <span className="text-[#9b6a3a]">{icon}</span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full bg-transparent text-sm text-[#2b1710] outline-none placeholder:text-[#a99b8d]"
        />
      </div>
    </div>
  );
};

export default CreateClientCompo;