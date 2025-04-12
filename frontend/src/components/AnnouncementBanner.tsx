import React, { useState } from 'react';

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="announcement-banner">
      <div className="announcement-content">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="announcement-icon"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span className="announcement-text">
          請提供正確資料，本平台僅協助配對，不查核資訊真實性。錯誤資料將影響其他教師的配對機會，謝謝合作。
        </span>
      </div>
      <button 
        className="announcement-close" 
        onClick={() => setIsVisible(false)}
        aria-label="關閉公告"
      >
        &times;
      </button>
    </div>
  );
};

export default AnnouncementBanner;