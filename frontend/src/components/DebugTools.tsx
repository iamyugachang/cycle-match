import React, { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, Space, Switch, Typography, Card, Badge, Tooltip } from 'antd';
import { BugOutlined, EyeOutlined, UserOutlined, SettingOutlined, InfoCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Text } = Typography;

interface DebugToolsProps {
  isDebugMode: boolean;
  userView: boolean;
  toggleUserView: () => void;
  onViewAllMatches: () => void;
  onDebugLogin: () => void;
  onExitDebugMode?: () => void;
}

const DebugTools: React.FC<DebugToolsProps> = ({
  isDebugMode,
  userView,
  toggleUserView,
  onViewAllMatches,
  onDebugLogin,
  onExitDebugMode
}) => {
  const navigate = useNavigate();
  const [isDebugAuthenticated, setIsDebugAuthenticated] = useState(false);
  const buttonRef = useRef(null);
  
  // Check if already authenticated from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('debug_authenticated');
    setIsDebugAuthenticated(storedAuth === 'true');
  }, []);
  
  // If not in debug mode and not authenticated, don't render anything
  if (!isDebugMode && !isDebugAuthenticated) {
    return null;
  }
  
  // Debug dropdown items
  const debugItems: MenuProps['items'] = [
    {
      key: 'debugPage',
      label: '開啟 Debug 頁面',
      icon: <SettingOutlined />,
      onClick: () => navigate('/debug')
    },
    {
      key: 'divider1',
      type: 'divider',
    },
    {
      key: 'viewAllMatches',
      label: '顯示所有配對',
      icon: <EyeOutlined />,
      onClick: onViewAllMatches,
      disabled: !isDebugAuthenticated
    },
    {
      key: 'debugLogin',
      label: '模擬登入',
      icon: <UserOutlined />,
      onClick: onDebugLogin,
      disabled: !isDebugAuthenticated
    },
    {
      key: 'divider2',
      type: 'divider',
    },
    {
      key: 'exitDebugMode',
      label: '退出 Debug 模式',
      icon: <LogoutOutlined />,
      onClick: onExitDebugMode,
      danger: true,
      disabled: !isDebugAuthenticated
    }
  ];

  return (
    <>
      {/* Floating Debug Button - Only visible when authenticated or in debug mode */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 1000 
        }}
      >
        <Badge 
          dot={isDebugAuthenticated} 
          color="green"
          offset={[-2, 2]}
        >
          <Dropdown 
            menu={{ items: debugItems }} 
            placement="topRight" 
            arrow
            trigger={['click']}
          >
            <Button 
              ref={buttonRef}
              type={isDebugAuthenticated ? "primary" : "default"}
              shape="circle" 
              icon={<BugOutlined />} 
              size="large"
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                backgroundColor: isDebugAuthenticated ? '#52c41a' : undefined,
                borderColor: isDebugAuthenticated ? '#52c41a' : undefined
              }}
            />
          </Dropdown>
        </Badge>
      </div>

      {/* Debug Mode Status Banner - Only visible when debug authenticated */}
      {isDebugAuthenticated && isDebugMode && (
        <Card 
          size="small" 
          style={{ 
            marginBottom: 16, 
            backgroundColor: '#f6ffed', 
            borderColor: '#b7eb8f' 
          }}
          styles={{ body: { padding: '12px' } }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Space>
                <BugOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ color: '#52c41a' }}>
                  Debug Mode 已啟用
                </Text>
              </Space>
              <Button 
                type="link" 
                size="small" 
                onClick={() => navigate('/debug')}
              >
                Debug Config.
              </Button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginTop: 8 
            }}>
              <Text>顯示模式:</Text>
              <Switch
                checked={userView}
                onChange={toggleUserView}
                checkedChildren="用戶視角"
                unCheckedChildren="所有配對"
                size="small"
                style={{ margin: '0 8px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {userView ? "僅顯示當前用戶的配對" : "顯示所有可能的配對"}
              </Text>
              <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                <InfoCircleOutlined />
              </span>
            </div>
          </Space>
        </Card>
      )}
    </>
  );
};

export default DebugTools;