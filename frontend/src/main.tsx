import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import './styles/antd-custom.css'; // Import our custom styles

// Import base styles
import './styles/index.css';

// Import component styles - now consolidated
import './styles/components/Layout.css';
import './styles/components/TeacherForm.css';
import './styles/components/LocationSelector.css';
import './styles/components/ControlPanel.css';
import './styles/components/TeacherProfile.css';
import './styles/components/AnnouncementBanner.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhTW}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);