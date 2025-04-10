import { Teacher } from "../types";

interface PreviewSectionProps {
  showPreview: boolean;
  teacher: Teacher | null;
  togglePreview: () => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
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
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0
            }}>
              {teacher.target_counties.map((county, i) => (
                <li key={i} style={{
                  padding: "5px 0",
                  borderBottom: i < teacher.target_counties.length - 1 ? "1px solid #ddd" : "none"
                }}>
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

export default PreviewSection;