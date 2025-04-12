import React from 'react';
import { Teacher } from '../types';
import TeacherActionButtons from './TeacherActionButtons';

interface TeacherProfileCardProps {
  teacher: Teacher;
  isCurrentTeacher?: boolean;
  onEdit: (teacherId: number) => void;
  onDelete: (teacherId: number) => void;
}

const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({
  teacher,
  isCurrentTeacher = false,
  onEdit,
  onDelete
}) => {
  if (!teacher) return null;
  
  return (
    <div className={`teacher-profile-card ${isCurrentTeacher ? 'current' : ''}`}>
      <div className="teacher-profile-header">
        <div className="teacher-profile-title">
          <h3>{teacher.current_county} • {teacher.current_district} • {teacher.current_school}</h3>
          <span className="teacher-id">{teacher.display_id || `ID: ${teacher.id}`}</span>
        </div>
        
        <TeacherActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
          teacherId={teacher.id}
          isCurrentTeacher={isCurrentTeacher}
        />
      </div>
      
      <div className="teacher-profile-body">
        <div className="teacher-profile-row">
          <span className="teacher-profile-label">科目:</span>
          <span className="teacher-profile-value">{teacher.subject || '未指定'}</span>
        </div>
        
        <div className="teacher-profile-row">
          <span className="teacher-profile-label">希望調往地區:</span>
          <ul className="teacher-profile-list">
            {teacher.target_counties.map((county, i) => (
              <li key={i} className="teacher-profile-target">
                {i+1}. {county} • {teacher.target_districts[i] || ''}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="teacher-profile-row">
          <span className="teacher-profile-label">聯絡信箱:</span>
          <span className="teacher-profile-value">{teacher.email}</span>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileCard;