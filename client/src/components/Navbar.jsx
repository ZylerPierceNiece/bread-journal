import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/unread/count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button
            onClick={() => navigate('/')}
            className="navbar-logo"
          >
            🍞 Bread Journal
          </button>

          <div className="navbar-links">
            <button
              onClick={() => navigate('/')}
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Feed
            </button>
            <button
              onClick={() => navigate('/my-breads')}
              className={`nav-link ${isActive('/my-breads') ? 'active' : ''}`}
            >
              + Add Bread
            </button>
            <button
              onClick={() => navigate('/messages')}
              className={`nav-link ${isActive('/messages') || location.pathname.startsWith('/messages') ? 'active' : ''}`}
            >
              Messages
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </button>
          </div>
        </div>

        <div className="navbar-center">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        <div className="navbar-right">
          <div className="user-menu">
            <button
              onClick={() => {
                if (user?.id) {
                  navigate(`/profile/${user.id}`);
                } else {
                  console.error('User ID not available:', user);
                }
              }}
              className="user-button"
            >
              {user?.display_name || user?.username || 'User'}
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
