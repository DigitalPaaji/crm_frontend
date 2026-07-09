import React, { useState, useEffect, useRef } from 'react';
import { ImagePlus, Tag, Plus, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { base_url } from './utlis';


const ImagePostCompo = ({accountId,token,handelGet}) => {
 
  

  
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPlace,setSearchPlace]=useState("")
  const [userTag, setUserTag] = useState({
    username: "",
    x: 0.5, // Default to center
    y: 0.5,
  });

  const [formData, setFormData] = useState({
    image: null,
    caption: "",
    user_tags: [],
  });

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    if (!formData.image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(formData.image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [formData.image]);

  const handleAddTag = () => {
    if (!userTag.username.trim()) {
      toast.error("Please enter a username to tag");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      user_tags: [...prev.user_tags, userTag],
    }));

    setUserTag({
      username: "",
      x: 0.5,
      y: 0.5,
    });
  };

  const removeTag = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      user_tags: prev.user_tags.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handlePost = async () => {
    if (!formData.image) {
      toast.error("An image is required to create a post.");
      return;
    }

    try {
      setIsLoading(true);
        
      const newFormData = new FormData();
      newFormData.append("image", formData.image);
      newFormData.append("caption", formData.caption);
      newFormData.append("accountId", accountId);
      newFormData.append("usertags", JSON.stringify(formData.user_tags));

      const response = await fetch(`${base_url}/insta/create_post`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: newFormData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Post published successfully!");
        
        // Reset form completely
        setFormData({
          image: null,
          caption: "",
          user_tags: [],
        });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input so same file can be re-selected
        
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
  };

const fetchSearch = async(info)=>{
  try {
    const response = await fetch(`${base_url}/insta/get/search/${accountId}?q=${info}`,{
      method:"GET",
      headers:{
         Authorization: `Bearer ${token}`
      }
    })

// const data = await response.json();



  } catch (error) {
    
  }
}


//   useEffect(()=>{


// if (
//     !searchPlace ||
//     searchPlace.trim().length < 3
//   ) {
//     return;
//   }

// const timer = setTimeout(() => {

//     fetchSearch(searchPlace);

//   }, 500);

//   return () => clearTimeout(timer);
//   },[searchPlace])

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        
        {/* Left Side: Image Upload & Preview */}
        <div className="flex flex-col gap-4">
          <input
            hidden
            type="file"
            id="image-upload"
            accept="image/*"
            ref={fileInputRef}
            disabled={isLoading}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
              }
            }}
          />

          <label
            htmlFor="image-upload"
            className={`relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg transition-colors overflow-hidden ${
              formData.image 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {formData.image && previewUrl ? (
              <div className="relative w-full h-full">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black/5" />
                
                {/* Render already added tags */}
                {formData.user_tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-black/70 backdrop-blur-sm rounded-md shadow-sm transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 cursor-pointer group hover:bg-red-500/90 transition-colors"
                    style={{ top: `${tag.y * 100}%`, left: `${tag.x * 100}%` }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isLoading) removeTag(idx);
                    }}
                  >
                    @{tag.username}
                    <X size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}

                {/* Render current drafting tag */}
                {userTag.username && (
                  <div
                    className="absolute z-20 px-2 py-1 text-xs font-semibold text-white bg-blue-600/90 shadow-lg rounded-md transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${userTag.y * 100}%`, left: `${userTag.x * 100}%` }}
                  >
                    @{userTag.username}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                <ImagePlus size={40} className="mb-3 text-blue-500" />
                <p className="mb-1 text-sm font-semibold">Click to upload image</p>
                <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
              </div>
            )}
          </label>
        </div>

        {/* Right Side: Form Controls */}
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all h-32 disabled:bg-gray-100 disabled:text-gray-400"
              placeholder="Write a caption..."
              value={formData.caption}
              disabled={isLoading}
              onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
            ></textarea>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Tag size={16} /> Tag Users
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Username (e.g. john_doe)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                disabled={isLoading || !formData.image}
                onChange={(e) => setUserTag((prev) => ({ ...prev, username: e.target.value }))}
                value={userTag.username}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button
                onClick={handleAddTag}
                disabled={isLoading || !formData.image}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-md flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {/* Position Sliders */}
            <div className={`space-y-3 pt-2 ${!formData.image ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="text-xs text-gray-500 flex justify-between">
                  <span>Horizontal Position (X)</span>
                  <span>{Math.round(userTag.x * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={isLoading || !formData.image}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  onChange={(e) => setUserTag((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                  value={userTag.x}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 flex justify-between">
                  <span>Vertical Position (Y)</span>
                  <span>{Math.round(userTag.y * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={isLoading || !formData.image}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  onChange={(e) => setUserTag((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                  value={userTag.y}
                />
              </div>
            </div>
          </div>

 {/* <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
<input type="search"  value={searchPlace}  onChange={(e)=>setSearchPlace(e.target.value)}   placeholder='Search Location' className='w-full px-2 border rounded-sm'  />


 </div> */}

          
          <button 
            onClick={handlePost} 
            disabled={isLoading || !formData.image}
            className={`w-full py-3 mt-auto font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors ${
              isLoading || !formData.image 
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
    </div>
  );
};

export default ImagePostCompo;