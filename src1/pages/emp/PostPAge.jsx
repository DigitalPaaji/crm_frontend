import { ExternalLink, Heart, ImageIcon, MessageCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import InstaPostCompo from '../../components/InstaPostCompo'

const PostPAge = () => {
const {loading,profile,error} = useSelector(state=>state.instaprofile)
const { token } = useSelector((state) => state.token);
const params = useParams();
const accountId = params.id;

const [postId,setPostId]=useState()


  return (
    <div className='relative'>
    {profile?.posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No posts available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
            {profile?.posts.map((post) => (
              <div
                key={post.id} 
               onClick={()=>setPostId(post.id)}
                className="group relative aspect-square bg-gray-100 overflow-hidden block"
              >
                



                {(post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM") &&
                 <img 
    src={post.media_url} 
    alt={post.caption || "Instagram Post"} 
    referrerPolicy="no-referrer" 
    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
  />
                
                }


                {post.media_type === "VIDEO"  && 
                 <img 
    src={post.thumbnail_url} 
    alt={post.caption || "Instagram Post"} 
    referrerPolicy="no-referrer" 
    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
  />
                
                }




          
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6">
                 
                 <div className='absolute top-2 left-2  px-2 text-sm rounded-sm font-medium bg-purple-300 text-purple-800'>
{post.media_type}
  </div>
                  <div className="flex items-center text-white font-bold">
                    <Heart className="w-6 h-6 mr-2 fill-white" />
                    {post.like_count}
                  </div>
                  <div className="flex items-center text-white font-bold">
                    <MessageCircle className="w-6 h-6 mr-2 fill-white" />
                    {post.comments_count}
                  </div>
                </div>

                <a
                 href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ExternalLink className="w-5 h-5 text-white drop-shadow-md" />
                </a>
              </div>
            ))}
          </div>
        )}

{postId && 
  <InstaPostCompo  postId={postId}  accountId={accountId} token={token} setPostId={setPostId} />
}


    </div>
  )
}

export default PostPAge