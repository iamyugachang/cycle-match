import React, { useState, useEffect } from 'react';
import TeacherForm from './TeacherForm';
import { Teacher } from '../types';

interface EditTeacherFormProps {
  teacher: Teacher;
  onSubmit: (updatedTeacher: Teacher) => void;
  onCancel: () => void;
  loading: boolean;
  error: string;
}

const EditTeacherForm: React.FC<EditTeacherFormProps> = ({
  teacher,
  onSubmit,
  onCancel,
  loading,
  error
}) => {
  // Modify the current teacher year to display correctly
  const currentYear = new Date().getFullYear() - 1911;
  
  return (
    <div className="edit-teacher-form-container">
      <div className="edit-teacher-form-header">
        <h2 className="edit-teacher-form-title">編輯 {currentYear} 年度介聘資料</h2>
        <button 
          onClick={onCancel}
          className="cancel-edit-button"
          disabled={loading}
        >
          取消編輯
        </button>
      </div>
      
      <TeacherForm 
        onSubmit={onSubmit} 
        defaultEmail={teacher.email}
        initialData={teacher}
        isEditing={true}
      />
      
      {loading && <p className="loading-indicator">處理中...</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default EditTeacherForm;