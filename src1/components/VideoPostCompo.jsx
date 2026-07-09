import { Video, Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { base_url } from './utlis';

// Helper function to format milliseconds into MM:SS
const formatTime = (ms) => {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPostCompo = ({ accountId, token, handelGet, media_type }) => {
  const [videoData, setVideoData] = useState({
    caption: "",
    thumb_offset: 0, // Default to 0 instead of 3000 to prevent out-of-bounds on short videos
    share_to_feed: false,
    video: null,
    duration: 0,
  });
   const videoRef = useRef(null);
const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Safely cleanup Blob URLs to prevent memory leaks
  useEffect(() => {
    if (videoData.video) {
      const url = URL.createObjectURL(videoData.video);
      setPreviewUrl(url);
      
      // Cleanup function when component unmounts or video changes
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [videoData.video]);

  // Extract video duration
  const getDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);
      video.src = url;
      video.onloadedmetadata = () => {
        const durationMs = Math.floor(video.duration * 1000);
        URL.revokeObjectURL(url);
        resolve(durationMs);
      };
    });
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const duration = await getDuration(file);
      setVideoData((prev) => ({ 
        ...prev, 
        video: file, 
        duration,
        thumb_offset: 0 // Reset thumbnail offset on new video
      }));
    }
  };

  // Remove selected video
  const clearVideo = () => {
    setVideoData((prev) => ({
      ...prev,
      video: null,
      duration: 0,
      thumb_offset: 0
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShareToFeed = () => {
    setVideoData((prev) => ({ ...prev, share_to_feed: !prev.share_to_feed }));
  };

  

const handlePost= async()=>{
    if (!videoData.video) {
        toast.error("A Video is required to create a post.");
        return;
      }
  
      try {
        setIsLoading(true);
          
        const newFormData = new FormData();
        newFormData.append("video", videoData.video);
        newFormData.append("media_type", media_type);
        newFormData.append("caption", videoData.caption);
        newFormData.append("thumb_offset", videoData.thumb_offset);
        newFormData.append("share_to_feed", videoData.share_to_feed);



        newFormData.append("accountId", accountId);
  
        const response = await fetch(`${base_url}/insta/create_Video_post`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: newFormData,
        });
  
        const data = await response.json();
  
        if (data.success) {
          toast.success(data.message || "Video published successfully!");
          
          // Reset form completely
          setVideoData({
           caption: "",
    thumb_offset: 0, 
    share_to_feed: false,
    video: null,
    duration: 0,
          });
          // if (fileInputRef.current) fileInputRef.current.value = ""; 
          
         handelGet()
          
        } else {
          toast.error(data.message || data.error?.message || "Failed to create post.");
        }
  
      } catch (error) {
        console.error("Post creation error:", error);
        toast.error("Network error: Something went wrong while posting.");
      } finally {
        setIsLoading(false);
      }
}





  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Media Upload & Preview */}
        <div className="flex flex-col gap-4 h-full">
          {videoData.video && previewUrl ? (
            <div className="relative flex flex-col w-full aspect-square bg-black rounded-lg overflow-hidden shadow-inner group">
              <video 
              ref={videoRef}
                src={previewUrl} 
                className="h-full w-full object-contain" 
                controls 
              />
              <button 
                onClick={clearVideo}
                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                title="Remove video"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label 
              htmlFor="video-upload" 
              className="relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg transition-all overflow-hidden border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 group-hover:scale-105 transition-transform duration-300">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Video size={36} className="text-blue-600" />
                </div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Click to upload Video</p>
                <p className="text-xs text-gray-400">MP4, WebM, MOV</p>
              </div>
            </label>
          )}

          <input
            type="file"
            hidden
            accept="video/*"
            id="video-upload"
            name="video"
            onChange={handleFileChange}
          />
        </div>

        {/* Right Column: Settings & Data */}
        <div className="flex flex-col gap-6">
          
          {/* Caption Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="caption">
              Caption
            </label>
            <textarea
              name="caption"
              id="caption"
              rows="4"
              value={videoData.caption}
              onChange={handleInputChange}
              placeholder="Write a caption for your post..."
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm"
            ></textarea>
          </div>

          {/* Share to Feed Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50/80 border border-gray-100 rounded-lg shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700">Share to feed</span>
              <span className="text-xs text-gray-500">Also publish this video to your main feed</span>
            </div>
            
            <button
              type="button"
              role="switch"
              aria-checked={videoData.share_to_feed}
              onClick={toggleShareToFeed}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 ${
                videoData.share_to_feed ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                  videoData.share_to_feed ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Thumbnail Offset Slider (Only visible if video is uploaded) */}
          {videoData.video && (
            <div className="flex flex-col gap-3 p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-gray-500" />
                  <label className="text-sm font-semibold text-gray-700">Cover Thumbnail</label>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                  {formatTime(videoData.thumb_offset)} / {formatTime(videoData.duration)}
                </span>
              </div>
              
              <div className="relative pt-2">
                <input
                  type="range"
                  min={0}
                  max={videoData.duration || 0}
                  step={100} 
                  
                  value={videoData.thumb_offset}
                  onChange={(e) =>{
                    setVideoData((prev) => ({
                      ...prev,
                      thumb_offset: Number(e.target.value)})),

                         videoRef.current.currentTime = e.target.value/1000;
                
                
                }
                  }
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Drag the slider to choose the frame that represents your video.
              </p>
            </div>
          )}
          <div>

           <button 
            onClick={handlePost} 
            disabled={isLoading || !videoData.video}
            className={`w-full py-3 mt-auto font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors ${
              isLoading || !videoData.video 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-900 hover:bg-black text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Upload size={18} />
                Post
              </>
            )}
          </button>
          </div>
        </div>

        <div>
          
        </div>
      </div>
    </div>
  );
};

export default VideoPostCompo;