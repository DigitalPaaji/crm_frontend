import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { base_url } from "../components/utlis";

// THUNK
export const getUser = createAsyncThunk(
  "user/get",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
if(!token){
  thunkAPI.rejectWithValue("token not found");
}

      const response = await fetch(
        `${base_url}/auth/user/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.message);
      }

      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Something went wrong"
      );
    }
  }
);

const initialState = {
  info: null,
  isLoading: false,
  isError: false,
};
const userSlice = createSlice({
  name: "user",
  initialState,

 



  reducers:{
  addProfile: (state, action) => {
    
    state.info = {
      ...state.info,
      profile: action.payload,
    };
  },

  }
,

    extraReducers: (builder) => {
    builder

      // Pending
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.isError =false;
      })

      // Success
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.info = action.payload;
      })

      // Error
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError =true
      });
  },
});


export const {addProfile} = userSlice.actions;
export default userSlice.reducer;