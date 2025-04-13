import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import Home from './pages/Home';
import TeacherProfile from './pages/TeacherProfile';
import MatchResults from './pages/MatchResults';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Debug from './pages/Debug'; // Import the Debug page
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  // Get Google client ID from environment variable
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 4,
        },
      }}
    >
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            
            {/* Debug route */}
            <Route path="/debug" element={<Debug />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <TeacherProfile />
              </ProtectedRoute>
            } />
            <Route path="/matches" element={
              <ProtectedRoute>
                <MatchResults />
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ConfigProvider>
  );
};

export default App;