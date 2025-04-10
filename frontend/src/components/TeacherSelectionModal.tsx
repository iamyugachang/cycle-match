import { Teacher } from "../types";

interface TeacherSelectionModalProps {
  teachers: Teacher[];
  onSelectTeacher: (teacherId: number | undefined) => void;
  onClose: () => void;
}

const TeacherSelectionModal: React.FC<TeacherSelectionModalProps> = ({ 
  teachers, 
  onSelectTeacher, 
  onClose 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container large">
        <h2 className="modal-header">您有多個學校資料，請選擇要查看的學校：</h2>
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
        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="modal-close-btn secondary"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSelectionModal;