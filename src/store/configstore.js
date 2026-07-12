import { configureStore } from "@reduxjs/toolkit"
import token from "./TokenSlice"
import user from "./userSlice"
import instaprofile from "./instaProfile"
import client from "./ClientStore"
import subuser from "./SubClient"

const store = configureStore({
    reducer:{
token,
user,
instaprofile,
client,
subuser,
    }
})

export default store;