import { createSlice } from "@reduxjs/toolkit";
const initialState ={
    client:null,
    user:null,
    token:null,
    isUser:false
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



    }
  }
})

export const {addUser} = SubuserSlice.actions;

export default SubuserSlice.reducer

