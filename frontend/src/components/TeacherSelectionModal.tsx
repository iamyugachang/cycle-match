import { List, Button, Typography } from "antd";
import { RightOutlined } from '@ant-design/icons';
import { Teacher } from "../types";
import Modal from "./Modal";

const { Text } = Typography;

interface TeacherSelectionModalProps {
  teachers: Teacher[];
  onSelectTeacher: (teacherId: number | undefined) => void;
  onClose: () => void;
  isOpen: boolean;
}

const TeacherSelectionModal: React.FC<TeacherSelectionModalProps> = ({ 
  teachers, 
  onSelectTeacher, 
  onClose,
  isOpen 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="您有多個學校資料，請選擇要查看的學校："
      size="large"
      closeButtonText="返回"
    >
      <List
        dataSource={teachers}
        renderItem={(teacher) => (
          <List.Item 
            key={teacher.id}
            onClick={() => onSelectTeacher(teacher.id)}
            style={{ cursor: 'pointer' }}
            actions={[
              <Button type="primary" size="small" onClick={(e) => {
                e.stopPropagation();
                onSelectTeacher(teacher.id);
              }}>
                選擇此筆
              </Button>
            ]}
          >
            <List.Item.Meta
              title={`${teacher.current_county} • ${teacher.current_district} • ${teacher.current_school} • ${teacher.subject || '未指定科目'}`}
              description={`希望調往: ${teacher.target_counties.map((county, i) => 
                `${county} | ${teacher.target_districts[i] || ''}`
              ).join(', ')}`}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default TeacherSelectionModal;