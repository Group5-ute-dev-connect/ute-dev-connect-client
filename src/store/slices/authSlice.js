import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: '',
  step: 1, // 1: Input email, 2: Input OTP & New Password
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    resetAuth: (state) => {
      state.email = '';
      state.step = 1;
    },
  },
});

export const { setEmail, setStep, resetAuth } = authSlice.actions;
export default authSlice.reducer;
