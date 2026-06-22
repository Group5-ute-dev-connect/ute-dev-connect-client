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

  loginLoading: false,
  loginSuccess: false,
  loginMessage: "",
  loginError: "",
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,

  email: "",
  step: 1,
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

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Lưu token và role vào localStorage
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      if (response.role) {
        localStorage.setItem("role", response.role);
      }

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

    clearLoginState: (state) => {
      state.loginLoading = false;
      state.loginSuccess = false;
      state.loginMessage = "";
      state.loginError = "";
    },

    logout: (state) => {
      state.token = null;
      state.role = null;
      state.loginSuccess = false;
      state.loginMessage = "";
      state.loginError = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
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
      })

      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginSuccess = false;
        state.loginMessage = "";
        state.loginError = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.loginSuccess = true;
        state.loginMessage =
          action.payload?.message || "Đăng nhập thành công!";
        state.token = action.payload?.token || null;
        state.role = action.payload?.role || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginSuccess = false;
        state.loginError =
          action.payload || "Đăng nhập thất bại, vui lòng thử lại.";
      });
  },
});

export const { clearRegisterState, clearVerifyOtpState, setEmail, setStep, resetAuth, clearLoginState, logout } = authSlice.actions;
export default authSlice.reducer;