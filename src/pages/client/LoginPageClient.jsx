"use client";

import React, { useState } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  FileText,
  Headphones,
} from "lucide-react";
import { base_url } from "../../components/utlis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../../store/SubClient";
import { setToken } from "../../store/TokenSlice";

const LoginPageClient = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginClient,setLoginClient]=useState(true)
const navigation = useNavigate()
const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
 try {
   const response = await fetch(`${base_url}/client/login`,{
    method:"POST",
      headers: {
    "Content-Type": "application/json",
  },
    body: JSON.stringify({
email:formData.email,password:formData.password
    })
   })
  const data = await response.json()

  if(data.success){
    dispatch(setToken(data.token))
     toast.success(data.message)
//  navigation("/client");
 location.href="/#/client"
}else{
    toast.error(data.message)

  }
 } catch (error) {

  toast.error(error.response.data.message)
 }
  


  };


const handelSubUserSubmit = async(e)=>{
   e.preventDefault();
  try {
const  response = await fetch(`${base_url}/subclient/login`,{
    method:"POST",
      headers: {
    "Content-Type": "application/json",
  },
    body: JSON.stringify({
      email:formData.email,password:formData.password
    })
   })
  const data = await response.json()
if(data.success){
  toast.success(data.message)
dispatch(addUser(data))
navigation("/sub-client")

}else{
  toast.error(data.message)
}

    
  } catch (error) {
      toast.error(error?.response?.data?.message)

  }
}

  return (
    <div className="min-h-screen w-full bg-[#f5f7fb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-[28px] bg-white border border-slate-200 shadow-[0_25px_70px_rgba(15,23,42,0.10)]">
        
        {/* Left Side */}
        <div className="relative hidden lg:flex flex-col justify-between bg-[#eef3f8] p-10 overflow-hidden">
          <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-blue-200/60 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-slate-300/50 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white p-2 shadow-sm border border-slate-200">
                <img
                  src="/image.png"
                  alt="Digital Paaji Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Digital Paaji
                </h1>
                <p className="text-sm text-slate-500">Client Portal</p>
              </div>
            </div>

            <div className="mt-20">
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight text-slate-900">
                Manage your work <br />
                with clarity.
              </h2>

              <p className="mt-6 max-w-md text-slate-600 leading-7">
                Login to view your projects, reports, requests, meetings,
                updates, and business progress from one simple dashboard.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-blue-700" />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Secure
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <FileText className="h-6 w-6 text-blue-700" />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Reports
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <Headphones className="h-6 w-6 text-blue-700" />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Support
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-6 sm:p-10 lg:p-14">
          <div className="max-w-md mx-auto">
            
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white p-2 shadow-sm border border-slate-200">
                <img
                  src="/image.png"
                  alt="Digital Paaji Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Digital Paaji
                </h1>
                <p className="text-sm text-slate-500">Client Portal</p>
              </div>
            </div>

            <div>
   <div className="w-full rounded-xl bg-slate-100 p-1"> 
    <div className="grid grid-cols-2 gap-1"> 
      <button type="button" onClick={() => setLoginClient(true)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${ loginClient ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900" }`} > Client Login </button> 
      <button type="button" onClick={() => setLoginClient(false)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${ !loginClient ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900" }`} > Sub User Login </button> 
      </div>
      
       </div>
              <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-3 text-slate-500">
                Please login to access your client dashboard.
              </p>
            </div>

            <form onSubmit={(e)=> (loginClient? handleSubmit(e):handelSubUserSubmit(e))} className="mt-9 space-y-5">
              
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="client@example.com"
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-blue-700"
                />
                Remember me
              </label>

<button
  type="submit"
  className={`group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 active:scale-[0.98] ${
    loginClient
      ? "bg-gradient-to-r from-blue-700 to-blue-600 shadow-blue-700/25 hover:from-blue-800 hover:to-blue-700"
      : "bg-gradient-to-r from-violet-700 to-indigo-600 shadow-violet-700/25 hover:from-violet-800 hover:to-indigo-700"
  }`}
>
  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

  <span className="relative flex items-center gap-2">
    {loginClient ? "Login as Client" : "Login as Sub User"}

    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
  </span>
</button>



            </form>

            <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-500 leading-6">
                Only registered Digital Paaji clients can access this portal.
                Contact support if your account is not activated.
              </p>
            </div>

            <p className="mt-8 text-center text-sm text-slate-400">
              © {new Date().getFullYear()} Digital Paaji. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageClient;