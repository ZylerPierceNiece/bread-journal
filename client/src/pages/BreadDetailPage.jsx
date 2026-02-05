import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthContext';
import { useToast } from '../components/Toast/ToastContext';
import Navbar from '../components/Navbar';
import BreadCard from '../components/BreadCard';
import EditBreadModal from '../components/EditBreadModal';

function BreadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [bread, setBread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBread, setEditingBread] = useState(null);

  useEffect(() => {
    fetchBread();
  }, [id]);

  const fetchBread = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Bread not found');
      }

      const data = await response.json();
      setBread(data);
    } catch (error) {
      console.error('Fetch bread error:', error);
      toast.error('Failed to load bread');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bread) => {
    setEditingBread(bread);
  };

  const handleBreadUpdate = (updatedBread) => {
    setBread(updatedBread);
    setEditingBread(null);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this bread?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/breads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete bread');

      toast.success('Bread deleted successfully!');
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete bread');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading bread...</div>
      </>
    );
  }

  if (!bread) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Bread not found</p>
        </div>
      </>
    );
  }

  const isOwner = user && user.id === bread.user_id;

  return (
    <>
      <Navbar />
      <div className="container bread-detail-page">
        <div className="bread-detail-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <button onClick={handleShare} className="share-button">
            🔗 Share
          </button>
        </div>

        <BreadCard
          bread={bread}
          onEdit={isOwner ? handleEdit : null}
          onDelete={isOwner ? handleDelete : null}
          enableLightbox={true}
        />
      </div>

      {editingBread && (
        <EditBreadModal
          bread={editingBread}
          onClose={() => setEditingBread(null)}
          onUpdate={handleBreadUpdate}
        />
      )}
    </>
  );
}

export default BreadDetailPage;
