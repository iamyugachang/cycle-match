import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Space, Spin } from 'antd';
import { useUserViewModel } from '../viewmodels/UserViewModel';
import { useMatchViewModel } from '../viewmodels/MatchViewModel';
import MatchList from '../components/MatchList';
import TeacherInfoModal from '../components/TeacherInfoModal';
import UserHeader from '../components/UserHeader';
import AnnouncementBanner from '../components/AnnouncementBanner';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const MatchResults: React.FC = () => {
  const navigate = useNavigate();
  const userVM = useUserViewModel();
  const matchVM = useMatchViewModel(userVM.currentTeacher, userVM.allTeachers);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Current ROC year calculation
  const currentYear = new Date().getFullYear() - 1911;
  
  // Fetch matches when component mounts
  useEffect(() => {
    const loadMatches = async () => {
      try {
        await matchVM.fetchMatches();
      } catch (error) {
        console.error('Failed to load matches:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadMatches();
  }, []);
  
  // Navigation handlers
  const handleBackToForm = () => {
    navigate('/profile');
  };
  
  const handleShowProfile = () => {
    navigate('/profile');
  };
  
  // Teacher switcher handler
  const handleSwitchTeacher = (teacherId: number) => {
    if (userVM.switchTeacher(teacherId)) {
      matchVM.fetchMatches();
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
          onShowResults={() => {}} // Already on results page
          onShowProfile={handleShowProfile}
          onLogout={handleLogout}
        />
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <AnnouncementBanner />
          
          {initialLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Spin size="large" tip="載入配對結果中..." />
            </div>
          ) : (
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
        </Space>
      </Content>
      
      <Footer style={{ 
        textAlign: 'center', 
        padding: '16px',
        background: '#f9f9f9',
        borderTop: '1px solid #e8e8e8'
      }}>
        <Text type="secondary">CircleMatch ©{new Date().getFullYear()}</Text>
      </Footer>
    </Layout>
  );
};

export default MatchResults;