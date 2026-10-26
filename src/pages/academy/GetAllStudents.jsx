import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiBookOpen, FiHash, FiMail, FiPhone, FiUser,FiPlus } from 'react-icons/fi'
import { FaCashRegister } from 'react-icons/fa'
import { MdBookOnline } from 'react-icons/md'
import { IoIosCash } from 'react-icons/io'
import Swal from 'sweetalert2'
import { agency_url } from '../../components/utlis'
import { useSelector } from 'react-redux'

const glassSwal = Swal.mixin({
  customClass: {
    popup: "glass-swal-popup",
    confirmButton: "glass-swal-confirm",
    cancelButton: "glass-swal-cancel",
  },
  buttonsStyling: false,
});
const BRAND = "#0D2B45";


const GetAllStudents = () => {

const {id} = useParams()
 const [subjectsLoading, setSubjectsLoading] = useState(true);
   const [allSubject, setAllSubject] = useState([]);
   const [creating, setCreating] = useState(false);
const { token } = useSelector((state) => state.token);


   const navigate = useNavigate()
const [form,setForm] =useState({
     fullname:"",
  email:"",
  password: "",
  phone:"",
  studentId: "",
  subjects: [],
  coursefees:"",
installments :{}


  })

const fetchData= async()=>{
  try {
    const response = await axios.get(`${agency_url}/crm/students/getstudent/${id}`,{
            headers: {
      Authorization: `Bearer ${token}`,
    }})
     const data = await response.data;

   

if(data.success){
  setForm(data.student)
}

  } catch (error) {
    
  }
}

 const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);

      const response = await axios.get(
        `${agency_url}/crm/subject/get`,{
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


useEffect(()=>{
  fetchSubjects()
  fetchData()
},[])



  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



    const handelSubjectadd=(subjid)=>{

const subjects = form.subjects.includes(subjid) ? form.subjects.filter((itm)=>itm !=subjid )  : [...form.subjects,subjid]

setForm(prev=>({...prev,subjects}))

  }




const handelEdit = async(e)=>{
  e.preventDefault();
  try {
       if (!form.fullname.trim()) {
      return glassSwal.fire({
        icon: "warning",
        title: "Full name required",
        text: "Please enter student's full name.",
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
setCreating(true);
  const payload = {
        fullname: form.fullname.trim(),


        phone: form.phone.trim(),
        studentId: form.studentId.trim(),
        coursefees:form.coursefees,
        installments:form.installments,

      
        subjects: form.subjects,
      };

 const response = await axios.put(
        `${agency_url}/crm/students/update-user/${id}`,
        payload,{
            headers: {
      Authorization: `Bearer ${token}`,
    }}
      );

      const data = response.data;

      if (!data?.success) {
        throw new Error(
          data?.message || "Unable to edit student"
        );
      }

      await glassSwal.fire({
        icon: "success",
        title: "Student Edited",
        text: "Student account has been Edited successfully.",
        timer: 1600,
        showConfirmButton: false,
      });

  
navigate("/admin/academy/students")


  } catch (error) {
    glassSwal.fire({
        icon: "error",
        title: "Creation failed",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to Edit student.",
      });
  }
  finally{
    setCreating(false);
  }

}



  return (

   <div className="flex items-center justify-center px-4 py-6">
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

           <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-7">
 
          
           
 
         
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
                 Edit Student
               </h2>
 
               <p className="mt-1 text-sm text-slate-500">
                 Edit a new student account and assign subjects.
               </p>
 
             </div>
 
    {/* onSubmit={handleCreateStudent} */}
             <form   onSubmit={handelEdit}  >
 
               <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
 
                 
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
                       disabled
                       value={form.email}
                       onChange={handleChange}
                       placeholder="student@example.com"
                       className="student-input cursor-not-allowed"
                     />
 
                   </div>
 
                 </div>
 
                 
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
 
                 
                 {/* <div className="sm:col-span-2">
 
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
 
                 </div> */}
 
               
 
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
 
  
       <div>
         <label className="mb-1.5 block text-xs font-medium text-slate-500">
           Payment Date
         </label>
 

 
         <input
           type="date"
           value={form.installments?.registration?.date?.split("T")[0] ?? ""}
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
 
     <div className="mt-4">
       <label className="mb-2 block text-xs font-medium text-slate-500">
         Payment Mode
       </label>
 
       <div className="grid grid-cols-2 gap-3">
    
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
 

       <div>
         <label className="mb-1.5 block text-xs font-medium text-slate-500">
           Payment Date
         </label>
 
         <input
           type="date"
           value={form.installments?.first_installment?.date?.split("T")[0] ?? ""}
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
 
  
     <div className="mt-4">
       <label className="mb-2 block text-xs font-medium text-slate-500">
         Payment Mode
       </label>
 
       <div className="grid grid-cols-2 gap-3">
    
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
 
 
       <div>
         <label className="mb-1.5 block text-xs font-medium text-slate-500">
           Payment Date
         </label>
 
         <input
           type="date"
           value={form.installments?.second_installment?.date?.split("T")[0] ?? ""}
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
 
   
     <div className="mt-4">
       <label className="mb-2 block text-xs font-medium text-slate-500">
         Payment Mode
       </label>
 
       <div className="grid grid-cols-2 gap-3">
        
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
 
       
       <div>
         <label className="mb-1.5 block text-xs font-medium text-slate-500">
           Payment Date
         </label>
 
         <input
           type="date"
           value={form.installments?.third_installment?.date?.split("T")[0] ?? ""}
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
 
    
     <div className="mt-4">
       <label className="mb-2 block text-xs font-medium text-slate-500">
         Payment Mode
       </label>
 
       <div className="grid grid-cols-2 gap-3">
     
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
 
              
 
         <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
 
                 <Link
                  to={"/admin/student"}
                 type="button"

                  
               
                   className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                 >
                   Cancel
                 </Link>
 
                 <button
                   type="submit"
                   disabled={
                
                     subjectsLoading ||
                     allSubject.length === 0
                   }
                   className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                   style={{
                     background: BRAND,
                   }}
                 >
 
                  
 
                     <>
                       <FiPlus size={16} />
 
                       Edit Student
                     </>
 
                 
 
                 </button>
 
               </div>
 
             </form>
 
           </div> 
 
         </div>
  )
}

export default GetAllStudents