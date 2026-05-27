import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { base_url } from "../components/utlis";

// THUNK
export const getUser = createAsyncThunk(
  "user/get",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token") || "";

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
  isError: "",
};
const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Pending
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.isError = "";
      })

      // Success
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.info = action.payload;
      })

      // Error
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError =
          action.payload;
      });
  },
});

export default userSlice.reducer;