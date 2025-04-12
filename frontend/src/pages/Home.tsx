import React, { useState } from 'react';
import { Layout, Typography, Space, ConfigProvider, theme } from 'antd';
import { useUserViewModel } from '../viewmodels/UserViewModel';
import { useMatchViewModel } from '../viewmodels/MatchViewModel';
import { MailOutlined, LinkedinOutlined } from '@ant-design/icons';

// Components
import WelcomeBanner from '../components/WelcomeBanner';
import TeacherFormContainer from '../components/TeacherFormContainer';
import MatchList from '../components/MatchList';
import TeacherInfoModal from '../components/TeacherInfoModal';
import TeacherProfilePage from '../components/TeacherProfilePage';
import { Teacher } from '../types';
import AnnouncementBanner from '../components/AnnouncementBanner';
import UserHeader from '../components/UserHeader';
import DebugTools from '../components/DebugTools';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export default function Home() {
  // UI state
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // Initialize view models
  const userVM = useUserViewModel();
  const matchVM = useMatchViewModel(userVM.currentTeacher, userVM.allTeachers);
  
  // Current ROC year calculation
  const currentYear = new Date().getFullYear() - 1911;
  
  // Handle teacher form submission
  const handleCreateTeacher = async (teacher: Teacher) => {
    try {
      const createdTeacher = await matchVM.createTeacher(teacher, userVM.userInfo?.google_id);
      
      // Add new teacher to all teachers list
      userVM.setAllTeachers([...userVM.allTeachers, createdTeacher]);
      
      // Set current teacher to the newly created one
      userVM.setCurrentTeacher(createdTeacher);
      
      // Show match results
      setShowResults(true);
      setShowForm(false);
    } catch (error) {
      // Error is already handled in the view model
    }
  };

  // ...other handlers (condensed for brevity)
  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
    try {
      const result = await userVM.updateTeacher(updatedTeacher);
      if (result) {
        await matchVM.fetchMatches();
        setShowResults(true);
        setShowProfile(false);
      }
    } catch (error) {
      // Error handled in view model
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    try {
      const success = await userVM.deleteTeacher(teacherId);
      if (success) {
        await matchVM.fetchMatches();
        if (userVM.allTeachers.length === 0) {
          setShowForm(true);
          setShowResults(false);
          setShowProfile(false);
        }
      }
    } catch (error) {
      // Error handled in view model
    }
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setShowProfile(false);
    setShowForm(true);
  };

  const handleShowResults = () => {
    matchVM.fetchMatches();
    setShowResults(true);
    setShowForm(false);
    setShowProfile(false);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setShowResults(false);
    setShowForm(false);
  };

  const handleSwitchTeacher = (teacherId: number) => {
    if (userVM.switchTeacher(teacherId)) {
      matchVM.fetchMatches();
      setShowResults(true);
      setShowForm(false);
      setShowProfile(false);
    }
  };

  const handleEditTeacher = (teacherId: number) => {
    userVM.startEditingTeacher(teacherId);
    setShowProfile(true);
    setShowResults(false);
    setShowForm(false);
  };

  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const result = await userVM.handleGoogleLoginSuccess(credentialResponse);
      
      if (result?.teachers?.length > 0) {
        await matchVM.fetchMatches();
        setShowResults(true);
        setShowForm(false);
        setShowProfile(false);
      } else {
        setShowForm(true);
        setShowResults(false);
        setShowProfile(false);
      }
    } catch (error) {
      // Error handled in view model
    }
  };

  // Debug: View all matches
  const handleViewAllMatches = async () => {
    matchVM.enableDebugMode();
    await matchVM.fetchMatches();
    setShowResults(true);
    setShowForm(false);
    setShowProfile(false);
    
    // Create minimal debug session if user not logged in
    if (!userVM.userInfo) {
      userVM.setUserInfo({
        name: "Debug Viewer",
        picture: "",
        email: "debug@example.com",
        google_id: "debug@example.com",
      });
    }
  };

  // Debug: Login with specified ID
  const handleDebugLogin = async () => {
    const googleId = prompt("請輸入模擬的 Google ID (email):", "test@example.com");
    
    if (googleId) {
      try {
        const result = await userVM.debugLogin(googleId);
        
        if (result?.teachers?.length > 0) {
          // Teacher data found, show matches
          matchVM.fetchMatches();
          setShowResults(true);
          setShowForm(false);
          setShowProfile(false);
        } else {
          // No teacher data, show form
          setShowForm(true);
          setShowResults(false);
          setShowProfile(false);
        }
      } catch (error) {
        // Error handled in view model
      }
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        components: {
          Layout: {
            bodyBg: '#f5f5f5',
          },
        },
      }}
    >
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
            onShowProfile={handleShowProfile}
            onLogout={userVM.logout}
          />
        </Header>
        
        <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Announcement banner shown when logged in */}
            {userVM.userInfo && (
              <>
                {/* Debug Tools - for development only */}
                <DebugTools
                  isDebugMode={matchVM.isDebugMode}
                  userView={matchVM.userView}
                  toggleUserView={matchVM.toggleUserView}
                  onViewAllMatches={handleViewAllMatches}
                  onDebugLogin={handleDebugLogin}
                />

                <AnnouncementBanner />
              </>
            )}
            
            {/* Main content area */}
            {!userVM.userInfo ? (
              <WelcomeBanner 
                onSuccess={handleLoginSuccess}
                onError={userVM.handleGoogleLoginFailure}
              />
            ) : (
              <>
                {/* Teacher registration form */}
                {showForm && (
                  <TeacherFormContainer
                    onSubmit={handleCreateTeacher}
                    defaultEmail={userVM.userInfo.email}
                    loading={matchVM.loading || userVM.loading}
                    error={matchVM.error || userVM.error}
                  />
                )}

                {/* Teacher Profile Page */}
                {showProfile && (
                  <TeacherProfilePage
                    teachers={userVM.allTeachers}
                    currentTeacherId={userVM.currentTeacher?.id}
                    editingTeacher={userVM.editingTeacher}
                    loading={userVM.loading}
                    error={userVM.error}
                    onEditTeacher={handleEditTeacher}
                    onDeleteTeacher={handleDeleteTeacher}
                    onUpdateTeacher={handleUpdateTeacher}
                    onCancelEdit={userVM.cancelEditingTeacher}
                    onShowResults={handleShowResults}
                    onBackToForm={handleBackToForm}
                  />
                )}

                {/* Match results display */}
                {showResults && (
                  <>
                    {/* Teacher switcher - only visible with multiple teacher records */}
                    {userVM.allTeachers.length > 1 && (
                      <div style={{ marginBottom: '16px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Typography.Text strong>您有多個學校資料，請選擇要查看的學校：</Typography.Text>
                          <Space wrap>
                            {userVM.allTeachers.map(teacher => (
                              <a 
                                key={teacher.id}
                                onClick={() => teacher.id && handleSwitchTeacher(teacher.id)}
                                style={{ 
                                  padding: '8px 12px',
                                  border: '1px solid #d9d9d9',
                                  borderRadius: '4px',
                                  background: teacher.id === userVM.currentTeacher?.id ? '#e6f7ff' : 'white',
                                  cursor: 'pointer',
                                  display: 'inline-block'
                                }}
                              >
                                {teacher.current_county} • {teacher.current_district} • {teacher.current_school} • {teacher.subject || '未指定科目'}
                              </a>
                            ))}
                          </Space>
                        </Space>
                      </div>
                    )}

                    {/* Match results list */}
                    <MatchList
                      matches={matchVM.getFilteredMatches()}
                      currentTeacher={userVM.currentTeacher}
                      onShowTeacherInfo={matchVM.showTeacherInfo}
                      onBackToForm={handleBackToForm}
                      title={`${currentYear}年度配對結果`}
                      isDebugMode={matchVM.isDebugMode}
                    />
                  </>
                )}

                {/* Teacher info modal */}
                {matchVM.teacherInfo && (
                  <TeacherInfoModal
                    id={matchVM.teacherInfo.id}
                    email={matchVM.teacherInfo.email}
                    matches={matchVM.matches}
                    onClose={matchVM.closeTeacherInfo}
                    isOpen={matchVM.teacherInfo.isOpen || false}
                  />
                )}
              </>
            )}
          </Space>
        </Content>
        
        <Footer style={{ 
          textAlign: 'center', 
          padding: '16px',
          background: '#f9f9f9',
          borderTop: '1px solid #e8e8e8'
        }}>
          <Typography.Text strong>CircleMatch</Typography.Text>
          <Typography.Text type="secondary"> ©{new Date().getFullYear()}</Typography.Text>
          
          <div style={{ marginTop: '8px' }}>
            <Space>
              <Typography.Text type="secondary">Made with ♥  by </Typography.Text>
              <a href="https://www.linkedin.com/in/iamyugachang/" target="_blank" rel="noopener noreferrer">
                Yuga Chang
              </a>
              <a href="mailto:iamyugachang@gmail.com" title="Email">
                <MailOutlined />
              </a>
            </Space>
          </div>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}