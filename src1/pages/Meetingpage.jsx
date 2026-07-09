import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { base_url } from '../components/utlis';
import { toast } from 'react-toastify';
import { ArrowLeft, Video, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import Videochatroom from '../components/Videochatroom';

const Meetingpage = () => {
  const { roomid } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAdd,setUserAdd]=useState(false)

  const handleJoinMeet = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submit
    
    if (!name.trim() || !password.trim()) {
      toast.warning("Please enter both your name and the meeting password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${base_url}/meet/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password, roomid, name }) // Included name just in case your backend needs it
      });

      const data = await response.json();

      if (response.ok && data.success) {

        toast.success(data.message || "Successfully joined!");
        setUserAdd(true)
        // TODO: Handle what happens next! 
        // For example, navigate to the actual video stream component, or set a state to show the video UI.
        // navigate(`/live/${roomid}`, { state: { name } }); 

      } else {
        toast.error(data.message || "Invalid password or room ID");
      }

    } catch (error) {
      toast.error(error.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (<>
  
  
{userAdd && <Videochatroom  name={name} roomid={roomid}  />

}



  {!userAdd
  &&
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative">
      
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Link 
          to={-1} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Link>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10">
        
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
          <Video className="text-blue-600 w-8 h-8" />
        </div>

        {/* Titles */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Join Meeting
          </h1>
          <div className="flex items-center justify-center gap-2 text-[15px] text-gray-500 bg-gray-50 py-2 px-4 rounded-lg inline-flex border border-gray-100">
            <span className='text-nowrap'>Room ID:</span>
            <code className="font-mono font-semibold text-gray-800">{roomid}</code>
          </div>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoinMeet} className="space-y-5">
          
          {/* Name Input */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Your Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your display name" 
                disabled={isLoading}
                className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 text-[15px] rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 block p-4 pl-12 transition-all placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Meeting Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter meeting password" 
                disabled={isLoading}
                className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 text-[15px] rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 block p-4 pl-12 transition-all placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || !name.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 font-medium rounded-2xl text-[15px] px-5 py-4 mt-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Join Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  
  }
  </>
    
  );
};

export default Meetingpage;