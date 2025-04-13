import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Space } from 'antd';
import { useUserViewModel } from '../viewmodels/UserViewModel';
import { useMatchViewModel } from '../viewmodels/MatchViewModel';
import { Teacher } from '../types';
import TeacherProfilePage from '../components/TeacherProfilePage';
import TeacherFormContainer from '../components/TeacherFormContainer';
import EditTeacherForm from '../components/EditTeacherForm';
import UserHeader from '../components/UserHeader';
import AnnouncementBanner from '../components/AnnouncementBanner';
import DebugTools from '../components/DebugTools';
import ApiService from '../services/ApiService';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();
  const userVM = useUserViewModel();
  const matchVM = useMatchViewModel(userVM.currentTeacher, userVM.allTeachers);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Current ROC year calculation
  const currentYear = new Date().getFullYear() - 1911;
  
  // If all teachers is empty and not showing form, show form
  useEffect(() => {
    if (userVM.allTeachers.length === 0 && !showForm) {
      setShowForm(true);
    }
  }, [userVM.allTeachers, showForm]);
  
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
      
      // Hide form and show profile
      setShowForm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '新增教師資料失敗，請稍後再試';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Navigation handlers
  const handleShowResults = () => {
    navigate('/matches');
  };
  
  const handleBackToForm = () => {
    setShowForm(true);
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
  
  // Debug handlers
  const handleViewAllMatches = () => {
    matchVM.enableDebugMode();
    matchVM.fetchMatches();
    navigate('/matches');
  };
  
  const handleDebugLogin = () => {
    const debugGoogleId = 'debug-user-123';
    userVM.debugLogin(debugGoogleId);
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        <Title level={5} style={{ margin: 0 }}>
          {currentYear} 小學教師介聘配對系統
        </Title>
        <UserHeader 
          userInfo={userVM.userInfo}
          onShowResults={handleShowResults}
          onShowProfile={() => setShowForm(false)}
          onLogout={handleLogout}
        />
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <AnnouncementBanner />
          
          {/* Add Debug Tools */}
          <DebugTools
            isDebugMode={matchVM.isDebugMode}
            userView={matchVM.userView}
            toggleUserView={matchVM.toggleUserView}
            onViewAllMatches={handleViewAllMatches}
            onDebugLogin={handleDebugLogin}
          />
          
          {showForm ? (
            <TeacherFormContainer
              onSubmit={handleCreateTeacher}
              defaultEmail={userVM.userInfo?.email}
              loading={loading}
              error={error}
            />
          ) : userVM.editingTeacher ? (
            <EditTeacherForm
              teacher={userVM.editingTeacher}
              onSubmit={userVM.updateTeacher}
              onCancel={userVM.cancelEditingTeacher}
              loading={userVM.loading}
              error={userVM.error}
            />
          ) : (
            <TeacherProfilePage
              teachers={userVM.allTeachers}
              currentTeacherId={userVM.currentTeacher?.id}
              editingTeacher={userVM.editingTeacher}
              loading={userVM.loading}
              error={userVM.error}
              onEditTeacher={userVM.startEditingTeacher}
              onDeleteTeacher={userVM.deleteTeacher}
              onUpdateTeacher={userVM.updateTeacher}
              onCancelEdit={userVM.cancelEditingTeacher}
              onShowResults={handleShowResults}
              onBackToForm={handleBackToForm}
            />
          )}
        </Space>
      </Content>
      
      <Footer style={{ 
        textAlign: 'center', 
        padding: '16px',
        background: '#f9f9f9',
        borderTop: '1px solid #e8e8e8'
      }}>
        <Typography.Text type="secondary">CircleMatch ©{new Date().getFullYear()}</Typography.Text>
      </Footer>
    </Layout>
  );
};

export default TeacherProfile;