import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

function WhoLikedModal({ likes, onClose }) {
  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content who-liked-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Liked by {likes.length} {likes.length === 1 ? 'person' : 'people'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="who-liked-list">
          {likes.length === 0 ? (
            <p className="no-likes">No likes yet</p>
          ) : (
            likes.map(like => (
              <div
                key={like.id}
                className="who-liked-item"
                onClick={() => handleUserClick(like.user_id)}
              >
                <UserAvatar user={like} size="default" />
                <div className="who-liked-info">
                  <strong>{like.display_name || like.username}</strong>
                  <span className="username">@{like.username}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WhoLikedModal;
