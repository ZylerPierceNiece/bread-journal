import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast/ToastContext';
import Navbar from '../components/Navbar';
import BreadCard from '../components/BreadCard';

function FeedPage() {
  const [breads, setBreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/feed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch feed');

      const data = await response.json();
      setBreads(data.breads);
    } catch (error) {
      console.error('Feed fetch error:', error);
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading your feed...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="feed-header">
          <h2>🍞 Your Bread Feed</h2>
          <p>See what your friends are baking</p>
        </div>

        {breads.length === 0 ? (
          <div className="empty-feed">
            <h3>Your feed is empty!</h3>
            <p>Follow other bakers to see their breads here.</p>
            <button
              onClick={() => {
                const input = prompt('Search for users:');
                if (input) navigate(`/search?q=${encodeURIComponent(input)}`);
              }}
              className="primary-button"
            >
              Find People to Follow
            </button>
          </div>
        ) : (
          <div className="feed-list">
            {breads.map(bread => (
              <div key={bread.id} className="feed-item">
                <div className="feed-item-header">
                  <div
                    className="feed-user"
                    onClick={() => navigate(`/profile/${bread.user_id}`)}
                  >
                    <div className="user-avatar-small">
                      {(bread.display_name || bread.username)[0].toUpperCase()}
                    </div>
                    <div className="feed-user-info">
                      <strong>{bread.display_name || bread.username}</strong>
                      <span className="username">@{bread.username}</span>
                    </div>
                  </div>
                  <span className="feed-date">
                    {new Date(bread.created_at).toLocaleDateString()}
                  </span>
                </div>
                <BreadCard
                  bread={bread}
                  onEdit={null}
                  onDelete={null}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default FeedPage;
