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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        width: '80%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>您有多個學校資料，請選擇要查看的學校：</h2>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          margin: '20px 0' 
        }}>
          {teachers.map((teacher) => (
            <li 
              key={teacher.id} 
              onClick={() => onSelectTeacher(teacher.id)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ marginRight: '15px', fontSize: '24px', color: '#6c757d' }}>
                <i className="fas fa-school"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {teacher.current_county} • {teacher.current_district} • {teacher.current_school} • {teacher.subject || '未指定科目'}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  希望調往: {teacher.target_counties.map((county, i) => 
                    `${county} | ${teacher.target_districts[i] || ''}`
                  ).join(', ')}
                </div>
              </div>
              <div style={{ 
                padding: '8px 12px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                選擇此筆
              </div>
            </li>
          ))}
        </ul>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSelectionModal;