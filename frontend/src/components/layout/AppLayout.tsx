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
  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
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

      <h1 style={{ textAlign: "center", marginBottom: "20px", marginTop: "40px" }}>
        CircleMatch - 教師介聘配對系統
      </h1>

      {children}
    </main>
  );
};

export default AppLayout;