import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, subtext, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-container toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' ? '⚡' : '❌'}
      </div>
      <div className="toast-content">
        <h4>{message}</h4>
        {subtext && <p>{subtext}</p>}
      </div>
    </div>
  );
}
