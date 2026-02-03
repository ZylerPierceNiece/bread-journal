import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth/AuthContext';
import UserAvatar from './UserAvatar';
import WhoLikedModal from './WhoLikedModal';
import ImageCarousel from './ImageCarousel';

function BreadCard({ bread, onEdit, onDelete }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showWhoLiked, setShowWhoLiked] = useState(false);
  const [likesList, setLikesList] = useState([]);

  const ratings = {
    Crust: bread.crust_rating,
    Crumb: bread.crumb_rating,
    Taste: bread.taste_rating,
    Texture: bread.texture_rating,
    Appearance: bread.appearance_rating
  };

  const averageRating = (
    Object.values(ratings).reduce((sum, rating) => sum + (rating || 0), 0) /
    Object.values(ratings).filter(r => r).length
  ).toFixed(1);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch likes and comments data
  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [bread.id]);

  const fetchLikes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/${bread.id}/likes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.count);
        setLikesList(data.likes);
        setIsLiked(data.likes.some(like => like.user_id === user.id));
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleShowWhoLiked = () => {
    if (likesCount > 0) {
      setShowWhoLiked(true);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/${bread.id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setCommentsCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/breads/${bread.id}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likes_count);
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/${bread.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });
      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setCommentsCount(commentsCount + 1);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/${bread.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        setCommentsCount(commentsCount - 1);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${bread.name}"?`)) {
      onDelete(bread.id);
    }
  };

  return (
    <div className="bread-card">
      <div className="bread-image">
        <ImageCarousel
          images={
            bread.images && Array.isArray(bread.images) && bread.images.length > 0
              ? bread.images
              : bread.image_url
                ? [{ url: bread.image_url, order: 0 }]
                : []
          }
        />
      </div>

      <div className="bread-content">
        <h3>{bread.name}</h3>
        {bread.bread_type && <p className="bread-type">{bread.bread_type}</p>}
        <p className="bake-date">Baked on {formatDate(bread.bake_date)}</p>

        <div className="average-rating">
          <span className="rating-label">Average:</span>
          <span className="rating-score">{averageRating}/10</span>
        </div>

        <div className="ratings-grid">
          {Object.entries(ratings).map(([aspect, rating]) => (
            <div key={aspect} className="rating-item">
              <span className="aspect-name">{aspect}:</span>
              <span className="aspect-score">{rating || '-'}/10</span>
            </div>
          ))}
        </div>

        {(bread.notes || bread.recipe_notes) && (
          <button
            className="expand-button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
        )}

        {expanded && (
          <div className="bread-details">
            {bread.notes && (
              <div className="detail-section">
                <h4>Notes:</h4>
                <p>{bread.notes}</p>
              </div>
            )}
            {bread.recipe_notes && (
              <div className="detail-section">
                <h4>Recipe Notes:</h4>
                <p>{bread.recipe_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Likes and Comments Section */}
        <div className="bread-interactions">
          <button
            onClick={handleLike}
            className={`like-button ${isLiked ? 'liked' : ''}`}
          >
            {isLiked ? '❤️' : '🤍'} <span onClick={(e) => { e.stopPropagation(); handleShowWhoLiked(); }} className="likes-count">{likesCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="comment-button"
          >
            💬 {commentsCount}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="comments-section">
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <UserAvatar user={comment} size="small" />
                    <div className="comment-body">
                      <div className="comment-header">
                        <strong>{comment.display_name || comment.username}</strong>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                      {comment.user_id === user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="delete-comment-btn"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="add-comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
              />
              <button type="submit" className="submit-comment-btn">
                Post
              </button>
            </form>
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="card-actions">
            {onEdit && (
              <button onClick={() => onEdit(bread)} className="edit-button">
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={handleDelete} className="delete-button">
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {showWhoLiked && (
        <WhoLikedModal
          likes={likesList}
          onClose={() => setShowWhoLiked(false)}
        />
      )}
    </div>
  );
}

export default BreadCard;
