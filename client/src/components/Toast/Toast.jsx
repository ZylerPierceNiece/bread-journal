import React from 'react';

function Toast({ message, type, onClose }) {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
}

export default Toast;
