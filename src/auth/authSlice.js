import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_USER, IS_DEMO } from 'config.js';

const initialState = {
  currentUser: IS_DEMO ? DEFAULT_USER : {},
  isLogin: false,
  // currentUser: {},
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
      state.isLogin = true;
    },
    logoutUser(state) {
      state.currentUser = {};
      state.isLogin = false;
      localStorage.clear('token');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
  },
});

export const { setCurrentUser, logoutUser } = authSlice.actions;
const authReducer = authSlice.reducer;

export default authReducer;
