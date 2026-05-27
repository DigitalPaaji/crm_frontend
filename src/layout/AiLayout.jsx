import React from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  ImageIcon, // Renamed 'Image' to 'ImageIcon' to avoid conflicts with native HTML Image
  MessageSquare, 
  Video, 
  Music, 
  Code, 
  LayoutDashboard, 
  ArrowLeft,
  Bot
} from 'lucide-react';

const AiLayout = () => {
 
     const pathname = useLocation()
   

  const NavLinks = [
    { name: "Chat / Text AI", link: "/ai/chat", Icon: MessageSquare },
    { name: "Image Generation", link: "/ai/text-image", Icon: ImageIcon },
    { name: "Video Generation", link: "/ai/video", Icon: Video },
    { name: "Audio & TTS", link: "/ai/audio", Icon: Music },
    { name: "Code Assistant", link: "/ai/code", Icon: Code },
  ];

  return (
    <div className="h-screen w-full flex bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-10">
        
        {/* Brand / Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Bot className="w-8 h-8 text-purple-500 mr-3" />
          <h1 className="text-xl font-bold tracking-wide">AI Studio</h1>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Workspace Tools
          </div>
             <NavLink
              
                to={"/ai"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    pathname.pathname=="/ai" 
                      ? "bg-purple-600 text-white shadow-md" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Overview</span>
              </NavLink>
          {NavLinks.map((item, index) => {
            const Icon = item.Icon; // Extract the icon component
            return (
              <NavLink
                key={index}
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? "bg-purple-600 text-white shadow-md" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section (Go Back) */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Exit Workspace</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area where your AI tools will render */}
      <div className="flex-1 h-full overflow-y-auto bg-gray-50 relative">
        <Outlet />
      </div>

    </div>
  );
}

export default AiLayout;