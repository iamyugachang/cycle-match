import { Teacher } from "../types";
import Modal from "./Modal";

interface TeacherSelectionModalProps {
  teachers: Teacher[];
  onSelectTeacher: (teacherId: number | undefined) => void;
  onClose: () => void;
  isOpen: boolean; // Added to match Modal component expectations
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
      <ul className="teacher-selection-list">
        {teachers.map((teacher) => (
          <li 
            key={teacher.id} 
            onClick={() => onSelectTeacher(teacher.id)}
            className="teacher-selection-item"
          >
            <div className="teacher-selection-icon">
              <i className="fas fa-school"></i>
            </div>
            <div className="teacher-selection-content">
              <div className="teacher-selection-title">
                {teacher.current_county} • {teacher.current_district} • {teacher.current_school} • {teacher.subject || '未指定科目'}
              </div>
              <div className="teacher-selection-subtitle">
                希望調往: {teacher.target_counties.map((county, i) => 
                  `${county} | ${teacher.target_districts[i] || ''}`
                ).join(', ')}
              </div>
            </div>
            <div className="teacher-selection-action">
              選擇此筆
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default TeacherSelectionModal;