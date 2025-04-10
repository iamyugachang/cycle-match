import TeacherForm from "./TeacherForm";
import { Teacher } from "../types";

interface TeacherFormContainerProps {
  onSubmit: (teacher: Teacher) => void;
  defaultEmail?: string;
  loading: boolean;
  error: string;
}

const TeacherFormContainer: React.FC<TeacherFormContainerProps> = ({
  onSubmit,
  defaultEmail,
  loading,
  error
}) => {
  // 取得當前民國年度
  const currentYear = new Date().getFullYear() - 1911;
  
  return (
    <div className="teacher-form-container">
      <div className="teacher-form-header">
        <h2 className="teacher-form-title">登記 {currentYear} 年度介聘資料</h2>
      </div>
      
      <TeacherForm onSubmit={onSubmit} defaultEmail={defaultEmail} />
      
      {loading && <p className="loading-indicator">處理中...</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default TeacherFormContainer;