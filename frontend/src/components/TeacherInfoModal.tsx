import React from "react";
import { Descriptions, Drawer, Button, Typography, Space, Divider, message } from "antd";
import { MailOutlined, CopyOutlined, UserOutlined } from "@ant-design/icons";
import { MatchResult } from "../types";

const { Text, Title } = Typography;

interface TeacherInfoModalProps {
  id: number | undefined;
  email: string;
  matches: MatchResult[];
  onClose: () => void;
  isOpen: boolean;
}

const TeacherInfoModal: React.FC<TeacherInfoModalProps> = ({ 
  id, 
  email, 
  matches, 
  onClose,
  isOpen 
}) => {
  // Find the teacher display ID and information from matches
  const teacherInfo = id 
    ? matches.flatMap(m => m.teachers).find(t => t.id === id)
    : null;
  
  const displayId = teacherInfo?.display_id || '未知';
  
  // Copy email to clipboard
  const copyEmail = () => {
    navigator.clipboard.writeText(email)
      .then(() => {
        message.success('已複製Email到剪貼簿');
      })
      .catch(() => {
        message.error('複製失敗，請手動複製');
      });
  };
  
  // Send email
  const sendEmail = () => {
    window.location.href = `mailto:${email}`;
  };
  
  return (
    <Drawer
      title="教師聯絡資訊"
      placement="bottom"
      onClose={onClose}
      open={isOpen}
      height="auto"
      contentWrapperStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      extra={
        <Button size="small" type="primary" onClick={onClose}>
          關閉
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ 
            width: 60, 
            height: 60, 
            borderRadius: 30, 
            backgroundColor: '#e6f7ff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 12px' 
          }}>
            <UserOutlined style={{ fontSize: 28, color: '#1890ff' }} />
          </div>
          
          <Title level={5} style={{ margin: 0 }}>
            {teacherInfo?.name || displayId}
          </Title>
          
          {teacherInfo && (
            <Text type="secondary">
              {teacherInfo.current_county} • {teacherInfo.current_district} • {teacherInfo.current_school}
            </Text>
          )}
        </div>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>聯絡Email：</Text>
            <Text copyable={{ tooltips: ['複製', '已複製'] }}>{email}</Text>
          </div>
          
          {teacherInfo?.subject && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>任教科目：</Text>
              <Text>{teacherInfo.subject}</Text>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>介聘代號：</Text>
            <Text>{displayId}</Text>
          </div>

          {teacherInfo?.target_counties && teacherInfo.target_counties.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <Text strong>希望調往：</Text>
              <div style={{ textAlign: 'right', maxWidth: '70%' }}>
                {teacherInfo.target_counties.map((county, idx) => (
                  <div key={idx}>
                    {county} {teacherInfo.target_districts && teacherInfo.target_districts[idx] ? `• ${teacherInfo.target_districts[idx]}` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Space>
        
        <div style={{ marginTop: 16 }}>
          <Button 
            type="primary" 
            icon={<MailOutlined />} 
            block 
            onClick={sendEmail}
            style={{ marginBottom: 12 }}
          >
            寄送Email
          </Button>
          
          <Button 
            icon={<CopyOutlined />} 
            block
            onClick={copyEmail}
          >
            複製Email
          </Button>
        </div>
        
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center', marginTop: 16 }}>
          提醒：請禮貌聯繫對方，並尊重隱私。
        </Text>
      </Space>
    </Drawer>
  );
};

export default TeacherInfoModal;