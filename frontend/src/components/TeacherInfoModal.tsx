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
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "5px",
        maxWidth: "400px",
        width: "100%"
      }}>
        <h3 style={{ marginTop: 0 }}>教師聯絡資訊</h3>
        <p><strong>代號:</strong> {displayId}</p>
        <p><strong>Email:</strong> {email}</p>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          關閉
        </button>
      </div>
    </div>
  );
};

export default TeacherInfoModal;