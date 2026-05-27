import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Image as ImageIcon, // Aliased to avoid conflict with native HTML Image
  Video, 
  Music, 
  Code,
  Sparkles
} from 'lucide-react';

const AiHomePage = () => {
  // Enhanced NavLinks with descriptions and subtle color accents for the cards
  const NavLinks = [
    { 
      name: "Chat / Text AI", 
      link: "/ai/chat", 
      Icon: MessageSquare,
      description: "Engage in natural conversations, brainstorm ideas, and get instant answers.",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    { 
      name: "Image Generation", 
      link: "/ai/text-image", 
      Icon: ImageIcon,
      description: "Transform your text descriptions into stunning, high-quality images instantly.",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    { 
      name: "Video Generation", 
      link: "/ai/video", 
      Icon: Video,
      description: "Create dynamic videos and short animations using simple text prompts.",
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    { 
      name: "Audio & TTS", 
      link: "/ai/audio", 
      Icon: Music,
      description: "Generate realistic voiceovers, sound effects, and audio tracks from text.",
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    { 
      name: "Code Assistant", 
      link: "/ai/code", 
      Icon: Code,
      description: "Write, debug, and optimize your code effortlessly with AI assistance.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 p-6 md:p-10 overflow-y-auto">
      
      {/* Welcome Header */}
      <div className="max-w-6xl mx-auto w-full mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to AI Studio</h1>
        </div>
        <p className="text-gray-500 text-lg">
          Select a tool below to start creating, generating, and exploring with AI.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NavLinks.map((tool, index) => {
          const Icon = tool.Icon;
          return (
            <Link 
              key={index} 
              to={tool.link}
              className="group block bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 hover:-translate-y-1"
            >
              {/* Icon Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${tool.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                  {tool.name}
                </h3>
              </div>
              
              {/* Description */}
              <p className="text-gray-500 leading-relaxed text-sm">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>

    </div>
  );
}

export default AiHomePage;