import React from 'react';
import { Teacher } from '../types';
import EditTeacherForm from './EditTeacherForm';
import TeacherProfileCard from './TeacherProfileCard';
import { Typography, Button, Space, Row, Col, Empty, Alert, Divider } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface TeacherProfilePageProps {
  teachers: Teacher[];
  currentTeacherId?: number;
  editingTeacher: Teacher | null;
  loading: boolean;
  error: string;
  onEditTeacher: (teacherId: number) => void;
  onDeleteTeacher: (teacherId: number) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onCancelEdit: () => void;
  onShowResults: () => void;
  onBackToForm?: () => void;
}

const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({
  teachers,
  currentTeacherId,
  editingTeacher,
  loading,
  error,
  onEditTeacher,
  onDeleteTeacher,
  onUpdateTeacher,
  onCancelEdit,
  onShowResults,
  onBackToForm
}) => {
  // If no teachers, show empty state
  if (teachers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Empty
          description="您尚未登記任何介聘資料"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button 
          type="primary"
          onClick={onBackToForm}
          style={{ marginTop: 20 }}
          size="large"
        >
          返回表單填寫介聘資料
        </Button>
      </div>
    );
  }

  // If in edit mode, show the edit form
  if (editingTeacher) {
    return (
      <EditTeacherForm
        teacher={editingTeacher}
        onSubmit={onUpdateTeacher}
        onCancel={onCancelEdit}
        loading={loading}
        error={error}
      />
    );
  }

  // Otherwise show all teacher profiles
  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>我的介聘資料</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onBackToForm}
            >
              新增介聘資料
            </Button>
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={onShowResults}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              查看配對結果
            </Button>
          </Space>
        </Col>
      </Row>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      
      <div>
        {teachers.map(teacher => (
          <TeacherProfileCard
            key={teacher.id}
            teacher={teacher}
            isCurrentTeacher={teacher.id === currentTeacherId}
            onEdit={onEditTeacher}
            onDelete={onDeleteTeacher}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherProfilePage;