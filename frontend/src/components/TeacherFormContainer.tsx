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
    <div style={{ 
      padding: "20px", 
      border: "1px solid #ddd", 
      borderRadius: "5px" 
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 style={{ margin: 0 }}>登記 {currentYear} 年度介聘資料</h2>
      </div>
      
      <TeacherForm onSubmit={onSubmit} defaultEmail={defaultEmail} />
      
      {loading && <p style={{ textAlign: "center", marginTop: "10px" }}>處理中...</p>}
      {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default TeacherFormContainer;