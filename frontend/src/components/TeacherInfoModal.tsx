import { Descriptions } from "antd";
import { MatchResult } from "../types";
import Modal from "./Modal";

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
  // Find the teacher display ID from matches
  const displayId = id 
    ? matches.flatMap(m => m.teachers).find(t => t.id === id)?.display_id || '未知'
    : '未知';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="教師聯絡資訊"
      size="small"
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="代號">{displayId}</Descriptions.Item>
        <Descriptions.Item label="Email">{email}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default TeacherInfoModal;