import React, { useEffect, useState } from 'react';
import { base_url } from '../../components/utlis';
import { 
  User, Mail, Lock, UserPlus, Eye, EyeOff, Wand2, 
  CheckCircle2, XCircle, MoreHorizontal, Calendar, 
  Shield, Plus, ArrowLeft, 
  Power,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const AgencyPage = () => {
  const [newUser, setNewUser] = useState({
    email: "", password: "", name: ""
  });
  
  const { token } = useSelector(state => state.token);
  
  const [createUser, setCreateUser] = useState(false);
  
  const [allemp, setAllEmp] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);

  const getEmp = async () => {
    try {
      const response = await fetch(`${base_url}/auth/emp/getall?role=agency`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setAllEmp(data);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    getEmp();
  }, [ ]); 

  
  const handelNewUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${base_url}/auth/emp/create?role=agency`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      
      if (data.success) {
        setNewUser({ email: "", password: "", name: "" });
        toast.success(data.message);
        setCreateUser(false); // Go back to table view
        getEmp(); // Refresh the employee list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  // Generate Password
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0; i < 12; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    setNewUser(prev => ({ ...prev, password: password }));
    setShowPassword(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

const handelStatus = async(id)=>{
  try {
    const response = await fetch(`${base_url}/auth/emp/statusupdate/${id}`,{
      method:"GET",
      headers:{
       Authorization: `Bearer ${token}`,
      }
    
    })
    const data = await response.json()
  
    if(data.success){
      toast.success(data.message)
      getEmp()
    }else{
      toast.error(data.message)

    }
  } catch (error) {
    
  }
}

const handelDelete = async(id)=>{
  try {
    const response = await fetch(`${base_url}/auth/emp/delete/${id}`,{
      method:"GET",
      headers:{
       Authorization: `Bearer ${token}`,
      }
    
    })
    const data = await response.json()
  
    if(data.success){
      toast.success(data.message)
      getEmp()
    }else{
      toast.error(data.message)

    }
  } catch (error) {
    
  }
}

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
      
      {/* Top Navigation / Header area */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {createUser ? "Add New Employee" : "Employee Directory"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {createUser 
              ? "Fill out the details to create a new team member account." 
              : "Manage your team members and their account statuses."}
          </p>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setCreateUser(!createUser)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
        >
          {createUser ? (
            <><ArrowLeft className="w-4 h-4" /> Back to Directory</>
          ) : (
            <><Plus className="w-4 h-4" /> Add Employee</>
          )}
        </button>
      </div>

      {/* Conditional Rendering: Show Table OR Form */}
      {!createUser ? (
        
        /* ------------------------- TABLE VIEW ------------------------- */
        <div className="w-full flex justify-center items-start">
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left">
                <thead className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 ">
                  {/* Safely check if allemp and allemp.emp exist before mapping */}
                  {allemp?.emp?.length > 0 ? (
                    allemp.emp.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase text-sm">
                              {employee.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 capitalize">{employee.name}</p>
                              <p className="text-xs text-gray-400 font-mono">ID: {employee._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {employee.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 uppercase font-medium tracking-wide">
                            <Shield className="w-4 h-4 text-gray-400" />
                            {employee.role}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {employee.active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="w-3.5 h-3.5" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(employee.createdAt)}
                          </div>
                        </td>
                       <td className="px-6 py-4 text-right relative group">
  {/* The 3-dots trigger button */}
  <button className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none">
    <MoreHorizontal className="w-5 h-5" />
  </button>

  {/* Dropdown Menu (Hidden by default, appears on hover) */}
  {/* Positioned slightly to the left of the button to prevent table overflow clipping */}
  <div className="absolute right-1 top-0 z-10 hidden group-hover:flex flex-col bg-white shadow-lg border border-gray-100 rounded-lg py-1 w-40  opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    
    {/* Activate / Deactivate Button */}
    <button onClick={()=>handelStatus(employee._id)}  className="flex  cursor-pointer items-center gap-2 px-4 py-2.5 text-[11px] text-gray-700 hover:bg-gray-50 transition-colors text-left w-full font-medium">
      {employee.active ? (
        <>
          <Power className="w-4 h-4 text-amber-500" />
          Deactivate
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Activate
        </>
      )}
    </button>

    {/* Divider */}
    <div className="h-[1px] bg-gray-100 w-full my-0.5"></div>

    {/* Delete Button */}
    <button  onClick={()=>handelDelete(employee._id)} className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-[11px] text-red-600 hover:bg-red-50 transition-colors text-left w-full font-medium">
      <Trash2 className="w-4 h-4" />
      Delete Emp.
    </button>

  </div>
</td> 
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No employees found. Click "Add Employee" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination/Footer Section */}
            {allemp && (
              <div className="bg-gray-50/50 border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm text-gray-500">
                <p>
                  Showing page <span className="font-medium text-gray-900">{allemp.currentPage}</span> of{' '}
                  <span className="font-medium text-gray-900">{allemp.totalPages}</span>
                </p>
                <p>
                  Total Employees: <span className="font-medium text-gray-900">{allemp.totalEmp}</span>
                </p>
              </div>
            )}
          </div>
        </div>

      ) : (


        <div className="w-full flex justify-center items-start mt-8">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            
            <div className="flex flex-col items-center mb-8">
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                <UserPlus className="text-blue-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            </div>

            <form onSubmit={handelNewUser} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="text"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="email"
                  placeholder="Email Address"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors focus:outline-none"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Generate strong password
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 mt-2"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AgencyPage;