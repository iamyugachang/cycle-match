import { ReactNode, useState, useEffect } from 'react';
import UserDropdown from '../UserDropdown';
import { useDevice } from '../../context/DeviceContext';
import { UserInfo } from '../../types';

interface ResponsiveLayoutProps {
  children: ReactNode;
  userInfo: UserInfo | null;
  onShowResults: () => void;
  onLogout: () => void;
  onViewAllMatches: () => void;
  onDebugLogin: () => void;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  userInfo, 
  onShowResults, 
  onLogout,
  onViewAllMatches,
  onDebugLogin
}) => {
  // Get current ROC year
  const currentYear = new Date().getFullYear() - 1911;
  
  // Track scroll for sticky header behavior
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobile } = useDevice();

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <main className="app-layout">
      {/* Sticky header for mobile */}
      <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          {/* Logo/Title - smaller on mobile */}
          <h1 className="app-title">
            {isMobile ? `CircleMatch ${currentYear}` : `CircleMatch - 台灣 ${currentYear} 年度小學教師介聘配對系統`}
          </h1>
          
          {/* User controls */}
          {userInfo && (
            <div className="header-controls">
              <div className="user-wrapper">
                <UserDropdown 
                  userInfo={userInfo} 
                  onShowResults={onShowResults} 
                  onLogout={onLogout} 
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content with proper spacing to account for fixed header */}
      <div className="main-content">
        {children}
      </div>
      
      {/* Simple footer */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} CircleMatch - 台灣教師調動配對系統</p>
      </footer>
    </main>
  );
};

export default ResponsiveLayout;