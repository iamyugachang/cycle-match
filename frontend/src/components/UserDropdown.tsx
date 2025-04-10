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
      className="user-dropdown"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* User avatar/button */}
      <button className="user-button">
        {userInfo.picture ? (
          <img
            src={userInfo.picture}
            alt={userInfo.name}
            className="user-avatar"
          />
        ) : (
          <div className="user-avatar-placeholder">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="user-name">
          {userInfo.name}
        </span>
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="user-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="user-info">
            <div className="user-info-name">{userInfo.name}</div>
            <div className="user-info-email">{userInfo.email}</div>
          </div>
          <button
            onClick={() => {
              onShowResults();
              setShowDropdown(false);
            }}
            className="user-menu-item"
          >
            查看配對結果
          </button>
          <button
            onClick={() => {
              onLogout();
              setShowDropdown(false);
            }}
            className="user-menu-item"
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;