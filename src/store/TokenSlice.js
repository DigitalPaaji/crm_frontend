import { createSlice } from "@reduxjs/toolkit";

const getToken = () => {
  return localStorage.getItem("token") || "";
};


const initialState = {
  token: getToken(),
};

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },

    removeToken: (state) => {
      state.token = "";
      localStorage.removeItem("token");
    },
  },
});

export const { setToken, removeToken } = tokenSlice.actions;

export default tokenSlice.reducer;