import React, { useEffect, useState } from 'react';
import { base_url } from '../components/utlis';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MessageSquare, Loader2, SearchX } from 'lucide-react';
import Loader from '../components/Loader';
import GetImage from '../components/GetImage';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const MessagePage = () => {
  const { token } = useSelector((state) => state.token);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [allUser, setAllUser] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  
  // States for better UX
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Sync chatId with URL (handles browser back button gracefully on mobile)
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const currentId = pathParts[pathParts.length - 1];
    // Assuming base route is something like '/messages'
    if (currentId && currentId !== 'messages') {
      setChatId(currentId);
    } else {
      setChatId(null);
      setSelectedUser(null);
    }
  }, [location.pathname]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${base_url}/chat/getuser`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      if (data.success) {
        setAllUser(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetMessage = async (user) => {
    try {
      setIsChatLoading(true);
      setSelectedUser(user);
      
      const response = await fetch(`${base_url}/chat/getchat/${user._id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setChatId(data.chat._id);
        navigate(data.chat._id);
      } else {
        toast.error(data.message || "Failed to initiate chat");
        setChatId(null);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Chat fetch error:", error);
      toast.error("An error occurred while opening the chat.");
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className='flex h-full bg-gray-50 overflow-hidden font-sans w-full'>
      
      {/* --- SIDEBAR --- */}
      <div className={`
        ${chatId ? 'hidden md:flex' : 'flex'} 
        w-full md:w-[350px] lg:w-[400px] bg-white border-r border-gray-200 flex-col h-full shadow-sm z-20 transition-all duration-300 flex-shrink-0
      `}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">Select a user to chat</p>
        </div>
        
        {/* Scrollable User List with Hidden Scrollbar */}
        <div className='flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          {allUser?.length > 0 ? (
            allUser.map((item) => {
              const isActive = selectedUser?._id === item._id;
              
              return (
                <div 
                  key={item._id} 
                  onClick={() => handleGetMessage(item)}
                  className={`
                    flex gap-4 items-center p-4 cursor-pointer transition-all duration-200 group border-b border-gray-50
                    ${isActive ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}
                  `}
                >
                  {/* Avatar Section */}
                  <div className="flex-shrink-0 relative">
                    {item.profile ? (
                      <div className='h-12 w-12 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100 shadow-sm'>
                        <GetImage profile={item.profile} className="h-full w-full object-cover" /> 
                      </div>
                    ) : (
                      <div className='w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg uppercase shadow-sm group-hover:bg-blue-200 transition-colors'>
                        {item.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  
                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {item.name}
                    </p>
                    <p className='text-xs text-gray-500 truncate capitalize mt-0.5'>
                      {item.role || 'Member'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty User List State */
            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500 h-full">
               <SearchX size={48} className="text-gray-300 mb-4 stroke-[1.5]" />
               <p className="text-gray-600 font-medium">No users found.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className={`
        ${chatId ? 'flex' : 'hidden md:flex'}
        flex-1 flex-col bg-[#f0f2f5] relative h-full w-full overflow-hidden
      `}>
        {chatId ? (
          <div className="flex-1 flex flex-col h-full w-full relative">
            
            {/* Loading Overlay when switching chats */}
            {isChatLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
              </div>
            )}
            
            {/* Render nested chat route */}
            <Outlet />
            
          </div>
        ) : (
          /* Empty Chat Area State */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 h-full bg-gray-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-gray-100">
              <MessageSquare size={40} className="text-blue-500 stroke-[1.5]" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2 tracking-tight">Your Messages</h3>
            <p className="text-gray-500 max-w-md">
              Select a user from the sidebar to start a conversation, or check back later for new updates.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default MessagePage;