import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import SharedLayout from '../components/SharedLayout';
import { useUserViewModel } from '../viewmodels/UserViewModel';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const userVM = useUserViewModel();
  
  return (
    <SharedLayout userInfo={userVM.userInfo}>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您訪問的頁面不存在。"
        extra={
          <>
            <Button type="primary" onClick={() => navigate('/')}>
              返回首頁
            </Button>
            {userVM.userInfo && (
              <Button onClick={() => navigate('/profile')} style={{ marginLeft: 8 }}>
                我的介聘資料
              </Button>
            )}
          </>
        }
      />
    </SharedLayout>
  );
};

export default NotFound;