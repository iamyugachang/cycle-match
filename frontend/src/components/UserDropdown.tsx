import { useState } from "react";
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

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div style={{ 
      position: "absolute", 
      top: "10px", 
      right: "10px",
      zIndex: 100
    }}>
      {/* User avatar/button */}
      <button
        onClick={toggleDropdown}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "5px 10px",
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "20px",
          cursor: "pointer"
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
        {userInfo.name}
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "0",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "150px"
          }}
        >
          <div style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <div style={{ fontWeight: "bold" }}>{userInfo.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{userInfo.email}</div>
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