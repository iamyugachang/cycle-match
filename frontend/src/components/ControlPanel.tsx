import React from 'react';
import { Teacher } from '../types';
import '../styles/components/ControlPanel.css';

interface DebugControlsProps {
  isDebugMode: boolean;
  userView: boolean;
  toggleUserView: () => void;
  onViewAllMatches: () => void;
  onDebugLogin: () => void;
}

// Debug mode controls with dropdown functionality
export const DebugControls: React.FC<DebugControlsProps> = ({ 
  isDebugMode,
  userView,
  toggleUserView,
  onViewAllMatches,
  onDebugLogin
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="debug-container">
      {/* Debug dropdown */}
      <div 
        className="debug-dropdown"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="debug-button">Debug</button>

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="debug-menu"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => {
                onViewAllMatches();
                setShowDropdown(false);
              }}
              className="debug-menu-item"
            >
              顯示所有配對
            </button>
            <button
              onClick={() => {
                onDebugLogin();
                setShowDropdown(false);
              }}
              className="debug-menu-item"
            >
              模擬登入
            </button>
          </div>
        )}
      </div>

      {/* Debug mode toggle - only visible when debug mode is active */}
      {isDebugMode && (
        <div className="debug-mode-control">
          <label className="debug-mode-label">
            <span>Debug 模式: {userView ? '用戶視角' : '所有配對'}</span>
            <button
              onClick={toggleUserView}
              className={`toggle-view-button ${userView ? 'user-view' : 'all-view'}`}
            >
              {userView ? "顯示所有配對" : "切換到用戶視角"}
            </button>
          </label>
        </div>
      )}
    </div>
  );
};

interface TeacherSwitcherProps {
  teachers: Teacher[];
  currentTeacherId?: number;
  onSwitchTeacher: (teacherId: number) => void;
}

// Teacher switcher component 
export const TeacherSwitcher: React.FC<TeacherSwitcherProps> = ({
  teachers,
  currentTeacherId,
  onSwitchTeacher
}) => {
  // Don't render if there are no teachers or only one teacher
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

interface PreviewSectionProps {
  showPreview: boolean;
  teacher: Teacher | null;
  togglePreview: () => void;
}

// Preview section component
export const PreviewSection: React.FC<PreviewSectionProps> = ({
  showPreview,
  teacher,
  togglePreview
}) => {
  if (!teacher) {
    return null;
  }

  return (
    <div className="preview-section">
      {showPreview && (
        <div className="preview-content">
          <div className="preview-item">
            <strong>現職地區 • 學校 • 科目：</strong> {teacher.current_county} • {teacher.current_district} • {teacher.current_school} • {teacher.subject}
          </div>
          <div className="preview-item">
            <strong>希望調往地區：</strong>
            <ul className="preview-list">
              {teacher.target_counties.map((county, i) => (
                <li key={i} className="preview-list-item">
                  {i+1}. {county} • {teacher.target_districts[i]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button
        onClick={togglePreview}
        className="preview-button"
      >
        {showPreview ? "收合預覽" : "預覽已填表格"}
      </button>
    </div>
  );
};