import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal,
  ArrowLeft, 
  CircleX,
  CornerDownRight,
  LoaderCircle
} from 'lucide-react';
import { base_url } from './utlis';
import { toast } from 'react-toastify';

const InstaPostCompo = ({ postId, accountId, token, setPostId }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentId, setCommentId] = useState("");
  const [message, setMessage] = useState("");
  const [commentLoading,setCommentLoding]=useState(false)
  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${base_url}/insta/get/post?accountId=${accountId}&mediaId=${postId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const data = await response.json();
      
      if (data.success && data.post) {
        setPost(data.post);
      } else {
        setError('Failed to load post data');
      }
    } catch (err) {
      setError('An error occurred while fetching the post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentReply = async (e) => {
    if (e.key !== "Enter") return;

    try {
      if (!commentId || !message.trim()) {
        toast.error("Please enter a message to reply.");
        return;
      }
      setCommentLoding(true)
      const response = await fetch(`${base_url}/insta/reply/comment`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ accountId, commentId, message }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Reply posted successfully!");
        setMessage("");
        setCommentId("");
        // Optionally, re-fetch the post here to show the new reply immediately
        fetchPost(); 
      } else {
        toast.error("Failed to post reply.");
      }
      

    } catch (error) {
      console.error(error);
      toast.error("An error occurred while posting your reply.");
    }
    finally{
        setCommentLoding(false)
      }
  };

  useEffect(() => {
    fetchPost();
    
  }, [postId, accountId, token]);

  // Loading State
  if (loading) {
    return (
      <div className="absolute top-0 left-0 w-full h-full min-h-screen flex items-center justify-center bg-gray-50 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Error State
  if (error || !post) {
    return (
      <div className="absolute top-0 left-0 w-full h-full min-h-screen flex flex-col items-center justify-center bg-gray-50 z-50">
        <p className="text-red-500 font-semibold mb-4">{error || 'Post not found'}</p>
        <button 
          onClick={() => setPostId(null)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>
      </div>
    );
  }

  const formattedDate = new Date(post.timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Helper component for Avatar
  const Avatar = ({ username, size = "w-8 h-8" }) => (
    <div className={`${size} rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px] flex-shrink-0`}>
      <div className="w-full h-full bg-white rounded-full flex items-center justify-center border border-white overflow-hidden">
        <span className="text-xs font-bold text-gray-700">
          {username?.charAt(0).toUpperCase() || '?'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="absolute top-0 left-0 w-full h-full min-h-screen bg-gray-50 py-12 flex justify-center z-50 overflow-y-auto">
      
      {/* Go Back Button */}
      <button 
        onClick={() => setPostId(null)}
        className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-white text-gray-800 shadow-sm border border-gray-200 rounded-full hover:bg-gray-100 transition z-50"
      >
        <ArrowLeft size={20} />
        <span className="font-medium pr-1 hidden sm:block">Back</span>
      </button>

      {/* Instagram Post Card */}
      <div className="w-full max-w-[470px] bg-white border border-gray-200 rounded-lg shadow-sm h-fit mb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar username={post.username} />
            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm hover:text-gray-500 transition">
              {post.username}
            </a>
          </div>
          <button className="text-gray-600 hover:text-gray-400 transition">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Media Content */}
        <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {post.media_type === 'VIDEO' ? (
            <video 
              controls 
              poster={post.thumbnail_url} 
              className="w-full max-h-[600px] object-cover"
              src={post.media_url}
            />
          ) : (
            <img 
              src={post.media_url || post.thumbnail_url} 
              alt="Post content" 
              className="w-full max-h-[600px] object-cover" 
            />
          )}
        </div>

        {/* Actions & Details */}
        <div className="p-3">
          {/* Interaction Icons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button className="hover:text-gray-500 transition"><Heart size={24} /></button>
              <button className="hover:text-gray-500 transition"><MessageCircle size={24} /></button>
              <button className="hover:text-gray-500 transition"><Send size={24} /></button>
            </div>
            <button className="hover:text-gray-500 transition"><Bookmark size={24} /></button>
          </div>

          {/* Likes */}
          <p className="font-semibold text-sm mb-2 text-gray-900">
            {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
          </p>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm mb-3 break-words text-gray-800 leading-relaxed">
              <span className="font-semibold mr-2 text-gray-900">{post.username}</span>
              {post.caption}
            </p>
          )}

          {/* Comments Section */}
          {post.comments?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm font-medium mb-4">
                Comments ({post.comments_count})
              </p>

              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex flex-col">
                    
                    {/* Parent Comment */}
                    <div className="flex items-start gap-3">
                      <Avatar username={comment.username} size="w-7 h-7" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          <span className="font-bold mr-2 text-gray-900">{comment.username}</span>
                          {comment.text}
                        </p>
                        
                        {/* Parent Comment Actions */}
                        <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500 font-medium">
                          <span>{new Date(comment.timestamp || Date.now()).toLocaleDateString()}</span>
                          <button 
                            className="hover:text-gray-800 transition"
                            onClick={() => { 
                              setCommentId(commentId === comment.id ? "" : comment.id); 
                              setMessage(""); 
                            }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                      <button className="text-gray-300 hover:text-red-500 transition"><Heart size={14} /></button>
                    </div>

                    {/* Replies to this comment */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 ml-10 pl-3 border-l-2 border-gray-100 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <Avatar username={reply.username} size="w-6 h-6" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">
                                <span className="font-bold mr-2 text-gray-900">{reply.username}</span>
                                {reply.text}
                              </p>
                              <div className="text-[12px] text-gray-400 mt-0.5">
                                {new Date(reply.timestamp || Date.now()).toLocaleDateString()}
                              </div>
                            </div>
                            <button className="text-gray-300 hover:text-red-500 transition"><Heart size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Reply Input Box */}
                    {commentId === comment.id && (
                      <div className="mt-2 ml-10 flex items-center gap-2">
                        <CornerDownRight size={16} className="text-gray-400" />
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all">
                          <input 
                            type="text" 
                            value={message} 
                            disabled={commentLoading}
                            onChange={(e) => setMessage(e.target.value)} 
                            className="w-full bg-transparent text-sm outline-none placeholder-gray-400 text-gray-800" 
                            placeholder={`Reply to ${comment.username}...`}
                            onKeyDown={handleCommentReply}
                            autoFocus 
                          />
                          {commentLoading ?<LoaderCircle 
                            size={16} 
                             
                            className="text-gray-400 hover:text-gray-600 animate-spin flex-shrink-0 ml-2"
                          /> :
                          <CircleX 
                            size={16} 
                            onClick={() => { setCommentId(""); setMessage(""); }}  
                            className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0 ml-2"
                          />}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-4">
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstaPostCompo;