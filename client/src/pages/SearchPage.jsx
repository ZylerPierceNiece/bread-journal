import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast/ToastContext';
import Navbar from '../components/Navbar';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (query) {
      searchUsers(query);
    }
  }, [query]);

  const searchUsers = async (searchQuery) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Searching...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="search-results">
          <h2>Search Results for "{query}"</h2>

          {users.length === 0 ? (
            <div className="empty-state">
              <p>No users found matching "{query}"</p>
            </div>
          ) : (
            <div className="users-list">
              {users.map(user => (
                <div
                  key={user.id}
                  className="user-card"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <div className="user-avatar">
                    {(user.display_name || user.username)[0].toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{user.display_name || user.username}</h3>
                    <p className="username">@{user.username}</p>
                    {user.bio && <p className="bio">{user.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchPage;
