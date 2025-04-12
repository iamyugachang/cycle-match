import React, { useState } from 'react';
import { Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const AnnouncementBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <Alert
      message="請提供正確資料，本平台僅協助配對，不查核資訊真實性。錯誤資料將影響其他教師的配對機會，謝謝合作。"
      type="warning"
      showIcon
      icon={<InfoCircleOutlined />}
      closable
      onClose={() => setIsVisible(false)}
      style={{ marginBottom: 20 }}
    />
  );
};

export default AnnouncementBanner;