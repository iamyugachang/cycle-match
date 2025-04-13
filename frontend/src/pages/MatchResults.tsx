import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Space, Spin, Card, Button, Tag, Drawer } from 'antd';
import { SwapOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useUserViewModel } from '../viewmodels/UserViewModel';
import { useMatchViewModel } from '../viewmodels/MatchViewModel';
import MatchList from '../components/MatchList';
import TeacherInfoModal from '../components/TeacherInfoModal';
import UserHeader from '../components/UserHeader';
import AnnouncementBanner from '../components/AnnouncementBanner';
import DebugTools from '../components/DebugTools'; // Import the DebugTools component

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const MatchResults: React.FC = () => {
  const navigate = useNavigate();
  const userVM = useUserViewModel();
  const matchVM = useMatchViewModel(userVM.currentTeacher, userVM.allTeachers);
  const [initialLoading, setInitialLoading] = useState(true);
  const [teacherSwitcherVisible, setTeacherSwitcherVisible] = useState(false);
  
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
      setTeacherSwitcherVisible(false);
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

  // Toggle teacher switcher drawer
  const toggleTeacherSwitcher = () => {
    setTeacherSwitcherVisible(!teacherSwitcherVisible);
  };
  
  // Debug handlers
  const handleViewAllMatches = () => {
    matchVM.enableDebugMode();
    matchVM.fetchMatches();
  };
  
  const handleDebugLogin = () => {
    const debugGoogleId = 'debug-user-123';
    userVM.debugLogin(debugGoogleId);
  };

  const handleExitDebugMode = () => {
    localStorage.removeItem('debug_authenticated');
    matchVM.disableDebugMode();
    navigate('/');
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
        padding: '0 16px',
        height: 'auto',
        lineHeight: '1.5',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="text" 
              onClick={handleBackToForm}
              style={{ marginRight: 8 }}
            />
            <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
              {currentYear} 介聘配對
            </Title>
          </div>
          <UserHeader 
            userInfo={userVM.userInfo}
            onShowResults={() => {}} // Already on results page
            onShowProfile={handleShowProfile}
            onLogout={handleLogout}
          />
        </div>
        
        {/* Teacher selector (visible only when multiple teachers) */}
        {userVM.allTeachers.length > 1 && (
          <div style={{ width: '100%', padding: '4px 0 8px', display: 'flex', alignItems: 'center' }}>
            <Text style={{ marginRight: 8, fontSize: '14px' }}>目前學校:</Text>
            <Button 
              size="small" 
              onClick={toggleTeacherSwitcher}
              style={{ fontSize: '12px', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {userVM.currentTeacher?.current_school || '選擇學校'} <SwapOutlined />
            </Button>
          </div>
        )}
      </Header>
      
      <Content style={{ padding: '12px', maxWidth: '100%', margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <AnnouncementBanner />
          
          {/* Add Debug Tools */}
          <DebugTools
            isDebugMode={matchVM.isDebugMode}
            userView={matchVM.userView}
            toggleUserView={matchVM.toggleUserView}
            onViewAllMatches={handleViewAllMatches}
            onDebugLogin={handleDebugLogin}
            onExitDebugMode={handleExitDebugMode}
          />
          
          {initialLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Spin size="large" tip="載入配對結果中..." />
            </div>
          ) : (
            <MatchList
              matches={matchVM.getFilteredMatches()}
              currentTeacher={userVM.currentTeacher}
              onShowTeacherInfo={matchVM.showTeacherInfo}
              onBackToForm={handleBackToForm}
              title={`${currentYear}年度配對結果`}
              isDebugMode={matchVM.isDebugMode}
              loading={matchVM.loading}
            />
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
        padding: '12px',
        background: '#f9f9f9',
        borderTop: '1px solid #e8e8e8'
      }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>CircleMatch ©{new Date().getFullYear()}</Text>
      </Footer>

      {/* Teacher switcher drawer */}
      <Drawer
        title="選擇查看的學校"
        placement="bottom"
        onClose={() => setTeacherSwitcherVisible(false)}
        open={teacherSwitcherVisible}
        height="auto"
        bodyStyle={{ padding: '12px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {userVM.allTeachers.map(teacher => (
            <Card 
              key={teacher.id}
              onClick={() => teacher.id && handleSwitchTeacher(teacher.id)}
              style={{ 
                cursor: 'pointer',
                backgroundColor: teacher.id === userVM.currentTeacher?.id ? '#e6f7ff' : 'white',
                borderColor: teacher.id === userVM.currentTeacher?.id ? '#1890ff' : '#d9d9d9',
                marginBottom: 8
              }}
              size="small"
              bodyStyle={{ padding: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>{teacher.current_school}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {teacher.current_county} • {teacher.current_district} • {teacher.subject || '未指定科目'}
                    </Text>
                  </div>
                </div>
                {teacher.id === userVM.currentTeacher?.id && (
                  <Tag color="blue">目前選擇</Tag>
                )}
              </div>
            </Card>
          ))}
        </Space>
      </Drawer>
    </Layout>
  );
};

export default MatchResults;