import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthContext';
import { useToast } from '../components/Toast/ToastContext';
import Navbar from '../components/Navbar';
import UserAvatar from '../components/UserAvatar';

function MessagesPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserAndMessages(userId);
    }
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAndMessages = async (uid) => {
    try {
      const token = localStorage.getItem('token');

      // Fetch user info
      const userResponse = await fetch(`/api/users/${uid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setSelectedUser(userData);
      }

      // Fetch messages
      const messagesResponse = await fetch(`/api/messages/${uid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: selectedUser.id,
          content: newMessage
        })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage('');
        fetchConversations(); // Refresh conversations list
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleSelectConversation = (conversation) => {
    navigate(`/messages?user=${conversation.user_id}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading messages...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container messages-container">
        <div className="messages-layout">
          {/* Conversations List */}
          <div className="conversations-panel">
            <h2>Messages</h2>
            {conversations.length === 0 ? (
              <p className="no-conversations">No messages yet</p>
            ) : (
              <div className="conversations-list">
                {conversations.map(conv => (
                  <div
                    key={conv.user_id}
                    className={`conversation-item ${selectedUser?.id === conv.user_id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <UserAvatar user={conv} size="default" />
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <strong>{conv.display_name || conv.username}</strong>
                        {conv.unread_count > 0 && (
                          <span className="unread-badge">{conv.unread_count}</span>
                        )}
                      </div>
                      <p className="last-message">{conv.last_message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages Panel */}
          <div className="messages-panel">
            {selectedUser ? (
              <>
                <div className="messages-header">
                  <UserAvatar user={selectedUser} size="default" />
                  <h3>{selectedUser.display_name || selectedUser.username}</h3>
                </div>

                <div className="messages-list">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
                    >
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="message-input-form">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <button type="submit" disabled={!newMessage.trim()}>
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="no-conversation-selected">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MessagesPage;
