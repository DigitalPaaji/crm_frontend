import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { base_url } from "../components/utlis";

export const fetchTodayFollowup = createAsyncThunk(
  "todayFollowup/fetch",
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${base_url}/leadclient/todayfolloup/get`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Unable to fetch today's follow-ups"
        );
      }

      return {
        leads: Array.isArray(data.leads) ? data.leads : [],
        count: Number(data.count) || 0,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  }
);

const initialState = {
  leads: [],
  count: 0,
  toggle: false,
  loading: false,
  error: null,
};

const todayFollowUpLeadsSlice = createSlice({
  name: "todayLeads",
  initialState,

  reducers: {
    closeTodayFollowup: (state) => {
      state.toggle = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayFollowup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTodayFollowup.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload.count;
        state.leads = action.payload.leads;
        state.toggle = action.payload.count > 0;
      })

      .addCase(fetchTodayFollowup.rejected, (state, action) => {
        state.loading = false;
        state.toggle = false;
        state.error =
          action.payload || "Unable to fetch today's follow-ups";
      });
  },
});

export const {
  closeTodayFollowup,
} = todayFollowUpLeadsSlice.actions;

export default todayFollowUpLeadsSlice.reducer;

