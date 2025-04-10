import { MatchResult } from "../types";
import Modal from "./Modal";

interface TeacherInfoModalProps {
  id: number | undefined;
  email: string;
  matches: MatchResult[];
  onClose: () => void;
  isOpen: boolean; // Added to match Modal component expectations
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
      <div className="teacher-info-item">
        <span className="teacher-info-label">代號:</span> {displayId}
      </div>
      <div className="teacher-info-item">
        <span className="teacher-info-label">Email:</span> {email}
      </div>
    </Modal>
  );
};

export default TeacherInfoModal;