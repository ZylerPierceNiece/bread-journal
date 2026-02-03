import React, { useState } from 'react';
import { useToast } from './Toast/ToastContext';

function EditProfileModal({ user, onClose, onUpdate }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    display_name: user.display_name || '',
    bio: user.bio || ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(user.profile_picture || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      let updatedUser;

      // Upload profile picture if changed
      if (profilePicture) {
        const pictureFormData = new FormData();
        pictureFormData.append('profile_picture', profilePicture);

        const pictureResponse = await fetch('/api/users/profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: pictureFormData
        });

        if (!pictureResponse.ok) throw new Error('Failed to upload profile picture');
        updatedUser = await pictureResponse.json();
      }

      // Update profile info
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      updatedUser = await response.json();
      onUpdate(updatedUser);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="profile_picture">Profile Picture</label>
            <input
              type="file"
              id="profile_picture"
              accept="image/*"
              onChange={handleImageChange}
            />
            {profilePicturePreview && (
              <div className="profile-picture-preview">
                <img src={profilePicturePreview} alt="Profile preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="display_name">Display Name</label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="How should we call you?"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about yourself and your bread journey..."
              maxLength="500"
            />
            <small className="char-count">{formData.bio.length}/500</small>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
