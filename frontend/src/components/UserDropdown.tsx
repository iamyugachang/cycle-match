import { useRef, useState } from 'react';
import { UserInfo } from '../types';

interface UserDropdownProps {
  userInfo: UserInfo;
  onShowResults: () => void;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userInfo, onShowResults, onLogout }) => {
  const [userDropdownHover, setUserDropdownHover] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // 定義固定寬度，確保頭像區域和下拉選單寬度一致
  const dropdownWidth = "180px";

  return (
    <div 
      style={{ position: "absolute", top: "10px", right: "10px" }}
      ref={userDropdownRef}
      onMouseEnter={() => setUserDropdownHover(true)}
      onMouseLeave={() => setUserDropdownHover(false)}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        width: dropdownWidth
      }}>
        <div
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: userDropdownHover ? "4px 4px 0 0" : "4px",
            backgroundColor: userDropdownHover ? "#f8f9fa" : "transparent",
            transition: "background-color 0.2s ease-in-out",
            width: "100%",
          }}
        >
          {userInfo.picture ? (
            <img
              src={userInfo.picture}
              alt="User Avatar"
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#007bff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              flexShrink: 0,
            }}>
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
        </div>
        
        {userDropdownHover && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #ddd",
              borderTop: "none",
              borderRadius: "0 0 4px 4px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              width: "100%",
            }}
          >
            <button
              onClick={onShowResults}
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
              顯示我的配對結果
            </button>
            <button
              onClick={onLogout}
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
              登出
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;