import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../services/api/axiosClient";

const initialState = {
  posts: [],
  savedPosts: [],
  post: null,
  loading: true,
  loadingMore: false,
  error: null,
  page: 1,
  hasMore: true,
};

// Async thunk: Lấy tất cả bài viết (GET /api/posts)
export const getPosts = createAsyncThunk(
  "post/getPosts",
  async ({ page = 1, limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/posts?page=${page}&limit=${limit}`);
      return response.data;
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

export const savePost = createAsyncThunk(
  "post/savePost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/posts/save/${postId}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Lỗi khi lưu bài viết"
      );
    }
  }
);

export const getSavedPosts = createAsyncThunk(
  "post/getSavedPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/posts/saved");
      return response.data?.data || response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Lỗi khi tải bài viết đã lưu"
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
      .addCase(getPosts.pending, (state, action) => {
        const isLoadMore = action.meta.arg?.page > 1;
        if (isLoadMore) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        
        const payloadData = action.payload;
        // Kiểm tra xem backend đã trả đúng format phân trang chưa
        const newPosts = payloadData.data ? payloadData.data : (Array.isArray(payloadData) ? payloadData : []);
        
        const isLoadMore = action.meta.arg?.page > 1;
        
        if (isLoadMore) {
          state.posts = [...state.posts, ...newPosts]; // Append
        } else {
          state.posts = newPosts; // Overwrite
        }
        
        // Cập nhật page và hasMore
        state.page = payloadData.page !== undefined ? payloadData.page : (action.meta.arg?.page || 1);
        state.hasMore = payloadData.hasMore !== undefined ? payloadData.hasMore : (newPosts.length === (action.meta.arg?.limit || 5));
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
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
      })
            // SAVE / UNSAVE POST
      .addCase(savePost.pending, (state) => {
        state.error = null;
      })
      .addCase(savePost.fulfilled, (state, action) => {
        const { postId, isSaved } = action.payload;

        state.posts = state.posts.map((post) =>
          post._id === postId ? { ...post, isSaved } : post
        );

        if (state.post && state.post._id === postId) {
          state.post.isSaved = isSaved;
        }

        if (!isSaved) {
          state.savedPosts = state.savedPosts.filter(
            (post) => post._id !== postId
          );
        }
      })
      .addCase(savePost.rejected, (state, action) => {
        state.error = action.payload;
      })

      // GET SAVED POSTS
      .addCase(getSavedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPosts = action.payload;
      })
      .addCase(getSavedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPostError } = postSlice.actions;
export default postSlice.reducer;
