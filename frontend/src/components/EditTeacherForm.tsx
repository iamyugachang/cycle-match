import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Alert, Spin, Form, Modal, Drawer, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import TeacherForm from './TeacherForm';
import { Teacher } from '../types';
import styles from '../styles/EditTeacherForm.module.css';

const { Title, Text } = Typography;

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
  
  // State to track if the cancel confirmation modal is visible
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // State to track if mobile view should be used
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  
  // Add event listener for window resize to update mobile status
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle cancel button click
  const handleCancelClick = () => {
    // Check if form has been modified before showing confirmation
    const isFormModified = form.isFieldsTouched();
    
    if (isFormModified) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };
  
  // Handle form submission
  const handleSubmit = (values: Teacher) => {
    onSubmit({ ...values, id: teacher.id });
  };
  
  // Cancel confirmation modal
  const CancelConfirmModal = () => (
    <Modal
      title="確認放棄編輯"
      open={showCancelConfirm}
      onOk={onCancel}
      onCancel={() => setShowCancelConfirm(false)}
      okText="確認放棄"
      cancelText="繼續編輯"
      centered
    >
      <p>您已修改資料但尚未儲存，確定要放棄編輯嗎？</p>
    </Modal>
  );
  
  // For mobile, use a fixed header with back button and a separate save button at bottom
  if (isMobile) {
    return (
      <>
        {/* Fixed header */}
        <div className={styles.mobileHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Button 
              onClick={handleCancelClick} 
              icon={<ArrowLeftOutlined />}
              type="text"
              disabled={loading}
              className={styles.headerBackButton}
            />

            <Button 
              type="primary"
              onClick={() => form.submit()}
              disabled={loading}
              icon={<SaveOutlined />}
              className={styles.headerSaveButton}
            >
              儲存
            </Button>
          </div>
        </div>
        
        <div className={styles.mobileContent}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {error && <Alert message={error} type="error" showIcon className={styles.errorAlert} />}
            
            <Spin spinning={loading} tip="處理中...">
              <div className={styles.touchFriendlyForm}>
                <TeacherForm 
                  onSubmit={handleSubmit} 
                  defaultEmail={teacher.email}
                  initialData={teacher}
                  isEditing={true}
                  form={form}
                />
              </div>
            </Spin>
          </Space>
        </div>
        
        <CancelConfirmModal />
      </>
    );
  }
  
  // Desktop version
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>編輯 {currentYear} 年度介聘資料</Title>
          <Button 
            onClick={handleCancelClick} 
            icon={<ArrowLeftOutlined />}
            disabled={loading}
          >
            取消編輯
          </Button>
        </div>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {error && <Alert message={error} type="error" showIcon className={styles.errorAlert} />}
        
        <Spin spinning={loading} tip="處理中...">
          <TeacherForm 
            onSubmit={handleSubmit} 
            defaultEmail={teacher.email}
            initialData={teacher}
            isEditing={true}
            form={form}
          />
        </Spin>
      </Space>
      
      <CancelConfirmModal />
    </Card>
  );
};

export default EditTeacherForm;