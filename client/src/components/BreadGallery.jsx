import React, { useState, useMemo } from 'react';
import BreadCard from './BreadCard';

function BreadGallery({ breads, onEdit, onDelete }) {
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');

  // Get unique bread types for filter
  const breadTypes = useMemo(() => {
    const types = [...new Set(breads.map(b => b.bread_type).filter(Boolean))];
    return types.sort();
  }, [breads]);

  // Filter and sort breads
  const displayedBreads = useMemo(() => {
    let filtered = breads;

    // Apply filter
    if (filterType !== 'all') {
      filtered = filtered.filter(bread => bread.bread_type === filterType);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.bake_date) - new Date(a.bake_date);
      } else if (sortBy === 'rating') {
        const avgA = [
          a.crust_rating,
          a.crumb_rating,
          a.taste_rating,
          a.texture_rating,
          a.appearance_rating
        ].reduce((sum, r) => sum + (r || 0), 0) / 5;

        const avgB = [
          b.crust_rating,
          b.crumb_rating,
          b.taste_rating,
          b.texture_rating,
          b.appearance_rating
        ].reduce((sum, r) => sum + (r || 0), 0) / 5;

        return avgB - avgA;
      }
      return 0;
    });

    return sorted;
  }, [breads, sortBy, filterType]);

  if (breads.length === 0) {
    return (
      <div className="empty-state">
        <h2>No breads yet!</h2>
        <p>Start your bread journey by adding your first bake above.</p>
      </div>
    );
  }

  return (
    <div className="bread-gallery">
      <div className="gallery-controls">
        <div className="control-group">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date (Newest First)</option>
            <option value="rating">Rating (Highest First)</option>
          </select>
        </div>

        {breadTypes.length > 0 && (
          <div className="control-group">
            <label htmlFor="filter">Filter by type:</label>
            <select
              id="filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {breadTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="gallery-grid">
        {displayedBreads.map(bread => (
          <BreadCard
            key={bread.id}
            bread={bread}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {displayedBreads.length === 0 && filterType !== 'all' && (
        <div className="empty-filter">
          <p>No breads found for type: {filterType}</p>
        </div>
      )}
    </div>
  );
}

export default BreadGallery;
