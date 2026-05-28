import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProfile, getUser } from '../../store/userSlice';
import emoji1 from "../../assets/emoji/1.webp"
import emoji2 from "../../assets/emoji/2.webp"
import emoji3 from "../../assets/emoji/3.webp"
import emoji4 from "../../assets/emoji/4.webp"
import emoji5 from "../../assets/emoji/5.webp"
import emoji6 from "../../assets/emoji/6.webp"
import emoji7 from "../../assets/emoji/7.webp"
import emoji8 from "../../assets/emoji/8.webp"
import emoji9 from "../../assets/emoji/9.webp"
import emoji10 from "../../assets/emoji/10.webp"
import emoji11 from "../../assets/emoji/11.webp"
import emoji12 from "../../assets/emoji/12.webp"
import emoji13 from "../../assets/emoji/13.webp"
import emoji14 from "../../assets/emoji/14.webp"
import emoji15 from "../../assets/emoji/15.webp"
import emoji16 from "../../assets/emoji/16.webp"
import { CircleCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { base_url } from '../../components/utlis';
import { useNavigate } from 'react-router-dom';





const SettingPage = () => {
  const dispatch = useDispatch();
  const { info, isError, isLoading } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.token);
  console.log(info)
  const [profile,setProfile]=useState(0)
  const route = useNavigate()

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  



  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const submitPasswordChange = async(e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

  
try {
    const response = await fetch(`${base_url}/auth/user/updatepassword`,{
      method:"PUT",
            headers:{
                 Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
            },
            body: JSON.stringify(passwords)
        })
      const data = await response.json();

      if(data.success){
        toast.success(data.message)
       localStorage.clear("token")
       route("/login")
    }else{
        
        toast.error(data.message)
      }

} catch (error) {
     toast.error(error.response.data.message)
}


  };


const handelProfile = async()=>{
    try {
        const response = await fetch(`${base_url}/auth/user/updateprofile`,{
            method:"PUT",
            headers:{
                 Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
            },
            body: JSON.stringify({profile})
        })
      const data = await response.json();

      if(data.success){
        toast.success(data.message)
        dispatch(addProfile(profile));
        setProfile(0)
    }else{
        
        toast.error(data.message)
      }


    } catch (error) {
        toast.error(error.response)
    }
}


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-red-500 font-medium">Failed to load user data.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-sm text-gray-500">Manage your profile and security preferences.</p>
        </div>

        {/* --- Profile Information Card --- */}
        <div className="bg-white shadow rounded-xl p-6 md:p-8">
            <div className='text-xl font-semibold text-gray-800 mb-6 border-b pb-4 flex justify-between items-center'>
          <h2 className="">Profile Information</h2>
{info?.profile &&  <img  src={[
    emoji1, emoji2, emoji3, emoji4, emoji5, emoji6, 
    emoji7, emoji8, emoji9, emoji10, emoji13, emoji14, 
    emoji15, emoji16, emoji11, emoji12
  ].find((_,ind)=>ind+1 == info?.profile)}  className='h-20' />   }
            </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                disabled
                // Stripped the trailing backtick from your mock data if present
                value={info?.name?.replace('`', '') || ''}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                disabled
                value={info?.email || ''}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                disabled
                value={info?.role || ''}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm capitalize cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Status</label>
              <div className="mt-3 flex items-center">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  info?.active 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {info?.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Security / Password Change Card --- */}
        <div className="bg-white shadow rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Security</h2>
          
          <form onSubmit={submitPasswordChange} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                required
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                required
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

 <div className="bg-white shadow rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Profile</h2>
          
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4 md:p-6'>
  {[
    emoji1, emoji2, emoji3, emoji4, emoji5, emoji6, 
    emoji7, emoji8, emoji9, emoji10, emoji13, emoji14, 
    emoji15, emoji16, emoji11, emoji12
  ].map((val, index) => (
    <div 
      key={index}
      onClick={()=>setProfile(index+1)}
      className='group relative flex items-center justify-center p-2 bg-gray-300 rounded-2xl shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1.5 active:translate-y-0 active:shadow-sm'
    >
        {profile == index+1 && <CircleCheck  className='absolute top-2 right-2 text-green-600'/>}
      <img 
        src={val} 
        alt={`Emoji ${index + 1}`}
        className='h-24 w-24 object-contain transition-transform duration-300 ease-out group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-md' 
      />
      
      {/* Optional: Subtle glow effect on hover behind the image */}
      <div className='absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none' />
    </div>
  ))}

 <div 
    //   key={index}
      onClick={handelProfile}

      className='group relative flex items-center justify-center p-2 bg-blue-700 text-white font-medium rounded-2xl shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1.5 active:translate-y-0 active:shadow-sm'
    >
   
      
      Add
    </div>

</div>
        </div>

      </div>
    </div>
  );
};

export default SettingPage;