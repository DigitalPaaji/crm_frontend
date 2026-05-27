import React, { useEffect } from 'react'
import Loader from '../components/Loader'
import { useNavigate } from 'react-router-dom'
import { base_url } from '../components/utlis'
import { useDispatch } from 'react-redux'
import { getUser } from '../store/userSlice'

const HomePage = () => {
const navigation = useNavigate()
const dispach =useDispatch() 

const fetchUser= async(token)=>{
    try {
    const response = await fetch(`${base_url}/auth/user/verify`,{
        method:"GET",
         headers: {
    Authorization: `Bearer ${token}`,
  },
    })    

 const data  = await response.json();

 if(data.success){

navigation(`/${data.user.role}`)
dispach(getUser())

 }else{
navigation("/login")
 }





    
    } catch (error) {
       navigation("/login") 
    }
}


    useEffect(()=>{
const token =  localStorage.getItem("token")
 
if(!token){
navigation("/login")
return 
}


fetchUser(token)



    },[])



  return (
  <>
  <Loader />
  </>
  )
}

export default HomePage