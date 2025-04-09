import { Teacher } from "../types";

interface TeacherSwitcherProps {
  teachers: Teacher[];
  currentTeacherId?: number;
  onSwitchTeacher: (teacherId: number) => void;
}

const TeacherSwitcher: React.FC<TeacherSwitcherProps> = ({
  teachers,
  currentTeacherId,
  onSwitchTeacher
}) => {
  // 如果沒有教師或只有一位教師，不顯示切換器
  if (!teachers || teachers.length <= 1) {
    return null;
  }

  return (
    <div style={{
      marginBottom: "15px",
      padding: "10px",
      backgroundColor: "#f2f8ff",
      borderRadius: "5px",
      border: "1px solid #c2e0ff"
    }}>
      <div style={{ 
        fontSize: "14px", 
        fontWeight: "bold", 
        marginBottom: "8px" 
      }}>
        您有多個學校資料，請選擇要查看的學校：
      </div>
      
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "8px" 
      }}>
        {teachers.map(teacher => (
          <button
            key={teacher.id}
            onClick={() => teacher.id && onSwitchTeacher(teacher.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: teacher.id === currentTeacherId ? "#007bff" : "#e9ecef",
              color: teacher.id === currentTeacherId ? "white" : "#495057",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s"
            }}
          >
            {teacher.current_county} • {teacher.current_district} • {teacher.current_school} • {teacher.subject || '未指定科目'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeacherSwitcher;