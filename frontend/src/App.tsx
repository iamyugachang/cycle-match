import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import Home from './pages/Home';

const App: React.FC = () => {
  // You can replace this with your actual Google client ID from your environment variables
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
            <Route path="/" element={<Home />} />
            {/* Add additional routes as needed */}
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ConfigProvider>
  );
};

export default App;