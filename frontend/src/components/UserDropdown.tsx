import { useState, useRef, useEffect } from "react";
import { UserInfo } from "../types";

interface UserDropdownProps {
  userInfo: UserInfo;
  onShowResults: () => void;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  userInfo, 
  onShowResults, 
  onLogout 
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
        right: "10px",
        zIndex: 100
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* User avatar/button */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          padding: "5px 10px",
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "20px",
          cursor: "pointer",
          minWidth: "150px",  // Fixed width to prevent layout shifts
          justifyContent: "flex-start"
        }}
      >
        {userInfo.picture ? (
          <img
            src={userInfo.picture}
            alt={userInfo.name}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              marginRight: "8px"
            }}
          />
        ) : (
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#007bff",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "8px",
              fontSize: "12px"
            }}
          >
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ 
          overflow: "hidden", 
          textOverflow: "ellipsis", 
          whiteSpace: "nowrap" 
        }}>
          {userInfo.name}
        </span>
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
            right: "0",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "150px",
            marginTop: "2px" // Small gap between button and dropdown
          }}
        >
          <div style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <div style={{ fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis" }}>{userInfo.name}</div>
            <div style={{ fontSize: "12px", color: "#666", overflow: "hidden", textOverflow: "ellipsis" }}>{userInfo.email}</div>
          </div>
          <button
            onClick={() => {
              onShowResults();
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
            查看配對結果
          </button>
          <button
            onClick={() => {
              onLogout();
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
            登出
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;