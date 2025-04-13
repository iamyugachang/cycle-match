import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { useUserViewModel } from '../viewmodels/UserViewModel';

const { Text } = Typography;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const userVM = useUserViewModel();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Check if we have auth token in localStorage but no userInfo
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const googleId = localStorage.getItem('google_id');
      
      if (token && googleId && !userVM.userInfo) {
        try {
          // Get user data based on stored Google ID
          await userVM.debugLogin(googleId);
          setCheckingAuth(false);
        } catch (error) {
          console.error('Failed to restore auth:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('google_id');
          localStorage.removeItem('user_info');
          setCheckingAuth(false);
        }
      } else {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (checkingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <Text type="secondary">驗證登入狀態...</Text>
          </div>
        </Spin>
      </div>
    );
  }
  
  if (!userVM.userInfo) {
    // Redirect to login but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;