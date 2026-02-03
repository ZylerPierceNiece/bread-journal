import React from 'react';

function RatingInput({ label, value, onChange, name }) {
  return (
    <div className="rating-input">
      <label htmlFor={name}>
        {label}: <span className="rating-value">{value || '-'}/10</span>
      </label>
      <input
        type="range"
        id={name}
        name={name}
        min="1"
        max="10"
        value={value || 5}
        onChange={(e) => onChange(e.target.value)}
        className="rating-slider"
      />
      <div className="rating-labels">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}

export default RatingInput;
