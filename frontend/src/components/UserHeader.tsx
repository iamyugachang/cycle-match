import React from 'react';
import { Dropdown, Avatar, Space, Button } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined, SearchOutlined } from '@ant-design/icons';
import { UserInfo } from '../types';

interface UserHeaderProps {
  userInfo: UserInfo | null;
  onShowResults: () => void;
  onShowProfile: () => void;
  onLogout: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  userInfo,
  onShowResults,
  onShowProfile,
  onLogout
}) => {
  if (!userInfo) return null;

  const items: MenuProps['items'] = [
    {
      key: 'userInfo',
      label: (
        <div>
          <div style={{ fontWeight: 'bold' }}>{userInfo.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{userInfo.email}</div>
        </div>
      ),
      style: { padding: '8px 12px' }
    },
    {
      type: 'divider'
    },
    {
      key: 'profile',
      label: '管理介聘資料',
      icon: <ProfileOutlined />,
      onClick: onShowProfile
    },
    {
      key: 'results',
      label: '查看配對結果',
      icon: <SearchOutlined />,
      onClick: onShowResults
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: '登出',
      icon: <LogoutOutlined />,
      onClick: onLogout
    }
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <Button type="text">
        <Space>
          <Avatar
            src={userInfo.picture || undefined}
            icon={!userInfo.picture ? <UserOutlined /> : undefined}
            size="small"
          />
          <span>{userInfo.name}</span>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default UserHeader;