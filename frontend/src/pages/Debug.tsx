import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, Button, Space, Alert, message, Tabs, Divider, Switch, Row, Col, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BugOutlined, EyeOutlined, UserOutlined, SettingOutlined, LockOutlined } from '@ant-design/icons';
import { useMatchViewModel } from '../viewmodels/MatchViewModel';
import { useUserViewModel } from '../viewmodels/UserViewModel';
import SharedLayout from '../components/SharedLayout';
import ApiService from '../services/ApiService';

const { Title, Text, Paragraph } = Typography;
const { Password } = Input;
const { TabPane } = Tabs;

// Debug password - should ideally come from an environment variable
const DEBUG_PASSWORD = import.meta.env.DEBUG_AUTH || '';

const Debug: React.FC = () => {
  const navigate = useNavigate();
  const userVM = useUserViewModel();
  const matchVM = useMatchViewModel(userVM.currentTeacher, userVM.allTeachers);
  
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [debugGoogleId, setDebugGoogleId] = useState('debug-user-123');
  const [userViewMode, setUserViewMode] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('debug_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      // Enable debug mode in the MatchViewModel
      matchVM.enableDebugMode();
    }
    setCheckingAuth(false);
  }, []);
  
  // Check if already authenticated from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('debug_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      // Enable debug mode in the MatchViewModel
      matchVM.enableDebugMode();
    }
  }, []);
  
  // Set user view mode based on MatchViewModel
  useEffect(() => {
    setUserViewMode(matchVM.userView);
  }, [matchVM.userView]);
  
  // Handle password submission
  const handleAuthenticate = () => {
    if (password === DEBUG_PASSWORD) {
      setIsAuthenticated(true);
      matchVM.enableDebugMode();
      // Store authentication in localStorage
      localStorage.setItem('debug_authenticated', 'true');
      message.success('Debug mode activated');
    } else {
      setError('Incorrect password');
    }
  };
  
  // Handle debug actions
  const handleViewAllMatches = async () => {
    try {
      matchVM.enableDebugMode();
      await matchVM.fetchMatches();
      message.success('Fetched all matches');
      navigate('/matches');
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      message.error('Failed to fetch matches');
    }
  };
  
  const handleDebugLogin = async () => {
    try {
      const result = await userVM.debugLogin(debugGoogleId);
      // Store authentication data in localStorage
      localStorage.setItem('auth_token', 'debug-token');
      localStorage.setItem('google_id', debugGoogleId);
      if (result?.userInfo) {
        localStorage.setItem('user_info', JSON.stringify(result.userInfo));
      }
      
      message.success('Debug login successful');
      
      if (result?.teachers && result.teachers.length > 0) {
        navigate('/matches');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Debug login failed:', error);
      message.error('Login failed');
    }
  };
  
  const toggleUserView = () => {
    matchVM.toggleUserView();
    setUserViewMode(!userViewMode);
  };
  
  const handleExit = () => {
    localStorage.removeItem('debug_authenticated');
    setIsAuthenticated(false);
    matchVM.disableDebugMode();
    message.success('Debug mode deactivated');
    navigate('/');
  };
  
  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Card 
          title={
            <div style={{ textAlign: 'center' }}>
              <BugOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
              <span>Developer Access</span>
            </div>
          }
          style={{ 
            width: 400, 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px' 
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message="Restricted Area"
              description="This area is for developers only. Please enter the debug password to continue."
              type="warning"
              showIcon
              icon={<LockOutlined />}
            />
            
            {error && <Alert message={error} type="error" showIcon />}
            
            <Password
              placeholder="Enter debug password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handleAuthenticate}
              size="large"
            />
            
            <Button type="primary" onClick={handleAuthenticate} block size="large">
              Authenticate
            </Button>
            
            <Button onClick={() => navigate('/')} block>
              Return to Home
            </Button>
          </Space>
        </Card>
      </div>
    );
  }
  
  // Debug dashboard
  return (
    <SharedLayout 
      userInfo={userVM.userInfo} 
      title={<><BugOutlined /> Debug Console</>}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Debug Mode Active"
          description="You are now in debug mode. This gives you access to additional developer tools and features."
          type="info"
          showIcon
          icon={<BugOutlined />}
          style={{ marginBottom: 16 }}
        />
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
        >
          <TabPane tab="Debug Actions" key="1">
            <Card title="Debug Controls">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Paragraph>
                  These controls allow you to test various aspects of the application.
                  Use them carefully as they may affect the application state.
                </Paragraph>
                
                <Divider orientation="left">Match Controls</Divider>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />} 
                      onClick={handleViewAllMatches}
                      block
                      size="large"
                    >
                      View All Matches
                    </Button>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="View Mode">
                      <Space>
                        <Switch
                          checked={userViewMode}
                          onChange={toggleUserView}
                          checkedChildren="User View"
                          unCheckedChildren="All Matches"
                        />
                        <Text type="secondary">
                          {userViewMode ? "Only showing user's matches" : "Showing all possible matches"}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
                
                <Divider orientation="left">User Controls</Divider>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Input
                      addonBefore="Google ID"
                      value={debugGoogleId}
                      onChange={(e) => setDebugGoogleId(e.target.value)}
                      placeholder="Enter a debug Google ID"
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Button 
                      type="primary" 
                      icon={<UserOutlined />} 
                      onClick={handleDebugLogin}
                      block
                    >
                      Debug Login
                    </Button>
                  </Col>
                </Row>
                
                <Divider />
                
                <Button 
                  danger 
                  onClick={handleExit}
                  block
                  size="large"
                >
                  Exit Debug Mode
                </Button>
              </Space>
            </Card>
          </TabPane>
          
          <TabPane tab="System Status" key="2">
            <Card title="Current System State">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Divider orientation="left">User Info</Divider>
                
                <List
                  bordered
                  size="small"
                >
                  <List.Item>
                    <Text strong>Logged In: </Text>
                    <Text>{userVM.userInfo ? 'Yes' : 'No'}</Text>
                  </List.Item>
                  
                  {userVM.userInfo && (
                    <>
                      <List.Item>
                        <Text strong>User Name: </Text>
                        <Text>{userVM.userInfo.name}</Text>
                      </List.Item>
                      <List.Item>
                        <Text strong>Email: </Text>
                        <Text>{userVM.userInfo.email}</Text>
                      </List.Item>
                      <List.Item>
                        <Text strong>Google ID: </Text>
                        <Text>{userVM.userInfo.google_id}</Text>
                      </List.Item>
                    </>
                  )}
                </List>
                
                <Divider orientation="left">Teacher Info</Divider>
                
                <List
                  bordered
                  size="small"
                >
                  <List.Item>
                    <Text strong>Total Teachers: </Text>
                    <Text>{userVM.allTeachers.length}</Text>
                  </List.Item>
                  
                  {userVM.currentTeacher && (
                    <>
                      <List.Item>
                        <Text strong>Current Teacher ID: </Text>
                        <Text>{userVM.currentTeacher.id}</Text>
                      </List.Item>
                      <List.Item>
                        <Text strong>Current School: </Text>
                        <Text>{userVM.currentTeacher.current_school}</Text>
                      </List.Item>
                      <List.Item>
                        <Text strong>Location: </Text>
                        <Text>{userVM.currentTeacher.current_county} • {userVM.currentTeacher.current_district}</Text>
                      </List.Item>
                    </>
                  )}
                </List>
                
                <Divider orientation="left">Match Info</Divider>
                
                <List
                  bordered
                  size="small"
                >
                  <List.Item>
                    <Text strong>Debug Mode: </Text>
                    <Text>{matchVM.isDebugMode ? 'Enabled' : 'Disabled'}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>User View: </Text>
                    <Text>{matchVM.userView ? 'Enabled' : 'Disabled'}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Total Matches: </Text>
                    <Text>{matchVM.matches.length}</Text>
                  </List.Item>
                  <List.Item>
                    <Text strong>Filtered Matches: </Text>
                    <Text>{matchVM.getFilteredMatches().length}</Text>
                  </List.Item>
                </List>
              </Space>
            </Card>
          </TabPane>
          
          <TabPane tab="API Test" key="3">
            <Card title="API Test Tools">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Paragraph>
                  These tools allow you to test API endpoints directly and view the responses.
                </Paragraph>
                
                <Button
                  type="primary"
                  onClick={async () => {
                    try {
                      const matches = await ApiService.getMatches();
                      message.success(`Successfully fetched ${matches.length} matches`);
                    } catch (error) {
                      message.error('Failed to fetch matches');
                    }
                  }}
                >
                  Test Get Matches API
                </Button>
                
                <Button
                  onClick={async () => {
                    try {
                      const subjects = await ApiService.getSubjects();
                      message.success(`Successfully fetched ${subjects.length} subjects`);
                    } catch (error) {
                      message.error('Failed to fetch subjects');
                    }
                  }}
                >
                  Test Get Subjects API
                </Button>
                
                <Button
                  onClick={async () => {
                    try {
                      const locations = await ApiService.getLocations();
                      message.success(`Successfully fetched ${locations.length} locations`);
                    } catch (error) {
                      message.error('Failed to fetch locations');
                    }
                  }}
                >
                  Test Get Locations API
                </Button>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </Space>
    </SharedLayout>
  );
};

export default Debug;