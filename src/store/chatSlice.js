import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../services/api/axiosClient";

export const getConversations = createAsyncThunk(
  "chat/getConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/chat/conversations');
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi lấy danh sách phòng chat");
    }
  }
);

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/chat/${conversationId}/messages`);
      return { conversationId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi lấy tin nhắn");
    }
  }
);

export const createOrGetConversation = createAsyncThunk(
  "chat/createOrGetConversation",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/chat/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi tạo phòng chat");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    activeConversationId: null,
    messages: [],
    loading: false
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    addMessage: (state, action) => {
      // Chỉ push vào mảng nếu tin nhắn thuộc về room hiện tại
      if (action.payload.conversationId === state.activeConversationId) {
        state.messages.push(action.payload);
      }
      
      // Cập nhật lastMessage cho conversation tương ứng
      const convIndex = state.conversations.findIndex(c => c._id === action.payload.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = action.payload;
        // Đưa conversation này lên đầu mảng
        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Redux getConversations Fulfilled with Payload:", action.payload);
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        console.error("Redux getConversations Error:", action.payload);
      })
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.activeConversationId = action.payload.conversationId;
      })
      .addCase(createOrGetConversation.fulfilled, (state, action) => {
        // Kiểm tra xem conversation đã tồn tại trong mảng chưa
        const exists = state.conversations.find(c => c._id === action.payload._id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
        state.activeConversationId = action.payload._id;
      });
  }
});

export const { setActiveConversation, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
