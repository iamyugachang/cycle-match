import React from 'react';
import { Card, Typography, Button, Empty, Tabs, Space, Spin, Segmented, Badge } from 'antd';
import { InfoCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { MatchResult, Teacher } from "../types";
import { isUserInvolved, getMatchTypeName } from "../utils/matchUtils";
import MatchCard from './MatchCard'; // Use our updated MatchCard component

const { Title, Text } = Typography;

interface MatchListProps {
  matches: MatchResult[];
  currentTeacher: Teacher | null;
  onShowTeacherInfo: (id: number | undefined, email: string) => void;
  onBackToForm: () => void;
  title?: string;
  isDebugMode?: boolean;
  loading?: boolean;
}

const MatchList: React.FC<MatchListProps> = ({
  matches,
  currentTeacher,
  onShowTeacherInfo,
  onBackToForm,
  title = "配對結果",
  isDebugMode = false,
  loading = false
}) => {
  // Filter matches for the current teacher
  const userMatches = currentTeacher
    ? matches.filter(match => isUserInvolved(match, currentTeacher))
    : [];
  
  // If no matches are found, show the "not found" message
  if (userMatches.length === 0 && !isDebugMode && !loading) {
    return (
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>{title}</Title>
            <Button onClick={onBackToForm} icon={<ArrowLeftOutlined />} size="small">返回</Button>
          </div>
        }
      >
        <Empty 
          description={
            <>尚未找到符合條件的配對結果。{currentTeacher ? "您的資料已登記，當有符合條件的教師登記時，系統將自動配對。" : ""}</>
          } 
        />
      </Card>
    );
  }

  // Generate tabs items for user matches and all matches (debug mode)
  const items = [
    {
      key: 'userMatches',
      label: (
        <Badge count={userMatches.length} size="small" offset={[5, 0]}>
          您的配對
        </Badge>
      ),
      children: loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Spin tip="載入中..." />
        </div>
      ) : userMatches.length > 0 ? (
        <Space direction="vertical" size="small" style={{ display: 'flex', width: '100%' }}>
          {userMatches.map((match, index) => (
            <MatchCard
              key={`user-match-${index}`}
              match={match}
              currentTeacher={currentTeacher}
              showDetailedView={true}
              onShowTeacherInfo={onShowTeacherInfo}
            />
          ))}
        </Space>
      ) : (
        <Empty description="目前沒有您參與的配對" />
      ),
      disabled: userMatches.length === 0 && !loading
    }
  ];

  // Add debug tab if in debug mode
  if (isDebugMode) {
    items.push({
      key: 'allMatches',
      label: (
        <Badge count={matches.length} size="small" offset={[5, 0]}>
          所有配對
        </Badge>
      ),
      children: loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Spin tip="載入中..." />
        </div>
      ) : (
        <Space direction="vertical" size="small" style={{ display: 'flex', width: '100%' }}>
          {matches.map((match, index) => (
            <MatchCard
              key={`all-match-${index}`}
              match={match}
              currentTeacher={currentTeacher}
              showDetailedView={true}
              onShowTeacherInfo={onShowTeacherInfo}
            />
          ))}
        </Space>
      ),
      disabled: matches.length === 0 && !loading
    });
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
          <Button onClick={onBackToForm} icon={<ArrowLeftOutlined />} size="small">返回</Button>
        </div>
      }
      styles={{ body: { padding: '12px' } }}
    >
      <Tabs 
        items={items} 
        defaultActiveKey="userMatches"
        size="small"
        tabBarStyle={{ marginBottom: 12 }}
      />
    </Card>
  );
};

export default MatchList;