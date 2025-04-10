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
    <div className="teacher-switcher">
      <div className="teacher-switcher-title">
        您有多個學校資料，請選擇要查看的學校：
      </div>
      
      <div className="teacher-switcher-buttons">
        {teachers.map(teacher => (
          <button
            key={teacher.id}
            onClick={() => teacher.id && onSwitchTeacher(teacher.id)}
            className={`teacher-button ${teacher.id === currentTeacherId ? 'active' : ''}`}
          >
            {teacher.current_county} • {teacher.current_district} • {teacher.current_school} • {teacher.subject || '未指定科目'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeacherSwitcher;