import { useState, useRef, useEffect } from "react";

interface DebugDropdownProps {
  onViewAllMatches: () => void;
  onDebugLogin: () => void;
}

const DebugDropdown: React.FC<DebugDropdownProps> = ({
  onViewAllMatches,
  onDebugLogin
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    // Clear any existing timeout to prevent the dropdown from closing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    // Set a longer timeout (500ms) to give user time to move to the dropdown
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  // Add effect to clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: 100
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Debug button */}
      <button
        style={{
          padding: "5px 10px",
          background: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          color: "#666",
          width: "60px"  // Fixed width to prevent layout shifts
        }}
      >
        Debug
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter} // Also prevent closing when hovering the dropdown
          onMouseLeave={handleMouseLeave}
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "150px",
            marginTop: "2px" // Small gap between button and dropdown
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