import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiBookOpen,
  FiMapPin,
  FiGlobe,
  FiBriefcase,
  FiTarget,
  FiTag,
  FiActivity,
  FiAlertTriangle,
  FiFileText,
  FiCheckCircle,
  FiSave,
  FiX,
  FiChevronDown,
  FiUserPlus,
  FiCalendar,
  FiUsers,
  FiHome,
  FiUpload,
  FiDownload,
  FiFile,
} from "react-icons/fi";

import { toast } from "react-toastify";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdEmojiPeople } from "react-icons/md";
import { agency_url } from "../../components/utlis";
import { useSelector } from "react-redux";

/* ============================================================
   INPUT FIELD
============================================================ */

const InputField = ({
  label,
  name,
  icon: Icon,
  type = "text",
  placeholder,
  required = false,
  formData,
  errors,
  handleChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}

        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Icon size={18} />
        </span>

        <input
          type={type}
          name={name}
          value={formData[name] ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm
            focus:outline-none focus:ring-2 transition-all duration-200
            ${
              errors[name]
                ? "border-red-400 focus:ring-red-300 bg-red-50"
                : "border-gray-300 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
            }
          `}
        />
      </div>

      {errors[name] && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <FiAlertTriangle size={12} />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

/* ============================================================
   SELECT FIELD
============================================================ */

const SelectField = ({
  label,
  name,
  icon: Icon,
  options,
  formData,
  handleChange,
  required = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}

        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 z-10">
          <Icon size={18} />
        </span>

        <select
          name={name}
          value={formData[name] ?? ""}
          onChange={handleChange}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300
            bg-white text-sm focus:outline-none focus:ring-2
            focus:ring-indigo-400 focus:border-indigo-400
            appearance-none transition-all duration-200"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt
                ? opt.replace(/_/g, " ")
                : "Select"}
            </option>
          ))}
        </select>

        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
          <FiChevronDown size={16} />
        </span>
      </div>
    </div>
  );
};

/* ============================================================
   INITIAL FORM
============================================================ */

const initialFormData = {
  name: "",

  father: "",
  mother: "",

  dob: "",

  martial: "single",
  gender: "male",

  phone: "",
  guardianphone: "",

  email: "",

  qualification: "",

  address: "",

  course: "",
  interestedCourse: "",

  source: "OTHER",
  status: "NEW",
  priority: "MEDIUM",

  prefeeredmode: "offline",

  notes: "",
 demo:{
assignto:"",
status:"active",
demodate:null
 },
  converted: false,
};


  const interestedCourseOptions = [
    "digital marketing",
    "social media management",
    "video editing",
    "graphic designing",
    "web development",
  ];

  const sourceOptions = [
    "WEBSITE",
    "FACEBOOK",
    "INSTAGRAM",
    "GOOGLE",
    "WHATSAPP",
    "REFERRAL",
    "CALL",
    "WALK_IN",
    "OTHER",
  ];

  const statusOptions = [
        "NEW",
        "COUNSELING",
        "DEMO",
        "DEMODONE",
        "ACTIVE",
        "INACTIVE",
        "CONVERTED",
        "NOT_INTERESTED",
  ];

  const priorityOptions = [
    "LOW",
    "MEDIUM",
    "HIGH",
  ];

  const martialOptions = [
    "single",
    "married",
  ];

  const genderOptions = [
    "male",
    "female",
  ];

  const preferredModeOptions = [
    "online",
    "offline",
  ];


const CreateLeadCompo = () => {
  const [formData, setFormData] = useState(initialFormData);
   const { token } = useSelector((state) => state.token);
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
 const  [teachers,setTeachers]=useState([])
  const fileInputRef = useRef(null);





const fetchTeachers = async ()=>{
  try {
const response = await axios.get(`${agency_url}/crm/leads/getallteachers`,{
            headers: {
      Authorization: `Bearer ${token}`,
    }})
const data = await response.data
setTeachers(data.teachers)

    
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
}

useEffect(()=>{
  fetchTeachers()
},[])

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };



  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }  else if (!/^\+?\d{10,12}$/.test(formData.phone.trim())) {
       newErrors.phone =
    "Enter a valid phone number (10-12 digits, optional +)";
}

  
    

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };






  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors");
      return;
    }
     const submitData = formData;
  if(formData.status =="DEMO" ){
  if(!formData?.demo?.assignto || !formData?.demo?.demodate){

    toast.error("Select Teacher and Demo Date")
 return 

  }
 }else{
  submitData.demo=null
 }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${agency_url}/crm/leads/create`,
        submitData,{
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      const data = response.data;

      toast.success(
        data.message || "Lead created successfully"
      );

      setFormData({
        ...initialFormData,
      });

      setErrors({});
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to create lead"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     RESET
  ============================================================ */

  const handleReset = () => {
    setFormData({
      ...initialFormData,
    });

    setErrors({});
  };

  /* ============================================================
     DOWNLOAD DEMO EXCEL
  ============================================================ */

  const handleDownloadDemoExcel = () => {
  
   try {
    const link = document.createElement("a");
    link.href = "/dummy_leads.xlsx";
    link.download = "dummy_leads.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Demo Excel downloaded successfully");
  } catch (error) {
    toast.error("Failed to download demo Excel");
  }
  };

  /* ============================================================
     OPEN FILE SELECTOR
  ============================================================ */

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /* ============================================================
     UPLOAD EXCEL
  ============================================================ */

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (
      extension !== "xls" &&
      extension !== "xlsx"
    ) {
      toast.error(
        "Only XLS and XLSX files are allowed"
      );

      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        "File size must be less than 10 MB"
      );

      e.target.value = "";
      return;
    }

    const uploadData = new FormData();

    uploadData.append("file", file);

    setIsUploading(true);

    try {
      const response = await axios.post(
        `${agency_url}/crm/leads/import-excel`,
        uploadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;

      toast.success(
        `${data.imported || 0} leads imported successfully`
      );

      if (data.failed > 0) {
        toast.warning(
          `${data.failed} rows were not imported`
        );

        console.log(
          "Excel Import Errors:",
          data.errors
        );
      }

    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to upload Excel file"
      );
    } finally {
      setIsUploading(false);

      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  /* ============================================================
     PRIORITY COLORS
  ============================================================ */

  const priorityColor = {
    LOW:
      "bg-green-100 text-green-700 border-green-300",

    MEDIUM:
      "bg-yellow-100 text-yellow-700 border-yellow-300",

    HIGH:
      "bg-red-100 text-red-700 border-red-300",
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className=" bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8 px-4">

      <div className="max-w-5xl mx-auto">

        {/* ======================================================
           HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* LEFT */}

          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">

              <span className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
                <FiUserPlus size={24} />
              </span>

              Create New Lead

            </h1>

            <p className="text-gray-500 mt-1 ml-12">
              Fill in the details below to add a new student lead.
            </p>
          </div>

          {/* ====================================================
             EXCEL ACTIONS
          ==================================================== */}

          <div className="flex flex-wrap items-center gap-2">

            {/* DOWNLOAD DEMO */}

            <button
              type="button"
              onClick={handleDownloadDemoExcel}
              className="flex items-center justify-center gap-2
              px-4 py-2.5 rounded-lg
              bg-white border border-gray-300
              text-gray-700 text-sm font-semibold
              hover:bg-gray-50 hover:border-indigo-300
              transition-all duration-200 shadow-sm"
            >
              <FiDownload size={17} />

              Demo Excel
            </button>

            {/* UPLOAD */}

            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center justify-center gap-2
              px-4 py-2.5 rounded-lg
              bg-green-600 text-white
              text-sm font-semibold
              hover:bg-green-700
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition-all duration-200
              shadow-md shadow-green-100"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>

                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload size={17} />

                  Upload Excel
                </>
              )}
            </button>

            {/* HIDDEN FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleExcelUpload}
              className="hidden"
            />

          </div>
        </div>

        {/* ======================================================
           FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >

          {/* ====================================================
             PERSONAL INFORMATION
          ==================================================== */}

          <div className="p-6 border-b border-gray-100">

            <h2 className="text-lg font-bold text-indigo-700 mb-5 flex items-center gap-2">
              <FiUser size={20} />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              <InputField
                label="Full Name"
                name="name"
                icon={FiUser}
                placeholder="John Doe"
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                required
              />

              <InputField
                label="Father Name"
                name="father"
                icon={FiUser}
                placeholder="Father Name"
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />

              <InputField
                label="Mother Name"
                name="mother"
                icon={FiUser}
                placeholder="Mother Name"
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />

              <InputField
                label="Date of Birth"
                name="dob"
                type="date"
                icon={FiCalendar}
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />

              <SelectField
                label="Marital Status"
                name="martial"
                icon={FiUsers}
                options={martialOptions}
                formData={formData}
                handleChange={handleChange}
              />

              <SelectField
                label="Gender"
                name="gender"
                icon={FiUser}
                options={genderOptions}
                formData={formData}
                handleChange={handleChange}
              />

            </div>
          </div>

          {/* ====================================================
             CONTACT INFORMATION
          ==================================================== */}

          <div className="p-6 border-b border-gray-100 bg-gray-50/50">

            <h2 className="text-lg font-bold text-indigo-700 mb-5 flex items-center gap-2">
              <FiPhone size={20} />
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              <InputField
                label="Phone Number"
                name="phone"
                icon={FiPhone}
                placeholder="9876543210"
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                required
              />

              <InputField
                label="Guardian Phone"
                name="guardianphone"
                icon={FiPhone}
                placeholder="9876543210"
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                
              />

              <InputField
                label="Email Address"
                name="email"
                type="email"
                icon={FiMail}
                placeholder="john@example.com"
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />

            </div>
          </div>

          {/* ====================================================
             ADDRESS
          ==================================================== */}

          <div className="p-6 border-b border-gray-100">

            <h2 className="text-lg font-bold text-indigo-700 mb-5 flex items-center gap-2">
              <FiHome size={20} />
              Address Details
            </h2>

            <div className="grid grid-cols-1 gap-5">

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Address
                </label>

                <div className="relative">

                  <span className="absolute top-3 left-3 text-gray-400">
                    <FiMapPin size={18} />
                  </span>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Enter complete address"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300
                    bg-white text-sm focus:outline-none focus:ring-2
                    focus:ring-indigo-400 focus:border-indigo-400
                    resize-none transition-all duration-200"
                  />

                </div>

              </div>

            </div>
          </div>

          {/* ====================================================
             COURSE
          ==================================================== */}

          <div className="p-6 border-b border-gray-100 bg-gray-50/50">

            <h2 className="text-lg font-bold text-indigo-700 mb-5 flex items-center gap-2">
              <FiBookOpen size={20} />
              Course Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <InputField
                label="Current Course / Qualification"
                name="course"
                icon={FiBriefcase}
                placeholder="12th / Graduation"
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />

              <SelectField
                label="Interested Course"
                name="interestedCourse"
                icon={FiTarget}
                options={[
                  "",
                  ...interestedCourseOptions,
                ]}
                formData={formData}
                handleChange={handleChange}
                
              />

              <SelectField
                label="Preferred Mode"
                name="prefeeredmode"
                icon={FiGlobe}
                options={preferredModeOptions}
                formData={formData}
                handleChange={handleChange}
              />

              <InputField
                label="Qualification"
                name="qualification"
                icon={FiBookOpen}
                placeholder="B.Tech, MBA, 12th..."
                formData={formData}
                errors={errors}
                handleChange={handleChange}
              />

            </div>
          </div>

          {/* ====================================================
             LEAD DETAILS
          ==================================================== */}

          <div className="p-6 border-b border-gray-100">

            <h2 className="text-lg font-bold text-indigo-700 mb-5 flex items-center gap-2">
              <FiTag size={20} />
              Lead Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <SelectField
                label="Source"
                name="source"
                icon={FiGlobe}
                options={sourceOptions}
                formData={formData}
                handleChange={handleChange}
              />

              <SelectField
                label="Status"
                name="status"
                icon={FiActivity}
                options={statusOptions}
                formData={formData}
                handleChange={handleChange}
              />









{formData.status=="DEMO" && 

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
       Assign To

      
          <span className="text-red-500 ml-1">*</span>
      
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 z-10">
          <FaChalkboardTeacher  size={18} />
        </span>

        <select
          name="assignto"
          value={formData?.demo?.assignto}
        
          onChange={(e)=>setFormData(prev=>({...prev,demo:{...prev.demo,assignto:e.target.value}}))}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300
            bg-white text-sm focus:outline-none focus:ring-2
            focus:ring-indigo-400 focus:border-indigo-400
            appearance-none transition-all duration-200"
        >
<option value=""  disabled> ---select Teacher-- </option>

          {teachers.map((opt) => (
            <option key={opt._id} value={opt._id}>
              {opt.fullname} 
            </option>
          ))}
        </select>

        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
          <FiChevronDown size={16} />
        </span>
      </div>
    </div>

}
{formData.status=="DEMO" && 
<div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Select Demo Time

       
          <span className="text-red-500 ml-1">*</span>
     
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <MdEmojiPeople  size={18} />
        </span>

        <input
          type="datetime-local"
          name={"demodate"}
          value={formData.demo.demodate}
          onChange={(e)=>setFormData(prev=>({...prev,demo:{...prev.demo,demodate:e.target.value}}))}
          // onChange={handleChange}
         
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm
            focus:outline-none focus:ring-2 transition-all duration-200
           
              border-gray-300 focus:ring-indigo-400 focus:border-indigo-400 bg-white
          `}
        />
      </div>

     
    </div>

}




              <SelectField
                label="Priority"
                name="priority"
                icon={FiAlertTriangle}
                options={priorityOptions}
                formData={formData}
                handleChange={handleChange}
              />

            </div>

            <div className="mt-5 flex items-center gap-2">

              <span className="text-sm text-gray-500">
                Priority:
              </span>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  priorityColor[formData.priority]
                }`}
              >
                {formData.priority}
              </span>

            </div>

          </div>

          {/* ====================================================
             NOTES
          ==================================================== */}

          <div className="p-6 border-b border-gray-100 bg-gray-50/50">

            <h2 className="text-lg font-bold text-indigo-700 mb-5 flex items-center gap-2">
              <FiFileText size={20} />
              Additional Information
            </h2>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Notes
              </label>

              <div className="relative">

                <span className="absolute top-3 left-3 text-gray-400">
                  <FiFileText size={18} />
                </span>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any additional notes about this lead..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300
                  bg-white text-sm focus:outline-none focus:ring-2
                  focus:ring-indigo-400 focus:border-indigo-400
                  resize-none transition-all duration-200"
                />

              </div>

            </div>

            {/* CONVERTED */}

            <label className="inline-flex items-center gap-3 cursor-pointer group mt-5">

              <div className="relative">

                <input
                  type="checkbox"
                  name="converted"
                  checked={formData.converted}
                  onChange={handleChange}
                  className="sr-only peer"
                />

                <div
                  className="w-11 h-6 bg-gray-300 rounded-full
                  peer peer-checked:bg-green-500
                  transition-colors duration-200"
                />

                <div
                  className="absolute top-0.5 left-0.5 w-5 h-5
                  bg-white rounded-full shadow
                  peer-checked:translate-x-5
                  transition-transform duration-200"
                />

              </div>

              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Mark as Converted
              </span>

              {formData.converted && (
                <FiCheckCircle
                  className="text-green-500"
                  size={18}
                />
              )}

            </label>

          </div>

          {/* ====================================================
             ACTIONS
          ==================================================== */}

          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-end gap-3">

            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2
              px-6 py-2.5 rounded-lg border border-gray-300
              text-gray-600 text-sm font-semibold
              hover:bg-gray-100 transition-all duration-200"
            >
              <FiX size={16} />
              Reset
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2
              px-8 py-2.5 rounded-lg bg-indigo-600 text-white
              text-sm font-semibold hover:bg-indigo-700
              active:scale-[0.98] shadow-lg shadow-indigo-200
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200"
            >

              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>

                  Saving...
                </>
              ) : (
                <>
                  <FiSave size={16} />
                  Create Lead
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateLeadCompo;