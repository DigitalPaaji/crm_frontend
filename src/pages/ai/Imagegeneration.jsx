import React, { useState, useRef, useEffect } from "react";
import { base_url } from "../../components/utlis";
import { Send, Download, ImageIcon, Bot, User, Loader2 } from "lucide-react";
import { toast } from "react-toastify"; // Assuming you have this from the previous component

const Imagegeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [loader, setLoader] = useState(false);
  
  // Unified chat state structure
  const [chat, setChat] = useState([]);
  
  // Ref to handle auto-scrolling to the bottom of the chat
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loader]);

  const handelSubmit = async (e) => {
    // Check if it's a keydown 'Enter' OR a button click (where e.key is undefined)
    if ((e.key === "Enter" || e.type === "click") && prompt.trim().length > 2 && !loader) {
      e.preventDefault();
      
      const currentPrompt = prompt;
      setPrompt(""); // Clear input immediately for better UX
      setLoader(true);
      
      // Add User message to chat
      setChat(prev => [...prev, { role: "user", type: "text", content: currentPrompt }]);

      try {
        const response = await fetch(`${base_url}/ai/image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: currentPrompt })
        });
        
        const data = await response.json();
        
        if (data.success && data.data?.artifacts?.[0]?.base64) {
          // Add AI Image response to chat
          setChat(prev => [...prev, { 
            role: "ai", 
            type: "image", 
            content: data.data.artifacts[0].base64 
          }]);
        } else {
          toast.error("Failed to generate image. Please try again.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while connecting to the AI.");
      } finally {
        setLoader(false);
      }
    }
  };

  // Function to handle downloading the base64 image
  const downloadImage = (base64String) => {
    const link = document.createElement("a");
    // Assuming the image is a PNG or JPEG. The base64 string needs the data URI prefix if it doesn't already have it.
    link.href = `data:image/png;base64,${base64String}`;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      
      {/* Header */}
      <div className="h-16 border-b border-gray-100 flex items-center px-6 shrink-0">
        <ImageIcon className="w-5 h-5 text-purple-600 mr-3" />
        <h2 className="text-lg font-semibold text-gray-800">Image Generator</h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
        
        {chat.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
            <p>Describe an image you want to generate...</p>
          </div>
        ) : (
          chat.map((msg, index) => (
            <div key={index} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              
              {/* AI Avatar */}
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user" 
                  ? "bg-purple-600 text-white rounded-tr-sm" 
                  : "bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800"
              }`}>
                
                {msg.type === "text" ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="relative group">
                    {/* Render Base64 Image */}
                    <img 
                      src={`data:image/png;base64,${msg.content}`} 
                      alt="AI Generated" 
                      className="rounded-lg max-w-sm w-full object-cover shadow-sm"
                    />
                    
                    {/* Download Button overlay */}
                    <button 
                      onClick={() => downloadImage(msg.content)}
                      className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-2 text-sm"
                      title="Download Image"
                    >
                      <Download className="w-4 h-4" />
                      <span className="font-medium pr-1">Download</span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}

            </div>
          ))
        )}

        {/* Loader showing AI is "typing/generating" */}
        {loader && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
              <span className="text-sm text-gray-500 font-medium animate-pulse">Generating your image...</span>
            </div>
          </div>
        )}

        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handelSubmit}
            disabled={loader}
            placeholder={loader ? "Generating..." : "Describe the image you want to see..."}
            className="w-full text-base py-3 pl-5 pr-14 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={handelSubmit}
            disabled={prompt.trim().length < 3 || loader}
            className="absolute right-2 p-2 rounded-full bg-purple-600 text-white disabled:bg-gray-300 hover:bg-purple-700 transition-colors focus:outline-none"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Press Enter to generate. Be specific for better results.
        </p>
      </div>

    </div>
  );
};

export default Imagegeneration;