import React from 'react';
import { Teacher } from '../types';
import EditTeacherForm from './EditTeacherForm';
import TeacherProfileCard from './TeacherProfileCard';

interface TeacherProfilePageProps {
  teachers: Teacher[];
  currentTeacherId?: number;
  editingTeacher: Teacher | null;
  loading: boolean;
  error: string;
  onEditTeacher: (teacherId: number) => void;
  onDeleteTeacher: (teacherId: number) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onCancelEdit: () => void;
  onShowResults: () => void;
}

const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({
  teachers,
  currentTeacherId,
  editingTeacher,
  loading,
  error,
  onEditTeacher,
  onDeleteTeacher,
  onUpdateTeacher,
  onCancelEdit,
  onShowResults
}) => {
  // If no teachers, show empty state
  if (teachers.length === 0) {
    return (
      <div className="teacher-profile-empty">
        <h2>您尚未登記任何介聘資料</h2>
        <p>請返回首頁填寫介聘資料</p>
      </div>
    );
  }

  // If in edit mode, show the edit form
  if (editingTeacher) {
    return (
      <EditTeacherForm
        teacher={editingTeacher}
        onSubmit={onUpdateTeacher}
        onCancel={onCancelEdit}
        loading={loading}
        error={error}
      />
    );
  }

  // Otherwise show all teacher profiles
  return (
    <div className="teacher-profile-page">
      <div className="teacher-profile-header">
        <h2>我的介聘資料</h2>
        <button 
          className="view-matches-button"
          onClick={onShowResults}
        >
          查看配對結果
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="teacher-profile-list">
        {teachers.map(teacher => (
          <TeacherProfileCard
            key={teacher.id}
            teacher={teacher}
            isCurrentTeacher={teacher.id === currentTeacherId}
            onEdit={onEditTeacher}
            onDelete={onDeleteTeacher}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherProfilePage;