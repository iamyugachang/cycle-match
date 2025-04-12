import React from "react";
import { Card, Tag, Space, Typography } from "antd";
import { MatchResult, Teacher } from "../types";
import { getMatchTypeName, isUserInvolved } from "../utils/matchUtils";

const { Text } = Typography;

interface MatchCardProps {
  match: MatchResult;
  currentTeacher: Teacher | null;
  showDetailedView?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  currentTeacher, 
  showDetailedView = false 
}) => {
  const isInvolved = isUserInvolved(match, currentTeacher);
  
  return (
    <Card
      className={isInvolved ? 'highlighted-card' : ''}
      style={{ 
        marginBottom: 16, 
        borderColor: isInvolved ? '#3b82f6' : '#d1d5db',
        backgroundColor: isInvolved ? '#eff6ff' : 'white'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 0 33%' }}>
          <Text strong>{getMatchTypeName(match)}</Text>
          {isInvolved && (
            <div style={{ marginTop: 4 }}>
              <Tag color="blue">您參與的配對</Tag>
            </div>
          )}
        </div>
        
        <div style={{ flex: '0 0 67%' }}>
          <Space wrap style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {match.teachers.map((teacher, index) => (
              <React.Fragment key={teacher.id}>
                <Tag color={teacher.id === currentTeacher?.id ? 'blue' : 'default'}>
                  {teacher.name || teacher.email}
                </Tag>
                {index < match.teachers.length - 1 && <Text type="secondary">→</Text>}
              </React.Fragment>
            ))}
          </Space>
          
          {showDetailedView && match.createdAt && (
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                建立於: {new Date(match.createdAt).toLocaleString()}
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;