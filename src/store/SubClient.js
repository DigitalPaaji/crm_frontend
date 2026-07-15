import { createSlice } from "@reduxjs/toolkit";
const initialState ={
    client:null,
    user:null,
    token:null,
    isUser:false,
    isClient:false
}

const SubuserSlice = createSlice({
  initialState  ,
  name:"/get/subuser",
  reducers:{
    addUser:(state,action)=>{
        state.isUser=true;
        state.client= action.payload.client
        state.user= action.payload.user
        state.token= action.payload.token
        state.isClient= action.payload?.isClient || false


    }
  }
})

export const {addUser} = SubuserSlice.actions;

export default SubuserSlice.reducer

