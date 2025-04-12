import React from 'react';
import { Card, Typography, Button, Table, Empty, Tabs, Tag, Space } from 'antd';
import { InfoCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { MatchResult, Teacher } from "../types";
import { getMatchTypeName, isUserInvolved } from "../utils/matchUtils";

const { Title } = Typography;

interface MatchListProps {
  matches: MatchResult[];
  currentTeacher: Teacher | null;
  onShowTeacherInfo: (id: number | undefined, email: string) => void;
  onBackToForm: () => void;
  title?: string;
  isDebugMode?: boolean;
}

const MatchList: React.FC<MatchListProps> = ({
  matches,
  currentTeacher,
  onShowTeacherInfo,
  onBackToForm,
  title = "配對結果",
  isDebugMode = false
}) => {
  // Filter matches for the current teacher
  const userMatches = currentTeacher
    ? matches.filter(match => isUserInvolved(match, currentTeacher))
    : [];

  const columns = [
    {
      title: '教師',
      dataIndex: 'displayId',
      key: 'displayId',
      render: (_: string, record: any) => (
        <Typography.Text strong={record.isCurrentUser}>
          {record.displayId}
          {record.isCurrentUser && <Tag color="blue" style={{ marginLeft: 8 }}>您</Tag>}
        </Typography.Text>
      )
    },
    {
      title: '現任學校',
      dataIndex: 'currentSchool',
      key: 'currentSchool',
    },
    {
      title: '目標調往區域',
      dataIndex: 'targetArea',
      key: 'targetArea',
    },
    {
      title: '任教科目',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '資訊',
      key: 'info',
      width: 80,
      render: (_: any, record: any) => (
        <Button 
          icon={<InfoCircleOutlined />} 
          shape="circle" 
          size="small"
          onClick={() => onShowTeacherInfo(record.id, record.email)}
        />
      ),
    },
  ];

  // Function to transform match data for table display
  const getMatchTableData = (match: MatchResult) => {
    return match.teachers.map((teacher, idx) => {
      const nextTeacher = match.teachers[(idx + 1) % match.teachers.length];
      const isCurrentUser = currentTeacher && teacher.id === currentTeacher.id;
      
      return {
        key: `${match.id}-${teacher.id}`,
        id: teacher.id,
        email: teacher.email,
        displayId: teacher.display_id || `${teacher.current_county}${teacher.current_district}#${teacher.id}`,
        currentSchool: `${teacher.current_county} • ${teacher.current_district} • ${teacher.current_school}`,
        targetArea: `${nextTeacher.current_county} • ${nextTeacher.current_district}`,
        subject: teacher.subject || "未指定",
        isCurrentUser
      };
    });
  };

  // If no matches are found, show the "not found" message
  if (userMatches.length === 0 && !isDebugMode) {
    return (
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>{title}</Title>
            <Button onClick={onBackToForm} icon={<ArrowLeftOutlined />}>返回表單</Button>
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

  const items = [
    {
      key: 'userMatches',
      label: '您的配對',
      children: userMatches.length > 0 ? (
        <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
          {userMatches.map((match, index) => (
            <Card 
              key={`user-${index}`}
              title={getMatchTypeName(match)}
              style={{ borderColor: '#1890ff' }}
              size="small"
            >
              <Table 
                columns={columns} 
                dataSource={getMatchTableData(match)}
                pagination={false}
                rowClassName={(record: { isCurrentUser: boolean }) => record.isCurrentUser ? 'current-user-row' : ''}
              />
            </Card>
          ))}
        </Space>
      ) : (
        <Empty description="目前沒有您參與的配對" />
      ),
      disabled: userMatches.length === 0
    }
  ];

  // Add debug tab if in debug mode
  if (isDebugMode) {
    items.push({
      key: 'allMatches',
      label: '所有可能的配對',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
          {matches.map((match, index) => (
            <Card 
              key={index}
              title={getMatchTypeName(match)}
              size="small"
            >
              <Table 
                columns={columns} 
                dataSource={getMatchTableData(match)}
                pagination={false}
                size="small"
                rowClassName={(record: { isCurrentUser: boolean }) => record.isCurrentUser ? 'current-user-row' : ''}
              />
            </Card>
          ))}
        </Space>
      ),
      disabled: matches.length === 0
    });
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
          <Button onClick={onBackToForm} icon={<ArrowLeftOutlined />}>返回表單</Button>
        </div>
      }
    >
      <Tabs items={items} defaultActiveKey="userMatches" />
    </Card>
  );
};

export default MatchList;