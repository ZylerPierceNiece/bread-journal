import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

function FollowersModal({ userId, type, onClose }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'followers'
        ? `/api/users/${userId}/followers`
        : `/api/users/${userId}/following`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (clickedUserId) => {
    onClose();
    navigate(`/profile/${clickedUserId}`);
  };

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content followers-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="followers-list">
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : users.length === 0 ? (
            <p className="no-users">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          ) : (
            users.map(user => (
              <div
                key={user.id}
                className="follower-item"
                onClick={() => handleUserClick(user.id)}
              >
                <UserAvatar user={user} size="default" />
                <div className="follower-info">
                  <strong>{user.display_name || user.username}</strong>
                  <span className="username">@{user.username}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowersModal;
