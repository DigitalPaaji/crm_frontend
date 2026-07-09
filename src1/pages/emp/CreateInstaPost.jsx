import React, { useState } from 'react'
import { CircleFadingPlus, Film, GalleryHorizontalEnd, ImagePlus, Video } from 'lucide-react'
import ImagePostCompo from '../../components/ImagePostCompo'
import VideoPostCompo from '../../components/VideoPostCompo'
import { useParams } from 'react-router-dom'
import { getInstaProfile } from '../../store/instaProfile'
import { useDispatch, useSelector } from 'react-redux'
import CreateInstaStory from './CreateInstaStory'

const CreateInstaPost = () => {
const [selectPost,setSelectPost]=useState("image")
const params = useParams();
 const dispatch = useDispatch();
  const accountId = params.id;
    const { token } = useSelector((state) => state.token);
const typesPost=[
  {name:"image",icon:ImagePlus},
  {name:"video",icon:Video},
  {name:"story",icon:CircleFadingPlus},
  {name:"reel",icon:Film},
  {name:"carousel",icon:GalleryHorizontalEnd},
]

const handelGet=()=>{
  dispatch(getInstaProfile({ token, id: accountId }));
}

return (
  <div className='flex gap-2'>
<div className='flex flex-col gap-3'>
  {typesPost.map((item,index)=><div key={index} onClick={()=>setSelectPost(item.name)} className={` p-2 cursor-pointer flex flex-col items-center
         ${selectPost===item.name ? "bg-black text-white" :""}
  `
  }>
    <item.icon />
    <p>{item.name}</p>

    </div>
    )}
</div>

<div className='flex-1  bg-red-300'>

{selectPost == "image" && <ImagePostCompo  accountId={accountId} token={token} handelGet={handelGet}/>

}

{selectPost == "video" && <VideoPostCompo  accountId={accountId} token={token} handelGet={handelGet} media_type={"VIDEO"} />

}


{selectPost == "reel" && <VideoPostCompo  accountId={accountId} token={token} handelGet={handelGet} media_type={"REEL"} />

}
{selectPost == "story" && <CreateInstaStory  accountId={accountId} token={token} handelGet={handelGet} media_type={"REEL"} />

}


</div>




</div>
  )
}

export default CreateInstaPost