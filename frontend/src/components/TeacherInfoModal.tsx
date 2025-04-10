import { MatchResult } from "../types";

interface TeacherInfoModalProps {
  id: number | undefined;
  email: string;
  matches: MatchResult[];
  onClose: () => void;
}

const TeacherInfoModal: React.FC<TeacherInfoModalProps> = ({ id, email, matches, onClose }) => {
  // Find the teacher display ID from matches
  const displayId = id 
    ? matches.flatMap(m => m.teachers).find(t => t.id === id)?.display_id || '未知'
    : '未知';

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3 className="modal-header">教師聯絡資訊</h3>
        <div className="teacher-info-item">
          <span className="teacher-info-label">代號:</span> {displayId}
        </div>
        <div className="teacher-info-item">
          <span className="teacher-info-label">Email:</span> {email}
        </div>
        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="modal-close-btn"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherInfoModal;