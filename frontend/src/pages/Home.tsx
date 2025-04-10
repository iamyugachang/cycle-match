import { useState } from "react";
import { useUserViewModel } from "../viewmodels/UserViewModel";
import { useMatchViewModel } from "../viewmodels/MatchViewModel";

// Components
import AppLayout from "../components/layout/AppLayout";
import WelcomeBanner from "../components/WelcomeBanner";
import TeacherFormContainer from "../components/TeacherFormContainer";
import MatchList from "../components/MatchList";
import TeacherInfoModal from "../components/TeacherInfoModal";
import { DebugControls, TeacherSwitcher, PreviewSection } from "../components/ControlPanel";
import { Teacher } from "../types";

export default function Home() {
  // UI state
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize view models
  const userVM = useUserViewModel();
  const matchVM = useMatchViewModel(userVM.currentTeacher, userVM.allTeachers);
  
  // Handle teacher form submission
  const handleCreateTeacher = async (teacher: Teacher) => {
    try {
      const createdTeacher = await matchVM.createTeacher(teacher, userVM.userInfo?.google_id);
      
      // Add new teacher to all teachers list
      userVM.setAllTeachers([...userVM.allTeachers, createdTeacher]);
      
      // Set current teacher to the newly created one
      userVM.setCurrentTeacher(createdTeacher);
      
      // Show match results
      setShowResults(true);
      setShowForm(false);
    } catch (error) {
      // Error is already handled in the view model
    }
  };

  // Handle back to form button
  const handleBackToForm = () => {
    setShowResults(false);
    setShowForm(true);
  };

  // Debug: View all matches
  const handleViewAllMatches = async () => {
    matchVM.enableDebugMode();
    await matchVM.fetchMatches();
    setShowResults(true);
    setShowForm(false);
    
    // Create minimal debug session if user not logged in
    if (!userVM.userInfo) {
      userVM.setUserInfo({
        name: "Debug Viewer",
        picture: "",
        email: "debug@example.com",
        google_id: "debug@example.com",
      });
    }
  };

  // Debug: Login with specified ID
  const handleDebugLogin = async () => {
    const googleId = prompt("請輸入模擬的 Google ID (email):", "test@example.com");
    
    if (googleId) {
      try {
        const result = await userVM.debugLogin(googleId);
        
        if (result?.teachers?.length > 0) {
          // Teacher data found, show matches
          matchVM.fetchMatches();
          setShowResults(true);
          setShowForm(false);
        } else {
          // No teacher data, show form
          setShowForm(true);
          setShowResults(false);
        }
      } catch (error) {
        // Error handled in view model
      }
    }
  };

  // Handle Google login success
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
      // Error handled in view model
    }
  };

  // Show results from user dropdown
  const handleShowResults = () => {
    matchVM.fetchMatches();
    setShowResults(true);
    setShowForm(false);
  };

  // Switch between multiple teacher records
  const handleSwitchTeacher = (teacherId: number) => {
    if (userVM.switchTeacher(teacherId)) {
      // Refresh matches
      matchVM.fetchMatches();
      setShowResults(true);
      setShowForm(false);
    }
  };

  // Toggle preview visibility
  const togglePreview = () => setShowPreview(!showPreview);

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
              {/* Debug mode controls */}
              <DebugControls 
                isDebugMode={matchVM.isDebugMode}
                userView={matchVM.userView}
                toggleUserView={matchVM.toggleUserView}
                onViewAllMatches={handleViewAllMatches}
                onDebugLogin={handleDebugLogin}
              />

              {/* Teacher switcher - only visible with multiple teacher records */}
              {userVM.allTeachers.length > 1 && (
                <TeacherSwitcher 
                  teachers={userVM.allTeachers} 
                  currentTeacherId={userVM.currentTeacher?.id} 
                  onSwitchTeacher={handleSwitchTeacher} 
                />
              )}

              {/* Preview Section - show current teacher data */}
              <PreviewSection
                showPreview={showPreview}
                teacher={userVM.currentTeacher}
                togglePreview={togglePreview}
              />

              {/* Match results list */}
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
              isOpen={matchVM.teacherInfo.isOpen || false}
            />
          )}
        </>
      )}
    </AppLayout>
  );
}