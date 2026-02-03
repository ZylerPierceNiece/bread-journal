import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthContext';
import { useToast } from '../components/Toast/ToastContext';
import Navbar from '../components/Navbar';
import BreadCard from '../components/BreadCard';
import EditProfileModal from '../components/EditProfileModal';
import FollowersModal from '../components/FollowersModal';
import UserAvatar from '../components/UserAvatar';

function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [profileUser, setProfileUser] = useState(null);
  const [breads, setBreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalType, setFollowersModalType] = useState(null);

  const isOwnProfile = currentUser.id === parseInt(id);

  useEffect(() => {
    fetchProfile();
    fetchUserBreads();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfileUser(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchUserBreads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/user/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch breads');

      const data = await response.json();
      setBreads(data);
    } catch (error) {
      console.error('Breads fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const token = localStorage.getItem('token');
      const method = profileUser.is_following ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${id}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Follow action failed');

      // Update profile to reflect new follow status
      setProfileUser(prev => ({
        ...prev,
        is_following: !prev.is_following,
        followers_count: prev.is_following ? prev.followers_count - 1 : prev.followers_count + 1
      }));
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDelete = async (breadId) => {
    if (!window.confirm('Are you sure you want to delete this bread?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/${breadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete bread');

      setBreads(breads.filter(b => b.id !== breadId));
      toast.success('Bread deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete bread');
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setProfileUser(prev => ({ ...prev, ...updatedUser }));
  };

  if (loading || !profileUser) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="profile-header">
          <UserAvatar user={profileUser} size="large" />
          <div className="profile-info">
            <h1>{profileUser.display_name || profileUser.username}</h1>
            <p className="username">@{profileUser.username}</p>
            {profileUser.bio && <p className="bio">{profileUser.bio}</p>}

            <div className="profile-stats">
              <div
                className="stat clickable"
                onClick={() => {
                  setFollowersModalType('followers');
                  setShowFollowersModal(true);
                }}
              >
                <strong>{profileUser.followers_count || 0}</strong>
                <span>Followers</span>
              </div>
              <div
                className="stat clickable"
                onClick={() => {
                  setFollowersModalType('following');
                  setShowFollowersModal(true);
                }}
              >
                <strong>{profileUser.following_count || 0}</strong>
                <span>Following</span>
              </div>
              <div className="stat">
                <strong>{breads.length}</strong>
                <span>Breads</span>
              </div>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="edit-profile-button"
              >
                Edit Profile
              </button>
            ) : (
              <div className="profile-actions">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`follow-button ${profileUser.is_following ? 'following' : ''}`}
                >
                  {followLoading ? 'Loading...' : profileUser.is_following ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => navigate(`/messages?user=${profileUser.id}`)}
                  className="message-button"
                >
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-breads">
          <h2>{isOwnProfile ? 'My Breads' : `${profileUser.display_name || profileUser.username}'s Breads`}</h2>

          {breads.length === 0 ? (
            <div className="empty-state">
              <p>{isOwnProfile ? 'You haven\'t posted any breads yet' : 'No breads to show'}</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {breads.map(bread => (
                <BreadCard
                  key={bread.id}
                  bread={bread}
                  onEdit={null}
                  onDelete={isOwnProfile ? handleDelete : null}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editingProfile && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setEditingProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {showFollowersModal && (
        <FollowersModal
          userId={id}
          type={followersModalType}
          onClose={() => setShowFollowersModal(false)}
        />
      )}
    </>
  );
}

export default ProfilePage;
