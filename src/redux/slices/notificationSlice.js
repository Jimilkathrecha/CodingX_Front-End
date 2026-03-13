// src/redux/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications?limit=20');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.patch('/notifications/read-all');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.loading = false;
      })
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.items.find(n => n._id === action.payload);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      });
  }
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

// ── src/redux/slices/uiSlice.js ───────────────────────────────────────────────
import { createSlice as createUISlice } from '@reduxjs/toolkit';

const uiSlice = createUISlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    theme: 'dark',
    globalLoading: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    setGlobalLoading: (state, action) => { state.globalLoading = action.payload; },
  }
});

export const { toggleSidebar, setSidebarOpen, setGlobalLoading } = uiSlice.actions;
const uiReducer = uiSlice.reducer; 
