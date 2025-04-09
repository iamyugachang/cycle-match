"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeacherForm from '../../components/TeacherForm';
import TeacherList from '../../components/TeacherList';
import MatchResults from '../../components/MatchResults';
import { updateTeacher, getMatches } from '../../utils';
import { Teacher, MatchResult } from '../../types';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userJson);
    setUser(userData);

    // If user has teachers array, use it
    if (userData.teachers && Array.isArray(userData.teachers)) {
      setTeachers(userData.teachers);
    } else if (userData.teacher) {
      // Backward compatibility for older version
      setTeachers([userData.teacher]);
    }
    
    setLoading(false);

    // Fetch matches
    fetchMatches();
  }, [router]);

  const fetchMatches = async () => {
    try {
      setMatchLoading(true);
      const data = await getMatches();
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleTeacherUpdate = async (updatedTeacher: Teacher) => {
    try {
      const response = await updateTeacher(updatedTeacher.id as number, updatedTeacher);
      
      // Update the local state with the updated teacher
      setTeachers(prevTeachers => 
        prevTeachers.map(teacher => 
          teacher.id === updatedTeacher.id ? response : teacher
        )
      );

      // Also update the user in localStorage
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        userData.teachers = teachers.map(teacher => 
          teacher.id === updatedTeacher.id ? response : teacher
        );
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Refresh the matches
      fetchMatches();
      
      alert('教師資料已成功更新！');
    } catch (error) {
      console.error("Error updating teacher:", error);
      alert('更新失敗，請重試。');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">載入中...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">介聘管理後台</h1>
          <p className="text-gray-600">歡迎回來，{user?.name || user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          登出
        </button>
      </header>

      <div className="bg-gray-50 rounded-lg p-5 mb-8">
        <MatchResults matches={matches} loading={matchLoading} />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">我的介聘資料</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showForm ? '取消新增' : '新增介聘資料'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-5 rounded-lg border mb-6">
            <TeacherForm 
              onSubmit={(teacher) => {
                // Handle form submission
                console.log("New teacher form submitted", teacher);
                // You would typically send this to your backend
                // and then update the local state
                setShowForm(false);
              }}
              defaultEmail={user?.email || ""}
            />
          </div>
        )}

        <TeacherList 
          teachers={teachers} 
          onTeacherUpdated={handleTeacherUpdate}
        />
      </div>
    </div>
  );
}
