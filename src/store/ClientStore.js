import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { base_url } from "../components/utlis";


export const getClient = createAsyncThunk("/client/get",async(token,{rejectWithValue})=>{
    try {
         if (!token) {
        location.href="/#/loginclient"
        return;
      }

  const response = await fetch(`${base_url}/client/verifyclient`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data.user;



    } catch (error) {
        return rejectWithValue(
        error.message || "Something went wrong"
      );
    }
})

const initialState = {
  info: null,
  client:false,
  isLoading: false,
  isError: false,
};
const clientSlice = createSlice({
  name: "client",
  initialState,

 




    extraReducers: (builder) => {
    builder

      // Pending
      .addCase(getClient.pending, (state) => {
        state.isLoading = true;
        state.isError =false;
      })

      // Success
      .addCase(getClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.info = action.payload;
        state.client=true
      })

      // Error
      .addCase(getClient.rejected, (state, action) => {
        state.isLoading = false;
        state.isError =true
      });
  },
});

export default clientSlice.reducer;

