import React from 'react';
import { Button, Tooltip, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

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

  return (
    <Space>
      <Tooltip title="編輯介聘資料">
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => onEdit(teacherId)}
          size="small"
        >
          編輯
        </Button>
      </Tooltip>
      
      <Popconfirm
        title="確定要刪除此筆介聘資料嗎？"
        description="此操作無法恢復。"
        onConfirm={() => onDelete(teacherId)}
        okText="確定"
        cancelText="取消"
        placement="topRight"
      >
        <Button 
          type="primary" 
          danger 
          icon={<DeleteOutlined />}
          size="small"
        >
          刪除
        </Button>
      </Popconfirm>
    </Space>
  );
};

export default TeacherActionButtons;