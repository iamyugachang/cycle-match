import { ReactNode } from 'react';
import UserDropdown from '../UserDropdown';
import DebugDropdown from '../DebugDropdown';
import { UserInfo } from '../../types';

interface AppLayoutProps {
  children: ReactNode;
  userInfo: UserInfo | null;
  onShowResults: () => void;
  onLogout: () => void;
  onViewAllMatches: () => void;
  onDebugLogin: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  userInfo, 
  onShowResults, 
  onLogout,
  onViewAllMatches,
  onDebugLogin
}) => {
  // 取得當前民國年
  const currentYear = new Date().getFullYear() - 1911;
  
  return (
    <main className="app-layout">
      {/* Debug Mode dropdown - left top corner */}
      <DebugDropdown 
        onViewAllMatches={onViewAllMatches} 
        onDebugLogin={onDebugLogin} 
      />
      
      {/* User dropdown - right top corner */}
      {userInfo && (
        <UserDropdown 
          userInfo={userInfo} 
          onShowResults={onShowResults} 
          onLogout={onLogout} 
        />
      )}

      <h1 className="app-title">
        CircleMatch - 台灣 {currentYear} 年度小學教師介聘配對系統
      </h1>

      {children}
    </main>
  );
};

export default AppLayout;