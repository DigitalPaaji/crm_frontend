import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { base_url } from "../components/utlis";
// import { base_url } from "../components/utlis";


export const getInstaProfile = createAsyncThunk(
  "profile/getInstaProfile",
  async ({ token, id }, thunkAPI) => {
    try {
      const response = await fetch(
        `${base_url}/insta/get-account/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(data);
      }
       
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);



// INITIAL STATE
const initialState = {
  profile: null,
  loading: false,
  error: null,
};



// SLICE
const profileSlice = createSlice({
  name: "instaprofile",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getInstaProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInstaProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getInstaProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});



export default profileSlice.reducer;