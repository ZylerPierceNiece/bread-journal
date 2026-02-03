import React from 'react';

function UserAvatar({ user, size = 'default' }) {
  const getInitials = () => {
    if (!user) return '?';
    const name = user.display_name || user.username;
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={`user-avatar ${size} ${!user?.profile_picture ? 'initials' : ''}`}>
      {user?.profile_picture ? (
        <img src={user.profile_picture} alt={user.display_name || user.username} />
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );
}

export default UserAvatar;
