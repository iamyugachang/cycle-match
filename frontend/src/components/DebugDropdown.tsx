// filepath: /Users/yugachang/Workspace/Personal/cycle-match/frontend/src/components/DebugDropdown.tsx
import { useRef, useState } from 'react';

interface DebugDropdownProps {
  onViewAllMatches: () => void;
  onDebugLogin: () => void;
}

const DebugDropdown: React.FC<DebugDropdownProps> = ({ onViewAllMatches, onDebugLogin }) => {
  const [debugDropdownHover, setDebugDropdownHover] = useState(false);
  const debugDropdownRef = useRef<HTMLDivElement>(null);
  
  // 定義固定寬度，使按鈕和下拉選單一致
  const dropdownWidth = "180px";

  return (
    <div 
      style={{ 
        position: "absolute", 
        top: "10px", 
        left: "10px",
      }}
      ref={debugDropdownRef}
      onMouseEnter={() => setDebugDropdownHover(true)}
      onMouseLeave={() => setDebugDropdownHover(false)}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        width: dropdownWidth
      }}>
        <button 
          style={{ 
            padding: "6px 12px",
            backgroundColor: debugDropdownHover ? "#5a6268" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: debugDropdownHover ? "4px 4px 0 0" : "4px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "background-color 0.2s ease-in-out",
            boxShadow: debugDropdownHover ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
            marginBottom: 0,
            width: "100%",
            textAlign: "center"
          }}
        >
          DEBUG MODE
        </button>
        
        {debugDropdownHover && (
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderTop: "none",
              borderRadius: "0 0 5px 5px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              width: "100%"
            }}
          >
            <button
              onClick={onViewAllMatches}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                textAlign: "left",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              顯示所有配對結果
            </button>
            <button
              onClick={onDebugLogin}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                textAlign: "left",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              模擬新使用者登入
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugDropdown;