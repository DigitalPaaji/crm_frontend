import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Upload, Trash2, Heart, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base_url } from '../../components/utlis'; // Ensure this path is correct in your project

const CreateInstaStory = ({ accountId, token, handelGet }) => {
  const [selectType, setSelectType] = useState("image");
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Clear the selected file & status when switching between Image and Video
  useEffect(() => {
    handleClearMedia();
    setStatus({ type: '', message: '' });
  }, [selectType]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus({ type: '', message: '' }); // Clear any previous status
    }
  };

  const handleClearMedia = () => {
    setMediaFile(null);
    setPreviewUrl(null);
    // Revoke object URL to prevent memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl); 
  };

  const handlePost = async () => {
    if (!mediaFile) return;

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const newFormData = new FormData();
      newFormData.append(selectType === "image" ? "image" : "video", mediaFile);
      newFormData.append("accountId", accountId);

      const response = await fetch(`${base_url}/insta/create_story/${selectType}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: newFormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post story. Please try again.');
      }

      // Success actions
      setStatus({ type: 'success', message: 'Story posted successfully!' });
      handleClearMedia();
      
    //   if (handelGet) {
    //     handelGet(); // Refresh the parent component's data
    //   }

    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white h-full pt-5 pb-10">
      {/* --- TOP TOGGLE --- */}
      <div className="px-5 mb-8">
        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-2xl w-full max-w-sm mx-auto">
          <button
            onClick={() => setSelectType("image")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              selectType === "image"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            <ImageIcon size={18} />
            <span>Image</span>
          </button>
          <button
            onClick={() => setSelectType("video")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              selectType === "video"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            <Video size={18} />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="px-5 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* LEFT SIDE: Media Selection */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Upload Media</h2>
              <p className="text-sm text-gray-500">Select an <span className="capitalize">{selectType}</span> to add to your story.</p>
            </div>

            <input 
              hidden 
              type="file" 
              accept={`${selectType}/*`} 
              id="media-upload" 
              onChange={handleFileSelect} 
            />

            {!previewUrl ? (
              <label 
                htmlFor="media-upload" 
                className="cursor-pointer border-2 border-dashed border-gray-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all duration-300 group"
              >
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-500" size={28} />
                </div>
                <span className="text-gray-700 font-medium">Click to browse files</span>
                <span className="text-gray-400 text-sm mt-1">Supports {selectType}s only</span>
              </label>
            ) : (
              <div className="border border-gray-200 rounded-3xl p-5 flex flex-col gap-4 bg-gray-50">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                      {selectType === 'image' ? <ImageIcon size={20} /> : <Video size={20} />}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-gray-800 truncate">{mediaFile?.name}</p>
                      <p className="text-xs text-gray-500">Ready to post</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleClearMedia}
                    disabled={isLoading}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove file"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="mt-auto pt-4 flex flex-col gap-3">
                  {/* Status Message Display */}
                  {status.message && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                      status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      {status.message}
                    </div>
                  )}

                  <button 
                    onClick={handlePost} 
                    disabled={isLoading || !mediaFile}
                    className={`w-full py-3 font-semibold rounded-xl flex justify-center items-center gap-2 transition-all duration-300 ${
                      isLoading || !mediaFile
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="-ml-1" />
                        Post to Story
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Instagram Story Preview */}
          <div className="flex flex-col items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Story Preview</h2>
              <p className="text-sm text-gray-500">How it will look on Instagram</p>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="relative w-[280px] h-[550px] bg-zinc-900 rounded-[2.5rem] border-[6px] border-zinc-800 shadow-2xl overflow-hidden flex items-center justify-center">
              
              {/* Top Notch/Speaker area */}
              <div className="absolute top-0 inset-x-0 h-6 bg-zinc-800 rounded-b-xl w-32 mx-auto z-20"></div>

              {previewUrl ? (
                <>
                  {/* Media Content */}
                  {selectType === 'video' ? (
                    <video 
                      src={previewUrl} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Story Preview" 
                      className="w-full h-full object-cover" 
                    />
                  )}

                  {/* Instagram Story UI Overlays */}
                  {/* Top Gradient & User Info */}
                  <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-start pt-8 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 border border-white/50"></div>
                      <span className="text-white text-sm font-semibold drop-shadow-md">your_username</span>
                      <span className="text-white/80 text-xs drop-shadow-md">12h</span>
                    </div>
                  </div>

                  {/* Bottom Gradient & Reply Box */}
                  <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-end pb-6 px-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 h-10 rounded-full border border-white/40 flex items-center px-4 backdrop-blur-sm">
                        <span className="text-white/80 text-sm">Send message</span>
                      </div>
                      <Heart className="text-white drop-shadow-md" size={24} />
                      <Send className="text-white drop-shadow-md" size={24} />
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State for Preview */
                <div className="text-center px-6">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    {selectType === 'image' ? <ImageIcon className="text-zinc-500" size={28} /> : <Video className="text-zinc-500" size={28} />}
                  </div>
                  <p className="text-zinc-500 text-sm">Your {selectType} preview will appear here</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateInstaStory;