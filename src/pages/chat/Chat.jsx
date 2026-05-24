import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Quốc Khánh', lastMessage: 'Tính năng web socket ok chưa?', time: '10:30', avatar: 'https://i.pravatar.cc/150?img=11', active: true },
  { id: 2, name: 'Nguyễn Văn A', lastMessage: 'Bản báo cáo này ổn chưa?', time: 'Hôm qua', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, name: 'Lê Hoàng C', lastMessage: 'Ok chốt nhé.', time: 'T2', avatar: 'https://i.pravatar.cc/150?img=33' },
];

const MOCK_MESSAGES = [
  { id: 1, text: 'Chào bạn, dạo này khỏe không?', sender: 'them', time: '10:00' },
  { id: 2, text: 'Mình khỏe, cảm ơn bạn. Đồ án đến đâu rồi?', sender: 'me', time: '10:05' },
  { id: 3, text: 'Vẫn ổn bạn ạ. Đang test thử cái giao diện Chat realtime xem lên hình đẹp chưa.', sender: 'them', time: '10:10' },
  { id: 4, text: 'Ok, để mình bật console xem socket có log "User connected" chưa.', sender: 'me', time: '10:15' },
];

const Chat = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Khởi tạo kết nối Socket tới backend
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('✅ Đã kết nối Socket.IO tới server thành công! Socket ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Đã ngắt kết nối khỏi server');
    });

    // Cleanup khi rời khỏi component (để tránh rò rỉ bộ nhớ hoặc kết nối ảo)
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Thêm tin nhắn vào giao diện tĩnh (chưa lưu db)
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div className="chat-container">
      <div className="chat-wrapper">
        {/* Sidebar hiển thị danh sách cuộc trò chuyện */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span>Tin nhắn</span>
            <MoreVertical size={20} color="#666" style={{cursor: 'pointer'}} />
          </div>
          <div className="chat-search-bar">
            <input type="text" placeholder="Tìm kiếm trên Messenger..." />
          </div>
          <div className="chat-conversation-list">
            {MOCK_CONVERSATIONS.map(conv => (
              <div className={`conversation-item ${conv.active ? 'active' : ''}`} key={conv.id}>
                <img src={conv.avatar} alt={conv.name} className="avatar" />
                <div className="conversation-info">
                  <div className="conversation-header">
                    <span className="conversation-name">{conv.name}</span>
                    <span className="conversation-time">{conv.time}</span>
                  </div>
                  <div className="conversation-last-message">{conv.lastMessage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khu vực hiển thị tin nhắn chính */}
        <div className="chat-main">
          <div className="chat-main-header">
            <img src={MOCK_CONVERSATIONS[0].avatar} alt="Avatar" className="avatar" />
            <div className="chat-main-info" style={{ flex: 1 }}>
              <div className="name">{MOCK_CONVERSATIONS[0].name}</div>
              <div className="status">Đang hoạt động</div>
            </div>
            <div style={{ display: 'flex', gap: '20px', color: '#0084ff' }}>
              <Phone size={24} style={{cursor: 'pointer'}} />
              <Video size={24} style={{cursor: 'pointer'}} />
              <MoreVertical size={24} style={{cursor: 'pointer'}} color="#666" />
            </div>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'message-sent' : 'message-received'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Ô nhập tin nhắn */}
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
        </div>
      </div>
    </div>
  );
};

export default Chat;
