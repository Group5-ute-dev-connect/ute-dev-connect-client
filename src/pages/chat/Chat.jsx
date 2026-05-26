import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import './Chat.css';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';
import { getConversations, getMessages, setActiveConversation, addMessage } from '../../store/chatSlice';

const SOCKET_URL = 'http://localhost:5000';

const Chat = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  
  const chatState = useSelector(state => state.chat) || {};
  const conversations = Array.isArray(chatState.conversations) ? chatState.conversations : [];
  const messages = Array.isArray(chatState.messages) ? chatState.messages : [];
  const activeConversationId = chatState.activeConversationId || null;
  
  const token = useSelector(state => state.auth?.token);
  
  // Lấy ID user hiện tại từ token JWT
  let currentUserId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.user?.id || payload.id;
    } catch (e) {
      console.error("Lỗi parse token:", e);
    }
  }

  console.log("ChatState:", chatState);
  console.log("currentUserId:", currentUserId);

  // 1. Khởi tạo Socket và Fetch danh sách Conversations ban đầu
  useEffect(() => {
    dispatch(getConversations());

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('✅ Đã kết nối Socket.IO tới server!');
      if (currentUserId) {
        socketRef.current.emit('setup', currentUserId);
      }
    });

    socketRef.current.on('receive_message', (newMessage) => {
      // Bắn action vào Redux để cập nhật UI
      dispatch(addMessage(newMessage));
      
      // Nếu có tin nhắn mới, ta dispatch getConversations để đảm bảo 
      // conversation list luôn được cập nhật (trong trường hợp đây là conversation mới tinh)
      dispatch(getConversations());
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [dispatch]);

  // 2. Lắng nghe thay đổi phòng chat -> Fetch Messages & Join Socket Room
  useEffect(() => {
    if (activeConversationId) {
      dispatch(getMessages(activeConversationId));
      if (socketRef.current) {
        socketRef.current.emit('join_room', activeConversationId);
      }
    }
  }, [activeConversationId, dispatch]);

  const handleSelectConversation = (convId) => {
    dispatch(setActiveConversation(convId));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeConversationId) return;
    
    const messageData = {
      conversationId: activeConversationId,
      senderId: currentUserId,
      text: inputValue
    };

    // Gửi lên server qua socket
    socketRef.current.emit('send_message', messageData);
    setInputValue('');
  };

  // Helper tìm thông tin người chat cùng
  const getOtherParticipant = (participants) => {
    if (!Array.isArray(participants)) return null;
    return participants.find(p => p && p._id !== currentUserId) || participants[0];
  };

  const activeConversation = conversations.find(c => c && c._id === activeConversationId);
  const otherUser = activeConversation ? getOtherParticipant(activeConversation.participants) : null;

  return (
    <div className="chat-container">
      <div className="chat-wrapper">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span>Tin nhắn</span>
            <MoreVertical size={20} color="#666" style={{cursor: 'pointer'}} />
          </div>
          <div className="chat-search-bar">
            <input type="text" placeholder="Tìm kiếm trên Messenger..." />
          </div>
          <div className="chat-conversation-list">
            {conversations.map((conv, idx) => {
              if (!conv) return null;
              const participant = getOtherParticipant(conv.participants);
              const isActive = conv._id === activeConversationId;
              
              return (
                <div 
                  className={`conversation-item ${isActive ? 'active' : ''}`} 
                  key={conv._id || idx}
                  onClick={() => handleSelectConversation(conv._id)}
                >
                  <img src={participant?.avatar || 'https://via.placeholder.com/50'} alt="Avatar" className="avatar" />
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">{participant?.name || 'Người dùng ẩn danh'}</span>
                    </div>
                    <div className="conversation-last-message">
                      {conv.lastMessage ? (conv.lastMessage.text || 'Tin nhắn đính kèm') : 'Chưa có tin nhắn...'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {activeConversationId && otherUser ? (
            <>
              <div className="chat-main-header">
                <img src={otherUser.avatar || 'https://via.placeholder.com/50'} alt="Avatar" className="avatar" />
                <div className="chat-main-info" style={{ flex: 1 }}>
                  <div className="name">{otherUser.name || 'Người dùng'}</div>
                  <div className="status">Đang hoạt động</div>
                </div>
                <div style={{ display: 'flex', gap: '20px', color: '#0084ff' }}>
                  <Phone size={24} style={{cursor: 'pointer'}} />
                  <Video size={24} style={{cursor: 'pointer'}} />
                  <MoreVertical size={24} style={{cursor: 'pointer'}} color="#666" />
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg, idx) => {
                  if (!msg) return null;
                  const isMe = msg.sender?._id === currentUserId || msg.sender === currentUserId;
                  return (
                    <div key={msg._id || idx} className={`message-bubble ${isMe ? 'message-sent' : 'message-received'}`}>
                      {msg.text}
                    </div>
                  );
                })}
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Nhập tin nhắn..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" className="send-button" title="Gửi tin nhắn">
                  <Send />
                </button>
              </form>
            </>
          ) : (
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>
              Chọn một cuộc trò chuyện để bắt đầu nhắn tin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
