import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Space, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useUserViewModel } from '../viewmodels/UserViewModel';
import TeacherFormContainer from '../components/TeacherFormContainer';
import SharedLayout from '../components/SharedLayout';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { Teacher } from '../types';
import ApiService from '../services/ApiService';

const { Title } = Typography;

const NewTeacherForm: React.FC = () => {
  const navigate = useNavigate();
  const userVM = useUserViewModel();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Current ROC year calculation
  const currentYear = new Date().getFullYear() - 1911;
  
  // Navigation handlers
  const handleBackToProfile = () => {
    navigate('/profile');
  };
  
  // Handle create teacher submission
  const handleCreateTeacher = async (teacher: Teacher) => {
    if (!userVM.userInfo?.google_id) {
      setError('登入狀態已過期，請重新登入');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create teacher with Google ID
      const createdTeacher = await ApiService.createTeacher({
        ...teacher,
        google_id: userVM.userInfo.google_id,
        year: currentYear
      });
      
      // Update user's teachers
      userVM.setAllTeachers([...userVM.allTeachers, createdTeacher]);
      userVM.setCurrentTeacher(createdTeacher);
      
      // Navigate back to profile page
      navigate('/profile');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '新增教師資料失敗，請稍後再試';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout handler
  const handleLogout = () => {
    userVM.logout();
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('google_id');
    localStorage.removeItem('user_info');
    navigate('/login');
  };
  
  return (
    <SharedLayout 
      userInfo={userVM.userInfo}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            type="text" 
            onClick={handleBackToProfile}
            style={{ marginRight: 8 }}
          />
          <Title level={5} style={{ margin: 0 }}>
            新增介聘資料
          </Title>
        </div>
      }
      onShowProfile={handleBackToProfile}
      onLogout={handleLogout}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <AnnouncementBanner />
        
        <TeacherFormContainer
          onSubmit={handleCreateTeacher}
          defaultEmail={userVM.userInfo?.email}
          loading={loading}
          error={error}
        />
      </Space>
    </SharedLayout>
  );
};

export default NewTeacherForm;