import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useParams } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  ExternalLink, 
  Image as ImageIcon, 
  Grid,
  Activity,
  User,
  Mails,
  SignpostBig,
} from 'lucide-react';
import { base_url } from '../../components/utlis';
import { getInstaProfile } from '../../store/instaProfile';

const InstaPage = () => {

  const dispatch=useDispatch()
  const { token } = useSelector((state) => state.token);
  const { id } = useParams();
const gridlinks = [
  {link:"",icon:Grid,name:"POSTS" },
  {link:"post/create",icon:SignpostBig,name:"Create Post"},
  {link:"messages",icon:Mails ,name:"Messages"},
]

  const {loading,profile,error} = useSelector(state=>state.instaprofile)

  useEffect(() => { 
    dispatch(getInstaProfile({token,id}))
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !profile?.profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-500">
        <p>{error || "Account not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
       
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
           
      {profile.profile.profile_picture_url?   <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-1 flex-shrink-0"> 
<img src={profile.profile.profile_picture_url} className='rounded-full' alt="" />


      </div>:      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-1 flex-shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-3xl font-bold text-gray-700 uppercase">
                  {profile.profile.username.charAt(0)}
                </span>
              </div>
            </div>
            }

          
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.profile.username}
                </h1>
                {profile.account?.isActive && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 self-center md:self-auto">
                    <Activity className="w-3 h-3 mr-1" /> Active
                  </span>
                )}
              </div>

             
              <div className="flex justify-center md:justify-start gap-6 md:gap-10 mb-4">
                <div className="text-center md:text-left">
                  <span className="font-bold text-gray-900 block md:inline text-lg">
                    {profile.profile.media_count}
                  </span>
                  <span className="text-gray-500 ml-1">posts</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-bold text-gray-900 block md:inline text-lg">
                    {profile.profile.followers_count}
                  </span>
                  <span className="text-gray-500 ml-1">followers</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-bold text-gray-900 block md:inline text-lg">
                    {profile.profile.follows_count}
                  </span>
                  <span className="text-gray-500 ml-1">following</span>
                </div>
              </div>

              <div className="mb-2">
                <h2 className="font-semibold text-gray-900">{profile.profile.name}</h2>
              </div>
              
          
              <div className="flex items-center justify-center md:justify-start text-xs text-gray-400 mt-4">
                <User className="w-3 h-3 mr-1" />
                <span>Added by {profile.account?.createdBy?.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8 justify-center border-t border-gray-200 pt-4">
          {

gridlinks.map((item,ind)=>
<Link to={item.link} key={ind}   className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-900 border-t-2 border-gray-900 -mt-[18px] pt-4 px-2">
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>)
          }

          
        </div>
<Outlet />

      </div> 
    </div>
  );
};

export default InstaPage;