import { Typography, Button, Table, Empty, Tabs, Card } from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';
import { MatchResult, Teacher } from "../types";
import { getMatchTypeName, isUserInvolved } from "../utils/matchUtils";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

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
      render: (text: string, record: any) => (
        <Text strong={record.isCurrentUser}>{text}</Text>
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

  // If no matches are found, show the "not found" message
  if (userMatches.length === 0 && !isDebugMode) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>{title}</Title>
          <Button onClick={onBackToForm}>返回表單</Button>
        </div>
        <Empty description={
          <>尚未找到符合條件的配對結果。{currentTeacher ? "您的資料已登記，當有符合條件的教師登記時，系統將自動配對。" : ""}</>
        } />
      </Card>
    );
  }

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

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>{title}</Title>
        <Button onClick={onBackToForm}>返回表單</Button>
      </div>

      <Tabs defaultActiveKey="userMatches">
        {currentTeacher && userMatches.length > 0 && (
          <TabPane tab="您的配對" key="userMatches">
            {userMatches.map((match, index) => (
              <Card 
                title={getMatchTypeName(match)}
                key={`user-${index}`}
                style={{ marginBottom: 16, borderColor: '#3b82f6' }}
                type="inner"
              >
                <Table 
                  columns={columns} 
                  dataSource={getMatchTableData(match)}
                  pagination={false}
                  size="small"
                  rowClassName={(record) => record.isCurrentUser ? 'current-user-row' : ''}
                />
              </Card>
            ))}
          </TabPane>
        )}
        
        {isDebugMode && (
          <TabPane tab="所有可能的配對" key="allMatches">
            {matches.map((match, index) => (
              <Card 
                title={getMatchTypeName(match)}
                key={index}
                style={{ marginBottom: 16 }}
                type="inner"
              >
                <Table 
                  columns={columns} 
                  dataSource={getMatchTableData(match)}
                  pagination={false}
                  size="small"
                  rowClassName={(record) => record.isCurrentUser ? 'current-user-row' : ''}
                />
              </Card>
            ))}
          </TabPane>
        )}
      </Tabs>
    </Card>
  );
};

export default MatchList;