import React, { useEffect, useState } from 'react';
import myLogo from "../assets/logo.webp";
import { base_url } from '../components/utlis';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [activeRole, setActiveRole] = useState('student');
const navigation = useNavigate()
const roles = [
  {
    id: 'admin',
    title: 'Super Admin',
    description: 'System management, security controls, and global configurations.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 'emp',
    title: 'Employee',
    description: 'Staff portal for daily operations and task management.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'student',
    title: 'Student',
    description: 'Access courses, grades, and academic resources.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7" />
      </svg>
    )
  },
  {
    id: 'agency',
    title: 'Agency',
    description: 'Partner portal for managing client accounts and applications.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  }
];


const handelLogin = async(e)=>{
  e.preventDefault();
 try {
   const response = await fetch(`${base_url}/auth/${activeRole}/login`,{
    method:"POST",
      headers: {
    "Content-Type": "application/json",
  },
    body: JSON.stringify({
email,password
    })
   })
  const data = await response.json()

  if(data.success){
     localStorage.setItem("token",data.token)
toast.success(data.message)
  window.location.href="/"
}else{
    toast.error(data.message)

  }
 } catch (error) {

  toast.error(error.response.data.message)
 }




}



  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-screen bg-white">
      
      {/* Left Side: Role Selection (Takes up 2 columns) */}
      <div className="col-span-2 bg-gray-50 flex flex-col justify-center items-center p-8 lg:p-16 border-r border-gray-200">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500 mb-10 text-lg">Please select your portal to continue.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`text-left flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 ${
                  activeRole === role.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-md transform -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className={`mb-4 p-3 rounded-full inline-block ${
                  activeRole === role.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {role.icon}
                </div>
                <h2 className={`text-xl font-semibold mb-2 ${
                  activeRole === role.id ? 'text-indigo-900' : 'text-gray-800'
                }`}>
                  {role.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {role.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Login Form (Takes up 1 column) */}
      <div className="col-span-1 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img src={myLogo} alt="App Logo" className="h-16 object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            <span className="capitalize">{activeRole.replace('superadmin', 'Super Admin')}</span> Login
          </h2>

          {/* Form Inputs */}
          <form className="space-y-5" onSubmit={handelLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all mt-4"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;