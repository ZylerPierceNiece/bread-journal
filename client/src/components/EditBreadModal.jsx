import React, { useState } from 'react';
import { useToast } from './Toast/ToastContext';
import BreadForm from './BreadForm';

function EditBreadModal({ bread, onClose, onUpdate }) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/${bread.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update bread');

      const updatedBread = await response.json();
      onUpdate(updatedBread);
      toast.success('Bread updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating bread:', error);
      toast.error('Failed to update bread');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Bread</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <BreadForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={bread}
          isEditing={true}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export default EditBreadModal;
