import { useEffect, useState } from "react";
import { fetchSubjects } from "../utils/subjectUtils";

interface SubjectSelectorProps {
  defaultSubject?: string;
  onSubjectChange: (subject: string) => void;
  className?: string;
  required?: boolean;
  label?: string;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  defaultSubject = "",
  onSubjectChange,
  className = "",
  required = false,
  label = "任教科目"
}) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState(defaultSubject || "");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Fetch subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoading(true);
      
      try {
        const data = await fetchSubjects();
        setSubjects(data);
        
        // If we have a default subject, select it
        if (defaultSubject && data.includes(defaultSubject)) {
          setSelectedSubject(defaultSubject);
        }
      } catch (err) {
        setError("獲取科目資料失敗");
        console.error("獲取科目資料失敗:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubjects();
  }, [defaultSubject]);
  
  // Update when defaultSubject changes
  useEffect(() => {
    if (defaultSubject && defaultSubject !== selectedSubject) {
      setSelectedSubject(defaultSubject);
    }
  }, [defaultSubject, selectedSubject]);
  
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    onSubjectChange(subject);
  };
  
  if (isLoading) {
    return <div className="loading-placeholder">載入中...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className={`subject-selector ${className}`}>
      <label htmlFor="subject">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      <div className="select-wrapper">
        <select
          id="subject"
          value={selectedSubject}
          onChange={handleSubjectChange}
          required={required}
          className="form-select"
        >
          <option value="">請選擇科目</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SubjectSelector;