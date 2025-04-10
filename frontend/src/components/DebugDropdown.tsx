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
    // Set a timeout to give user time to move to the dropdown
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
      className="debug-dropdown"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Debug button */}
      <button className="debug-button">
        Debug
      </button>

      {/* Dropdown menu */}
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
  );
};

export default DebugDropdown;