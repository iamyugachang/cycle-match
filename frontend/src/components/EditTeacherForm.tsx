import React from 'react';
import { Card, Button, Typography, Space, Alert, Spin, Form } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import TeacherForm from './TeacherForm';
import { Teacher } from '../types';

const { Title } = Typography;

interface EditTeacherFormProps {
  teacher: Teacher;
  onSubmit: (updatedTeacher: Teacher) => void;
  onCancel: () => void;
  loading: boolean;
  error: string;
}

const EditTeacherForm: React.FC<EditTeacherFormProps> = ({
  teacher,
  onSubmit,
  onCancel,
  loading,
  error
}) => {
  // Create a form instance to control the form
  const [form] = Form.useForm();
  
  // Get current ROC year
  const currentYear = new Date().getFullYear() - 1911;
  
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>編輯 {currentYear} 年度介聘資料</Title>
          <Button 
            onClick={onCancel} 
            icon={<ArrowLeftOutlined />}
            disabled={loading}
          >
            取消編輯
          </Button>
        </div>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {error && <Alert message={error} type="error" showIcon />}
        
        <Spin spinning={loading} tip="處理中...">
          <TeacherForm 
            onSubmit={onSubmit} 
            defaultEmail={teacher.email}
            initialData={teacher}
            isEditing={true}
            form={form}
          />
        </Spin>
      </Space>
    </Card>
  );
};

export default EditTeacherForm;