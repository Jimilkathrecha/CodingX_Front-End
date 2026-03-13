import { createSlice } from '@reduxjs/toolkit';
const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: true, theme: 'dark', globalLoading: false },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    setGlobalLoading: (state, action) => { state.globalLoading = action.payload; },
  }
});
export const { toggleSidebar, setSidebarOpen, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
