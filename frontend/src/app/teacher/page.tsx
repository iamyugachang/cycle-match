"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TeacherForm from '../../components/TeacherForm';
import MatchList from '../../components/MatchList';
import TeacherSelectionModal from '../../components/TeacherSelectionModal';
import { Teacher, MatchResult } from '../../types';
import TeacherInfoModal from '../../components/TeacherInfoModal';

export default function TeacherPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showTeacherSelection, setShowTeacherSelection] = useState<boolean>(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setUserEmail(email);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userEmail) {
      // Fetch teachers list based on user email
      // This is a placeholder, replace with actual API call
      const fetchedTeachers: Teacher[] = [
        // Example data
        {
          id: 1,
          current_county: 'County A',
          current_district: 'District A',
          current_school: 'School A',
          subject: 'Math',
          target_counties: ['County B', 'County C'],
          target_districts: ['District B', 'District C']
        },
        {
          id: 2,
          current_county: 'County B',
          current_district: 'District B',
          current_school: 'School B',
          subject: 'Science',
          target_counties: ['County A'],
          target_districts: ['District A']
        }
      ];
      setTeachersList(fetchedTeachers);
    }
  }, [userEmail]);

  // Show teacher selection modal if multiple teachers are found
  useEffect(() => {
    if (userEmail && teachersList.length > 1 && !selectedTeacherId && showForm) {
      setShowTeacherSelection(true);
    }
  }, [userEmail, teachersList, selectedTeacherId, showForm]);

  return (
    <div className="container" style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "20px" 
    }}>
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>教師介聘媒合系統</h1>
      
      {showForm && (
        <TeacherForm 
          teacher={teachersList.find(teacher => teacher.id === selectedTeacherId)}
          onSubmit={(teacher) => {
            // Handle form submission
          }}
        />
      )}
      
      {selectedTeacherId && (
        <MatchList 
          teacherId={selectedTeacherId}
          onMatchSelect={(match: MatchResult) => {
            // Handle match selection
          }}
        />
      )}
      
      {showTeacherSelection && (
        <TeacherSelectionModal 
          teachers={teachersList}
          onSelectTeacher={(id) => {
            setSelectedTeacherId(id);
            setShowTeacherSelection(false);
          }}
          onClose={() => {
            setShowTeacherSelection(false);
            setSelectedTeacherId(undefined);
          }}
        />
      )}
    </div>
  );
}

// 教師選擇 Modal
const TeacherSelectionModal = ({ teachers, onSelectTeacher, onClose }: {
  teachers: Teacher[];
  onSelectTeacher: (teacherId: number | undefined) => void;
  onClose: () => void;
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        width: '80%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>您有多個學校資料，請選擇要查看的學校：</h2>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          margin: '20px 0' 
        }}>
          {teachers.map((teacher) => (
            <li 
              key={teacher.id} 
              onClick={() => onSelectTeacher(teacher.id)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ marginRight: '15px', fontSize: '24px', color: '#6c757d' }}>
                <i className="fas fa-school"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {teacher.current_county} • {teacher.current_district} • {teacher.current_school} • {teacher.subject || '未指定科目'}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  希望調往: {teacher.target_counties.map((county, i) => 
                    `${county} | ${teacher.target_districts[i] || ''}`
                  ).join(', ')}
                </div>
              </div>
              <div style={{ 
                padding: '8px 12px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                選擇此筆
              </div>
            </li>
          ))}
        </ul>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};