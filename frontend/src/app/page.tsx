"use client";

import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useUserViewModel } from "../viewmodels/UserViewModel";
import { useMatchViewModel } from "../viewmodels/MatchViewModel";

// Components
import AppLayout from "../components/layout/AppLayout";
import WelcomeBanner from "../components/WelcomeBanner";
import TeacherFormContainer from "../components/TeacherFormContainer";
import MatchList from "../components/MatchList";
import TeacherInfoModal from "../components/TeacherInfoModal";

export default function Home() {
  // UI state
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Initialize view models
  const userVM = useUserViewModel();
  const matchVM = useMatchViewModel(userVM.currentTeacher);
  
  // Function to handle teacher form submission
  const handleCreateTeacher = async (teacher) => {
    try {
      const createdTeacher = await matchVM.createTeacher(teacher, userVM.userInfo?.google_id);
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
        
        if (result?.teacher) {
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
  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const result = await userVM.handleGoogleLoginSuccess(credentialResponse);
      
      if (result?.teacher) {
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

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
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
              <MatchList
                matches={matchVM.getFilteredMatches()}
                currentTeacher={userVM.currentTeacher}
                onShowTeacherInfo={matchVM.showTeacherInfo}
                onBackToForm={handleBackToForm}
                title={matchVM.isDebugMode ? "配對結果 (Debug 模式)" : "配對結果"}
                isDebugMode={matchVM.isDebugMode} // 傳遞 debug 模式狀態
              />
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
    </GoogleOAuthProvider>
  );
}