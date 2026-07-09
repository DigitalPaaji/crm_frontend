import React, { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, Plus, Video, Copy, X, Trash2, ExternalLink } from 'lucide-react';
import { base_url } from '../components/utlis';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Createmeet = () => {
  const [password, setPassword] = useState('');
  const [createMeet, setCreateMeet] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [meetsList, setMeetsList] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const { token } = useSelector((state) => state.token);

  // Fetch all meetings
  const fetchMeets = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${base_url}/meet/getall`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMeetsList(data.meets || []);
      } else {
        toast.error(data.message || "Failed to fetch meetings");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMeets();
  }, []);

  // Handle meeting creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`${base_url}/meet/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Meeting created successfully!");
        setCreateMeet(false);
        setPassword('');
        fetchMeets(); // Refresh the list after creation
      } else {
        throw new Error(data.message || "Failed to create meeting");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle meeting deletion
  const handleDelete = async (meetId) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;

    try {
      // Adjust this endpoint URL if your backend uses a different path for deleting
      const response = await fetch(`${base_url}/meet/delete/${meetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Meeting deleted successfully!");
        fetchMeets(); // Refresh the list
      } else {
        throw new Error(data.message || "Failed to delete meeting");
      }
    } catch (error) {
      toast.error(error.message || "Error deleting meeting.");
    }
  };

  // Utility to copy full URL
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Meeting link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Meetings</h1>
          <p className="text-gray-500 mt-1">Manage and create secure video meetings.</p>
        </div>
        <button
          onClick={() => setCreateMeet(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create New Meeting
        </button>
      </div>

      {/* Meetings Dashboard */}
      <div className="max-w-6xl mx-auto">
        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : meetsList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No meetings yet</h3>
            <p className="text-gray-500">Create your first secure meeting to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetsList.map((meet) => {
              const fullMeetUrl = `${window.location.origin}/#/meet/${meet.roomid}`;

              return (
                <div key={meet._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
                      Active
                    </span>
                  </div>

                  {/* Meeting URL */}
                  <div className="mb-4">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Meeting Link</h3>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <code className="text-gray-900 font-mono text-sm truncate pr-2">
                        {fullMeetUrl}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(fullMeetUrl)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex-shrink-0"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meeting Password */}
                  <div className="mb-6 flex-grow">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Password</h3>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-gray-900 font-medium text-sm">
                        {meet.password || "No password"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                    <Link
                      to={`/meet/${meet.roomid}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      Go to Meet
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(meet._id)}
                      className="flex items-center justify-center p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                      title="Delete Meeting"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Meeting Modal Overlay */}
      {createMeet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 transform transition-all relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setCreateMeet(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-sm rotate-3">
              <Lock className="text-blue-600 w-8 h-8 -rotate-3" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                Create Secure Meeting
              </h2>
              <p className="text-[15px] text-gray-500">
                Set a strong password to protect your room.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wide" 
                  htmlFor="password"
                >
                  Meeting Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    disabled={isLoading}
                    className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 text-[15px] rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white block p-4 pr-12 transition-all placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || password.trim().length < 4}
                className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 font-medium rounded-2xl text-[15px] px-5 py-4 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Meeting
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Createmeet;