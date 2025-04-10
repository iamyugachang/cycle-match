interface DebugModeToggleProps {
    userView: boolean;
    toggleUserView: () => void;
  }
  
  const DebugModeToggle: React.FC<DebugModeToggleProps> = ({
    userView,
    toggleUserView
  }) => {
    return (
      <div className="debug-mode-control">
        <label className="debug-mode-label">
          <span>Debug 模式: {userView ? '用戶視角' : '所有配對'}</span>
          <button
            onClick={toggleUserView}
            className={`toggle-view-button ${userView ? 'user-view' : 'all-view'}`}
          >
            {userView ? "顯示所有配對" : "切換到用戶視角"}
          </button>
        </label>
      </div>
    );
  };
  
  export default DebugModeToggle;