import React, { useState } from 'react';
import { useToast } from './Toast/ToastContext';
import RatingInput from './RatingInput';

function BreadForm({ onSubmit, onCancel, initialData = null }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    bread_type: initialData?.bread_type || '',
    bake_date: initialData?.bake_date || new Date().toISOString().split('T')[0],
    crust_rating: initialData?.crust_rating || 5,
    crumb_rating: initialData?.crumb_rating || 5,
    taste_rating: initialData?.taste_rating || 5,
    texture_rating: initialData?.texture_rating || 5,
    appearance_rating: initialData?.appearance_rating || 5,
    notes: initialData?.notes || '',
    recipe_notes: initialData?.recipe_notes || '',
    privacy: initialData?.privacy || 'followers'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.image_url || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!initialData && !imageFile) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      await onSubmit(submitData);
      // Reset form if it's a new bread
      if (!initialData) {
        setFormData({
          name: '',
          bread_type: '',
          bake_date: new Date().toISOString().split('T')[0],
          crust_rating: 5,
          crumb_rating: 5,
          taste_rating: 5,
          texture_rating: 5,
          appearance_rating: 5,
          notes: '',
          recipe_notes: '',
          privacy: 'followers'
        });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      toast.error('Error submitting form: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bread-form">
      <h2>{initialData ? 'Edit Bread' : 'Add New Bread'}</h2>

      <div className="form-group">
        <label htmlFor="name">Bread Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="e.g., My Sourdough Loaf"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bread_type">Bread Type</label>
        <input
          type="text"
          id="bread_type"
          name="bread_type"
          value={formData.bread_type}
          onChange={handleInputChange}
          placeholder="e.g., Sourdough, Baguette, Focaccia"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bake_date">Bake Date *</label>
        <input
          type="date"
          id="bake_date"
          name="bake_date"
          value={formData.bake_date}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="privacy">Privacy</label>
        <select
          id="privacy"
          name="privacy"
          value={formData.privacy}
          onChange={handleInputChange}
        >
          <option value="public">Public - Anyone can see</option>
          <option value="followers">Followers Only - Only people who follow you</option>
          <option value="private">Private - Only you</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="image">Bread Image {!initialData && '*'}</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}
      </div>

      <div className="ratings-section">
        <h3>Rate Your Bread</h3>
        <RatingInput
          label="Crust"
          name="crust_rating"
          value={formData.crust_rating}
          onChange={(value) => handleRatingChange('crust_rating', value)}
        />
        <RatingInput
          label="Crumb"
          name="crumb_rating"
          value={formData.crumb_rating}
          onChange={(value) => handleRatingChange('crumb_rating', value)}
        />
        <RatingInput
          label="Taste"
          name="taste_rating"
          value={formData.taste_rating}
          onChange={(value) => handleRatingChange('taste_rating', value)}
        />
        <RatingInput
          label="Texture"
          name="texture_rating"
          value={formData.texture_rating}
          onChange={(value) => handleRatingChange('texture_rating', value)}
        />
        <RatingInput
          label="Appearance"
          name="appearance_rating"
          value={formData.appearance_rating}
          onChange={(value) => handleRatingChange('appearance_rating', value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows="3"
          placeholder="How did it turn out? Any observations?"
        />
      </div>

      <div className="form-group">
        <label htmlFor="recipe_notes">Recipe Notes</label>
        <textarea
          id="recipe_notes"
          name="recipe_notes"
          value={formData.recipe_notes}
          onChange={handleInputChange}
          rows="3"
          placeholder="Recipe details, ingredients, process..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Bread' : 'Add Bread')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default BreadForm;
