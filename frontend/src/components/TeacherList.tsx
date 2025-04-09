"use client";

import React, { useState } from 'react';
import { Teacher } from '../types';
import TeacherForm from './TeacherForm';

interface TeacherListProps {
  teachers: Teacher[];
  onTeacherUpdated: (updatedTeacher: Teacher) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ teachers, onTeacherUpdated }) => {
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  
  if (!teachers || teachers.length === 0) {
    return <div className="text-center p-4 text-gray-500">尚未新增介聘資料</div>;
  }

  const handleEditClick = (teacherId: number) => {
    setEditingTeacherId(teacherId === editingTeacherId ? null : teacherId);
  };

  const handleTeacherUpdate = (updatedTeacher: Teacher) => {
    onTeacherUpdated(updatedTeacher);
    setEditingTeacherId(null);  // Close edit form after submission
  };

  return (
    <div className="space-y-6">
      {teachers.map(teacher => (
        <div key={teacher.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">
              {teacher.current_school} - {teacher.subject}
            </h3>
            <button 
              onClick={() => handleEditClick(teacher.id as number)}
              className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              {editingTeacherId === teacher.id ? '取消編輯' : '編輯資料'}
            </button>
          </div>
          
          {editingTeacherId === teacher.id ? (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <TeacherForm 
                onSubmit={handleTeacherUpdate}
                defaultEmail={teacher.email}
                initialTeacher={teacher}
                isEditing={true}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-600">現職學校:</span>{' '}
                  {teacher.current_county} {teacher.current_district} {teacher.current_school}
                </p>
                <p>
                  <span className="font-medium text-gray-600">任教科目:</span>{' '}
                  {teacher.subject}
                </p>
                <p>
                  <span className="font-medium text-gray-600">聯絡信箱:</span>{' '}
                  {teacher.email}
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-600">希望調往地區:</p>
                <ul className="list-disc pl-5">
                  {teacher.target_counties.map((county, index) => (
                    <li key={index}>
                      {county} {teacher.target_districts[index]}
                    </li>
                  ))}
                </ul>
                <p>
                  <span className="font-medium text-gray-600">教師編號:</span>{' '}
                  {teacher.display_id}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeacherList;
