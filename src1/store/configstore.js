import { configureStore } from "@reduxjs/toolkit"
import token from "./TokenSlice"
import user from "./userSlice"
import instaprofile from "./instaProfile"
const store = configureStore({
    reducer:{
token,
user,
instaprofile
    }
})

export default store;