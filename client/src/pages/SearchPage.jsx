import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast/ToastContext';
import Navbar from '../components/Navbar';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(query || '');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchUsers(query);
    }
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

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

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="search-results">
          <form onSubmit={handleSearchSubmit} className="search-page-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for bakers..."
              className="search-page-input"
              autoFocus
            />
            <button type="submit" className="search-page-button">Search</button>
          </form>

          {loading && <p className="loading-text">Searching...</p>}

          {!loading && query && (
            <>
              <h2>Results for "{query}"</h2>
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
            </>
          )}

          {!loading && !query && (
            <div className="empty-state">
              <p>Type a name above to find people to follow.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchPage;
