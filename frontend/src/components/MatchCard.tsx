import React from "react";
import { Card, Tag, Space, Typography, Divider, Row, Col } from "antd";
import { UserOutlined, SwapOutlined } from "@ant-design/icons";
import { MatchResult, Teacher } from "../types";
import { getMatchTypeName, isUserInvolved } from "../utils/matchUtils";
import styles from '../styles/MatchCard.module.css';

const { Text } = Typography;

interface MatchCardProps {
  match: MatchResult;
  currentTeacher: Teacher | null;
  showDetailedView?: boolean;
  onShowTeacherInfo?: (id: number | undefined, email: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  currentTeacher, 
  showDetailedView = false,
  onShowTeacherInfo
}) => {
  const isInvolved = isUserInvolved(match, currentTeacher);
  
  return (
    <Card
      className={`${styles.matchCard} ${isInvolved ? styles.highlightedCard : ''}`}
      style={{ marginBottom: 16 }}
      size="small"
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header section with match type and tag */}
        <div className={styles.cardHeader}>
          <Text strong>{getMatchTypeName(match)}</Text>
          {isInvolved && <Tag color="blue">您參與的配對</Tag>}
        </div>
        
        {/* Teachers display section */}
        <Space direction="vertical" style={{ width: '100%' }}>
          {match.teachers.map((teacher, index) => {
            const isCurrentUser = teacher.id === currentTeacher?.id;
            const nextTeacher = match.teachers[(index + 1) % match.teachers.length];
            
            return (
              <div key={teacher.id}>
                {/* Teacher row */}
                <div 
                  className={`${styles.teacherRow} ${isCurrentUser ? styles.currentUserRow : ''}`}
                  onClick={() => onShowTeacherInfo && onShowTeacherInfo(teacher.id, teacher.email)}
                >
                  <div className={styles.teacherInfo}>
                    <Text strong={isCurrentUser}>
                      {teacher.name || teacher.email}
                      {isCurrentUser && <Tag color="blue" className={styles.userTag}>您</Tag>}
                    </Text>
                    <div className={styles.schoolInfo}>
                      <Text type="secondary">
                        {teacher.current_county} • {teacher.current_district} • {teacher.current_school}
                      </Text>
                    </div>
                  </div>
                  {onShowTeacherInfo && (
                    <UserOutlined className={styles.infoIcon} />
                  )}
                </div>
                
                {/* Arrow between teachers (except after the last one) */}
                {index < match.teachers.length - 1 && (
                  <div className={styles.arrowContainer}>
                    <SwapOutlined rotate={90} />
                  </div>
                )}
              </div>
            );
          })}
        </Space>
        
        {/* Created time if detailed view */}
        {showDetailedView && match.createdAt && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <Text className={styles.timeStamp}>
              建立於: {new Date(match.createdAt).toLocaleString()}
            </Text>
          </>
        )}
      </div>
    </Card>
  );
};

export default MatchCard;