import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../services/axiosClient";

const initialState = {
  registerLoading: false,
  registerSuccess: false,
  registerMessage: "",
  registerError: "",
  registeredEmail: "",

  verifyOtpLoading: false,
  verifyOtpSuccess: false,
  verifyOtpMessage: "",
  verifyOtpError: "",
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        password: formData.password,
      });

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/verify-register-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearRegisterState: (state) => {
      state.registerLoading = false;
      state.registerSuccess = false;
      state.registerMessage = "";
      state.registerError = "";
    },

    clearVerifyOtpState: (state) => {
      state.verifyOtpLoading = false;
      state.verifyOtpSuccess = false;
      state.verifyOtpMessage = "";
      state.verifyOtpError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerSuccess = false;
        state.registerMessage = "";
        state.registerError = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.registerSuccess = true;
        state.registerMessage =
          action.payload?.message ||
          "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.";
        state.registeredEmail = action.meta.arg.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerSuccess = false;
        state.registerError =
          action.payload || "Đăng ký thất bại, vui lòng thử lại.";
      })

      .addCase(verifyOtp.pending, (state) => {
        state.verifyOtpLoading = true;
        state.verifyOtpSuccess = false;
        state.verifyOtpMessage = "";
        state.verifyOtpError = "";
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.verifyOtpLoading = false;
        state.verifyOtpSuccess = true;
        state.verifyOtpMessage =
          action.payload?.message ||
          "Xác thực OTP thành công. Bạn có thể đăng nhập.";
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifyOtpLoading = false;
        state.verifyOtpSuccess = false;
        state.verifyOtpError =
          action.payload || "Xác thực OTP thất bại, vui lòng thử lại.";
      });
  },
});

export const { clearRegisterState, clearVerifyOtpState } = authSlice.actions;
export default authSlice.reducer;