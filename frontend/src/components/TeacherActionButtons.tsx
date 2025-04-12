import React from 'react';

const TeacherActionButtons = ({ 
  onEdit, 
  onDelete, 
  teacherId, 
  isCurrentTeacher = false 
}) => {
  // Confirm before deletion
  const handleDelete = () => {
    if (window.confirm('確定要刪除此筆介聘資料嗎？此操作無法恢復。')) {
      onDelete(teacherId);
    }
  };

  return (
    <div className="teacher-actions">
      <button 
        className="edit-button"
        onClick={() => onEdit(teacherId)}
        aria-label="編輯介聘資料"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
        <span>編輯</span>
      </button>
      
      <button 
        className="delete-button"
        onClick={handleDelete}
        aria-label="刪除介聘資料"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
        <span>刪除</span>
      </button>
    </div>
  );
};

export default TeacherActionButtons;