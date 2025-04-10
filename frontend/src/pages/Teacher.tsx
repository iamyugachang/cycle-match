import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TeacherForm from '../components/TeacherForm';
import MatchList from '../components/MatchList';
import TeacherInfoModal from '../components/TeacherInfoModal';
import TeacherSelectionModal from '../components/TeacherSelectionModal';
import { Teacher, MatchResult } from '../types';

export default function TeacherPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showTeacherSelection, setShowTeacherSelection] = useState<boolean>(false);

  const [searchParams] = useSearchParams();

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
          target_districts: ['District B', 'District C'],
          email: userEmail,
          year: new Date().getFullYear() - 1911
        },
        {
          id: 2,
          current_county: 'County B',
          current_district: 'District B',
          current_school: 'School B',
          subject: 'Science',
          target_counties: ['County A'],
          target_districts: ['District A'],
          email: userEmail,
          year: new Date().getFullYear() - 1911
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

  const handleMatchSelect = (match: MatchResult) => {
    // Handle match selection
    console.log("Selected match:", match);
  };

  const handleSubmit = (teacher: Teacher) => {
    // Handle form submission
    console.log("Teacher form submitted:", teacher);
  };

  return (
    <div className="container" style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "20px" 
    }}>
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>教師介聘媒合系統</h1>
      
      {showForm && (
        <TeacherForm 
          onSubmit={handleSubmit}
          defaultEmail={userEmail || ""}
        />
      )}
      
      {selectedTeacherId && (
        <MatchList 
          matches={[]}
          currentTeacher={teachersList.find(t => t.id === selectedTeacherId) || null}
          onShowTeacherInfo={(id, email) => {
            console.log("Show teacher info:", id, email);
          }}
          onBackToForm={() => setShowForm(true)}
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