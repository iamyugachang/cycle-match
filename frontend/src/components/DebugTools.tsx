import React from 'react';
import { Button, Dropdown, Space, Switch, Typography, Card } from 'antd';
import { BugOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Text } = Typography;

interface DebugToolsProps {
  isDebugMode: boolean;
  userView: boolean;
  toggleUserView: () => void;
  onViewAllMatches: () => void;
  onDebugLogin: () => void;
}

const DebugTools: React.FC<DebugToolsProps> = ({
  isDebugMode,
  userView,
  toggleUserView,
  onViewAllMatches,
  onDebugLogin
}) => {
  // Dropdown items for debug menu
  const items: MenuProps['items'] = [
    {
      key: 'viewAllMatches',
      label: '顯示所有配對',
      icon: <EyeOutlined />,
      onClick: onViewAllMatches
    },
    {
      key: 'debugLogin',
      label: '模擬登入',
      icon: <UserOutlined />,
      onClick: onDebugLogin
    }
  ];

  return (
    <div>
      {/* Debug dropdown - always visible */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <Dropdown menu={{ items }} placement="bottomLeft" arrow>
          <Button icon={<BugOutlined />} size="small">
            Debug
          </Button>
        </Dropdown>
      </div>

      {/* Debug mode toggle - only visible when debug mode is active */}
      {isDebugMode && (
        <Card 
          size="small" 
          style={{ marginBottom: 16, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
        >
          <Space>
            <Text>Debug 模式:</Text>
            <Switch
              checked={userView}
              onChange={toggleUserView}
              checkedChildren="用戶視角"
              unCheckedChildren="所有配對"
            />
            <Text type="secondary">
              {userView ? "目前僅顯示當前用戶的配對" : "目前顯示所有可能的配對"}
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default DebugTools;