import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home';

// Add any other imports for additional pages/components here

const App: React.FC = () => {
  // You can replace this with your actual Google client ID from your environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add additional routes as needed */}
          {/* Example:
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} /> 
          */}
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;