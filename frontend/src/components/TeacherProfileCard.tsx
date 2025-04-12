import React from 'react';
import { Teacher } from '../types';
import TeacherActionButtons from './TeacherActionButtons';
import { Card, Typography, Space, List, Tag, Divider } from 'antd';

const { Title, Text } = Typography;

interface TeacherProfileCardProps {
  teacher: Teacher;
  isCurrentTeacher?: boolean;
  onEdit: (teacherId: number) => void;
  onDelete: (teacherId: number) => void;
}

const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({
  teacher,
  isCurrentTeacher = false,
  onEdit,
  onDelete
}) => {
  if (!teacher) return null;
  
  return (
    <Card 
      style={{ 
        marginBottom: 16, 
        borderColor: isCurrentTeacher ? '#1890ff' : undefined,
        boxShadow: isCurrentTeacher ? '0 0 8px rgba(24,144,255,0.3)' : undefined
      }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space direction="vertical" size={0}>
            <Title level={5} style={{ margin: 0 }}>
              {teacher.current_county} • {teacher.current_district} • {teacher.current_school}
            </Title>
            <Text type="secondary">{teacher.display_id || `ID: ${teacher.id}`}</Text>
          </Space>
          <TeacherActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            teacherId={teacher.id}
            isCurrentTeacher={isCurrentTeacher}
          />
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>科目: </Text>
          <Text>{teacher.subject || '未指定'}</Text>
        </div>
        
        <div>
          <Text strong>希望調往地區:</Text>
          <List
            size="small"
            dataSource={teacher.target_counties}
            renderItem={(county, i) => (
              <List.Item style={{ padding: '4px 0' }}>
                <Tag color="blue">{i+1}</Tag> {county} • {teacher.target_districts[i] || ''}
              </List.Item>
            )}
          />
        </div>
        
        <div>
          <Text strong>聯絡信箱: </Text>
          <Text>{teacher.email}</Text>
        </div>
      </Space>
    </Card>
  );
};

export default TeacherProfileCard;