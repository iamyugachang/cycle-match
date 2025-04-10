import { useState } from "react";
import { useUserViewModel } from "../viewmodels/UserViewModel";
import { useMatchViewModel } from "../viewmodels/MatchViewModel";

// Components
import AppLayout from "../components/layout/AppLayout";
import WelcomeBanner from "../components/WelcomeBanner";
import TeacherFormContainer from "../components/TeacherFormContainer";
import MatchList from "../components/MatchList";
import TeacherInfoModal from "../components/TeacherInfoModal";
import TeacherSwitcher from "../components/TeacherSwitcher";
import DebugModeToggle from "../components/DebugModeToggle";
import PreviewSection from "../components/PreviewSection";
import { Teacher } from "../types";

export default function Home() {
  // UI state
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // State for preview
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFormIndex, setSelectedFormIndex] = useState(0);

  // Initialize view models
  const userVM = useUserViewModel();
  const matchVM = useMatchViewModel(userVM.currentTeacher, userVM.allTeachers);
  
  // Function to handle teacher form submission
  const handleCreateTeacher = async (teacher: Teacher) => {
    try {
      const createdTeacher = await matchVM.createTeacher(teacher, userVM.userInfo?.google_id);
      
      // 添加新教師到所有教師列表中
      const updatedTeachers = [...userVM.allTeachers, createdTeacher];
      userVM.setAllTeachers(updatedTeachers);
      
      // 設置當前教師為新創建的教師
      userVM.setCurrentTeacher(createdTeacher);
      
      setShowResults(true);
      setShowForm(false);
    } catch (error) {
      // Error is already handled in the view model
    }
  };

  // Function to handle the "back to form" button
  const handleBackToForm = () => {
    setShowResults(false);
    setShowForm(true);
  };

  // View all matches in debug mode
  const handleViewAllMatches = async () => {
    matchVM.enableDebugMode();
    await matchVM.fetchMatches();
    setShowResults(true);
    setShowForm(false);
    
    // If user is not logged in, create a minimal debug session
    if (!userVM.userInfo) {
      userVM.setUserInfo({
        name: "Debug Viewer",
        picture: "",
        email: "debug@example.com",
        google_id: "debug@example.com",
      });
    }
  };

  // Debug login function
  const handleDebugLogin = async () => {
    const googleId = prompt("請輸入模擬的 Google ID (email):", "test@example.com");
    
    if (googleId) {
      try {
        const result = await userVM.debugLogin(googleId);
        
        if (result?.teachers?.length > 0) {
          // Teacher data was found, show matches
          matchVM.fetchMatches();
          setShowResults(true);
          setShowForm(false);
        } else {
          // No teacher data, show form
          setShowForm(true);
          setShowResults(false);
        }
      } catch (error) {
        // Error is handled in the view model
      }
    }
  };

  // Show results after successful login if teacher already exists
  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const result = await userVM.handleGoogleLoginSuccess(credentialResponse);
      
      if (result?.teachers?.length > 0) {
        await matchVM.fetchMatches();
        setShowResults(true);
        setShowForm(false);
      } else {
        setShowForm(true);
        setShowResults(false);
      }
    } catch (error) {
      // Error is handled in the view model
    }
  };

  // Show results from user dropdown
  const handleShowResults = () => {
    matchVM.fetchMatches();
    setShowResults(true);
    setShowForm(false);
  };

  // 切換當前選中的教師
  const handleSwitchTeacher = (teacherId: number) => {
    if (userVM.switchTeacher(teacherId)) {
      // 刷新匹配結果
      matchVM.fetchMatches(); // Ensure matches are recalculated
      setShowResults(true); // Ensure results are displayed
      setShowForm(false); // Hide the form
    }
  };

  // Toggle preview visibility
  const togglePreview = () => setShowPreview(!showPreview);

  // Handle form switching
  const handleFormSwitch = (index: number) => setSelectedFormIndex(index);

  return (
    <AppLayout 
      userInfo={userVM.userInfo}
      onShowResults={handleShowResults}
      onLogout={userVM.logout}
      onViewAllMatches={handleViewAllMatches}
      onDebugLogin={handleDebugLogin}
    >
      {/* Landing page for unauthenticated users */}
      {!userVM.userInfo ? (
        <WelcomeBanner 
          onSuccess={handleLoginSuccess}
          onError={userVM.handleGoogleLoginFailure}
        />
      ) : (
        <>
          {/* Teacher registration form */}
          {showForm && (
            <TeacherFormContainer
              onSubmit={handleCreateTeacher}
              defaultEmail={userVM.userInfo.email}
              loading={matchVM.loading || userVM.loading}
              error={matchVM.error || userVM.error}
            />
          )}

          {/* Match results display */}
          {showResults && (
            <>
              {/* Debug 模式下的用戶視角切換按鈕 */}
              {matchVM.isDebugMode && (
                <DebugModeToggle 
                  userView={matchVM.userView}
                  toggleUserView={matchVM.toggleUserView}
                />
              )}

              {/* Teacher switcher */}
              {userVM.allTeachers.length > 1 && (
                <TeacherSwitcher 
                  teachers={userVM.allTeachers} 
                  currentTeacherId={userVM.currentTeacher?.id} 
                  onSwitchTeacher={handleSwitchTeacher} 
                />
              )}

              {/* Preview Section */}
              <PreviewSection
                showPreview={showPreview}
                teacher={userVM.currentTeacher}
                togglePreview={togglePreview}
              />

              {/* XX年度配對結果 */}
              <MatchList
                matches={matchVM.getFilteredMatches()}
                currentTeacher={userVM.currentTeacher}
                onShowTeacherInfo={matchVM.showTeacherInfo}
                onBackToForm={handleBackToForm}
                title={matchVM.getViewModeTitle()}
                isDebugMode={matchVM.isDebugMode && !matchVM.userView}
              />
            </>
          )}

          {/* Teacher info modal */}
          {matchVM.teacherInfo && (
            <TeacherInfoModal
              id={matchVM.teacherInfo.id}
              email={matchVM.teacherInfo.email}
              matches={matchVM.matches}
              onClose={matchVM.closeTeacherInfo}
            />
          )}
        </>
      )}
    </AppLayout>
  );
}