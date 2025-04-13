import React from 'react';
import { Card, Typography, Steps, Divider, Space } from 'antd';
import { GoogleLogin } from "@react-oauth/google";
import { UserOutlined, SearchOutlined, FormOutlined, CheckOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface WelcomeBannerProps {
  onSuccess: (credentialResponse: any) => void;
  onError: (error: any) => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onSuccess, onError }) => {
  // Get current ROC year
  const currentYear = new Date().getFullYear() - 1911;

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>
          {currentYear} 年度小學教師介聘配對系統
        </Title>
        
        <Paragraph>
          Circle Match 是一個幫助教師找到互調機會的平台。透過多角調配對演算法，
          我們能夠找出兩人互調、三角調甚至更複雜的調動組合，大幅增加您在{currentYear}年度成功介聘的機會。
        </Paragraph>
        
        <Paragraph>
          過去普遍做法透過 Line 群組或 Facebook 社團尋找調動對象，
          但這些方式不僅需要花費大量時間手動搜尋與自己目標相符的教師，
          也因為人工無法有效整理調動循環，多數只能單調、互調，不容易多角調，
          因此我們開發了這個系統，讓教師們能夠更輕鬆地找到合適的調動對象。
        </Paragraph>
        
        <Divider orientation="left">使用指南</Divider>
        
        <Steps
          items={[
            {
              title: '登入',
              description: (
                <div style={{ display: 'flex', textAlign: 'left', width: '200px', maxWidth: '200%' }}>
                  <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                  />
                </div>
              ),
              icon: <UserOutlined />,
              status: "finish", // Add status finish to make it blue
            },
            {
              title: '填寫資料',
              description: '填寫您的現職學校及想調往的地區',
              icon: <FormOutlined />,
              status: "finish", // Add status finish to make it blue
            },
            {
              title: '自動配對',
              description: '系統會自動尋找可能的配對組合',
              icon: <SearchOutlined />,
              status: "finish", // Add status finish to make it blue
            },
            {
              title: '聯繫配對教師',
              description: '配對成功後，您可以查看對方的聯絡資訊',
              icon: <CheckOutlined />,
              status: "finish", // Add status finish to make it blue
            },
          ]}
        />
      </Space>
    </Card>
  );
}

export default WelcomeBanner;