import { useState } from "react";

interface DebugDropdownProps {
  onViewAllMatches: () => void;
  onDebugLogin: () => void;
}

const DebugDropdown: React.FC<DebugDropdownProps> = ({
  onViewAllMatches,
  onDebugLogin
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div style={{
      position: "absolute",
      top: "10px",
      left: "10px",
      zIndex: 100
    }}>
      {/* Debug button */}
      <button
        onClick={toggleDropdown}
        style={{
          padding: "5px 10px",
          background: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          color: "#666"
        }}
      >
        Debug
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "35px",
            left: "0",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "150px"
          }}
        >
          <button
            onClick={() => {
              onViewAllMatches();
              setShowDropdown(false);
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom: "1px solid #eee"
            }}
          >
            顯示所有配對
          </button>
          <button
            onClick={() => {
              onDebugLogin();
              setShowDropdown(false);
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            模擬登入
          </button>
        </div>
      )}
    </div>
  );
};

export default DebugDropdown;