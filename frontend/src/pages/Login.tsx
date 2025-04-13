import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Layout, Alert } from 'antd';
import WelcomeBanner from '../components/WelcomeBanner';
import { useUserViewModel } from '../viewmodels/UserViewModel';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const userVM = useUserViewModel();
  const [error, setError] = useState('');
  
  // Handle login success
  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const result = await userVM.handleGoogleLoginSuccess(credentialResponse);
      
      // Store authentication data in localStorage
      localStorage.setItem('auth_token', credentialResponse.credential);
      localStorage.setItem('google_id', result?.userInfo.google_id || '');
      localStorage.setItem('user_info', JSON.stringify(result?.userInfo));
      
      if (result?.teachers?.length > 0) {
        navigate('/matches');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('登入失敗，請稍後再試');
    }
  };
  
  // Handle login failure
  const handleLoginError = (error: any) => {
    console.error('Login error:', error);
    setError('登入失敗，請稍後再試');
    userVM.handleGoogleLoginFailure(error);
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          
          {error && <Alert message={error} type="error" showIcon />}
          
          <WelcomeBanner 
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
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

export default Login;