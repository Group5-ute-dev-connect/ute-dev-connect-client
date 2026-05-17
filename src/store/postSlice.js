import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../services/api/axiosClient";

// State khởi tạo (tham khảo devconnector: posts, post, loading, error)
const initialState = {
  posts: [],
  post: null,
  loading: true,
  error: null,
};

// Async thunk: Lấy tất cả bài viết (GET /api/posts)
export const getPosts = createAsyncThunk(
  "post/getPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/posts");
      // response đã qua interceptor => response.data (nếu interceptor trả response.data)
      // hoặc response trực tiếp
      const postsData = response.data?.data || response.data || response;
      return postsData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Lỗi khi tải bài viết"
      );
    }
  }
);

// Async thunk: Lấy bài viết theo ID (GET /api/posts/:id)
export const getPost = createAsyncThunk(
  "post/getPost",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/posts/${id}`);
      const postData = response.data?.data || response.data || response;
      return postData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Lỗi khi tải bài viết"
      );
    }
  }
);

// Async thunk: Tạo bài viết mới (POST /api/posts)
export const addPost = createAsyncThunk(
  "post/addPost",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/posts", formData);
      const postData = response.data?.data || response.data || response;
      return postData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Lỗi khi tạo bài viết"
      );
    }
  }
);

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL POSTS
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET SINGLE POST
      .addCase(getPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPost.fulfilled, (state, action) => {
        state.loading = false;
        state.post = action.payload;
      })
      .addCase(getPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD POST
      .addCase(addPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPostError } = postSlice.actions;
export default postSlice.reducer;
