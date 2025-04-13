import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Popconfirm, Space, Dropdown, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import styles from '../styles/TeacherActionButtons.module.css';

interface TeacherActionButtonsProps {
  onEdit: (teacherId: number) => void;
  onDelete: (teacherId: number) => void;
  teacherId: number | undefined;
  isCurrentTeacher?: boolean;
}

const TeacherActionButtons: React.FC<TeacherActionButtonsProps> = ({ 
  onEdit, 
  onDelete, 
  teacherId, 
  isCurrentTeacher = false
}) => {
  if (!teacherId) {
    return null;
  }

  // State to track if mobile view should be used
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  
  // State for delete confirmation modal (mobile only)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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

  // Handle edit action
  const handleEdit = () => {
    onEdit(teacherId);
  };
  
  // Handle delete action
  const handleDelete = () => {
    if (isMobile) {
      setShowDeleteConfirm(true);
    } else {
      onDelete(teacherId);
    }
  };
  
  // Mobile delete confirmation modal
  const DeleteConfirmModal = () => (
    <Modal
      title="確認刪除"
      open={showDeleteConfirm}
      onOk={() => {
        onDelete(teacherId);
        setShowDeleteConfirm(false);
      }}
      onCancel={() => setShowDeleteConfirm(false)}
      okText="確認刪除"
      cancelText="取消"
      okButtonProps={{ danger: true }}
      centered
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <QuestionCircleOutlined style={{ fontSize: 22, color: '#faad14' }} />
        <p style={{ margin: 0 }}>確定要刪除此筆介聘資料嗎？此操作無法恢復。</p>
      </div>
    </Modal>
  );

  // For mobile view, use a dropdown menu to save space
  if (isMobile) {
    const items: MenuProps['items'] = [
      {
        key: 'edit',
        label: '編輯介聘資料',
        icon: <EditOutlined />,
        onClick: handleEdit
      },
      {
        key: 'delete',
        label: '刪除介聘資料',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: handleDelete
      }
    ];

    return (
      <>
        <Dropdown 
          menu={{ items }} 
          placement="bottomRight" 
          trigger={['click']}
          arrow={{ pointAtCenter: true }}
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            className={styles.moreButton}
          />
        </Dropdown>
        
        <DeleteConfirmModal />
      </>
    );
  }

  // For desktop view, use standard buttons
  return (
    <Space className={styles.actionContainer}>
      <Tooltip title="編輯介聘資料">
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={handleEdit}
          size="small"
          className={styles.actionButton}
        >
          編輯
        </Button>
      </Tooltip>
      
      <Popconfirm
        title="確定要刪除此筆介聘資料嗎？"
        description="此操作無法恢復。"
        onConfirm={handleDelete}
        okText="確定"
        cancelText="取消"
        placement="topRight"
      >
        <Button 
          type="primary" 
          danger 
          icon={<DeleteOutlined />}
          size="small"
          className={styles.actionButton}
        >
          刪除
        </Button>
      </Popconfirm>
    </Space>
  );
};

export default TeacherActionButtons;