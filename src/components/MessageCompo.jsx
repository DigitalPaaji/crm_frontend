import { Send, Loader2 } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { base_url, io_url } from './utlis'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom'

// Initialize socket outside component to prevent multiple connections
const socket = io(io_url)

const MessageCompo = () => {
  const { token } = useSelector((state) => state.token);
  const user = useSelector(state => state.user.info)
   
  const params = useParams()
  const chatId = params.chatid
  
  const [sendLoder, setSendLoder] = useState(false)
  const [message, setMessage] = useState("")
  const [allChat, setAllChat] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  
  // Refs
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null) 

  const handleSendMessage = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      sendMEssage()
    }
  }

  const sendMEssage = async () => {
    try {
      if (!message.trim()) return
      setSendLoder(true)

      const response = await fetch(`${base_url}/chat/message/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, text: message })
      })

      const data = await response.json()

      if (data.success) {
        setAllChat(prev => [...prev, data.message])
        setMessage("")
        
        // Emit message and immediately stop typing
        socket.emit("send-message", { chatId, message: data.message })
        socket.emit("stop-typing", chatId)
        clearTimeout(typingTimeoutRef.current)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message")
    } finally {
      setSendLoder(false)
    }
  }

  const fetchAllMessage = async () => {
    try {
      const response = await fetch(`${base_url}/chat/message/get/${chatId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json();

      if (data.success) {
        setAllChat(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages")
    }
  }

  // Socket & Fetch Effects
  useEffect(() => {
    if (!chatId) return;

    fetchAllMessage();
    socket.emit("join-chat", chatId);

    // Define named functions so we can cleanly remove them later
    const handleReceiveMessage = (newMessage) => {
      setAllChat((prev) => [...prev, newMessage]);
    };
    const handleTrueTyping = () => setIsTyping(true);
    const handleFalseTyping = () => setIsTyping(false);

    socket.on("receive-message", handleReceiveMessage);
    socket.on("true-typing", handleTrueTyping);
    socket.on("false-typing", handleFalseTyping);

    // Cleanup listeners when component unmounts or chatId changes
    return () => {
      setIsTyping(false)
      socket.off("receive-message", handleReceiveMessage);
      socket.off("true-typing", handleTrueTyping);
      socket.off("false-typing", handleFalseTyping);
      socket.emit("leave-chat", chatId);
    };
  }, [chatId]);

  // Auto-scroll to the bottom whenever allChat OR isTyping changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allChat, isTyping])

  // Helper to format timestamps
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Debounced typing handler
  const handleTyping = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", chatId);
    
    // Clear the previous timeout if user keeps typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", chatId);
    }, 1500); // 1.5 seconds feels more natural for a typing gap
  };

  return (
    <div className='h-full flex-1 flex flex-col bg-[#f0f2f5]'>
      
      {/* Chat Messages Area (Hidden Scrollbar applied here) */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        <div className="mt-auto space-y-3 flex flex-col">
          
          {allChat.length > 0 ? (
            allChat.map((msg) => {
              const isMe = user?._id === msg.senderId

              return (
                <div 
                  key={msg._id} 
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 mt-1 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="flex items-center justify-center text-gray-400 my-auto pb-10 bg-white/50 py-2 px-4 rounded-full w-fit mx-auto text-sm shadow-sm border border-gray-100">
              No messages yet. Say hi! 👋
            </div>
          )}

          {/* Clean CSS Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-bl-none px-4 py-3.5 flex items-center gap-1.5 w-fit shadow-sm">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {/* Auto-scroll target (Removed h-1/2 to fix blank space issue) */}
          <div ref={messagesEndRef} className="pt-2" />
        </div>
      </div>

      {/* Input Area */}
      <div className='bg-white p-3 sm:p-4 border-t border-gray-200 shadow-[0_-1px_2px_rgba(0,0,0,0.02)] z-10'>
        <div className='relative flex items-center w-full mx-auto'>
          <input 
            value={message} 
            onChange={handleTyping}
            onKeyDown={handleSendMessage} 
            type="text" 
            placeholder='Type a message...' 
            disabled={sendLoder}
            className='w-full bg-gray-100 text-gray-800 text-[15px] px-5 py-3.5 rounded-full pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all disabled:opacity-50 border border-transparent focus:border-blue-500/30' 
          />
          <button 
            onClick={sendMEssage}
            disabled={sendLoder || !message.trim()}
            className='absolute right-2 top-1/2 -translate-y-1/2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 p-2 sm:p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm disabled:cursor-not-allowed'
          >
            {sendLoder ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </button>
        </div>
      </div>

    </div>
  )
}

export default MessageCompo