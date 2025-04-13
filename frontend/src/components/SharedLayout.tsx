import React from 'react';
import { Layout, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserHeader from './UserHeader';
import { UserInfo } from '../types';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface SharedLayoutProps {
  children: React.ReactNode;
  userInfo: UserInfo | null;
  title?: string;
  onShowResults?: () => void;
  onShowProfile?: () => void;
  onLogout?: () => void;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({
  children,
  userInfo,
  title,
  onShowResults,
  onShowProfile,
  onLogout
}) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear() - 1911;
  
  // Default handlers if not provided
  const handleShowResults = onShowResults || (() => navigate('/matches'));
  const handleShowProfile = onShowProfile || (() => navigate('/profile'));
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('google_id');
      localStorage.removeItem('user_info');
      navigate('/login');
    }
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
          {title || `${currentYear} 小學教師介聘配對系統`}
        </Title>
        
        {userInfo && (
          <UserHeader 
            userInfo={userInfo}
            onShowResults={handleShowResults}
            onShowProfile={handleShowProfile}
            onLogout={handleLogout}
          />
        )}
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {children}
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

export default SharedLayout;