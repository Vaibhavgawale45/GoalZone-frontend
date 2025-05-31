// client/src/components/auth/GoogleLoginButton.js
import React, { useState } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google'; // Using GoogleLogin component
import { useAuth } from '../../contexts/AuthContext.js';
import api from '../../services/api.js';
import { useNavigate, useLocation } from 'react-router-dom';

// Generic Modal for Role Selection
const RoleSelectionModal = ({ isOpen, onClose, onSubmit, googleUserName }) => {
    const [selectedRole, setSelectedRole] = useState('Player');
    const [clubNameRegistered, setClubNameRegistered] = useState('');

    if (!isOpen) return null;

    const handleRoleSubmit = (e) => {
        e.preventDefault();
        if (selectedRole === 'Coach' && !clubNameRegistered.trim()) {
            alert("Club Name is required for Coach role registration.");
            return;
        }
        onSubmit(selectedRole, selectedRole === 'Coach' ? clubNameRegistered : undefined);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Welcome, {googleUserName || 'New User'}!</h2>
                <p className="text-sm text-gray-600 mb-4">Please select your role to complete your registration.</p>
                <form onSubmit={handleRoleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I am a:</label>
                        <select 
                            id="role" 
                            value={selectedRole} 
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="input-style w-full py-2"
                        >
                            <option value="Player">Player</option>
                            <option value="Coach">Coach</option>
                        </select>
                    </div>
                    {selectedRole === 'Coach' && (
                        <div className="mb-4">
                            <label htmlFor="clubNameRegistered" className="block text-sm font-medium text-gray-700 mb-1">
                                Club Name (you wish to register/manage):
                            </label>
                            <input 
                                type="text" 
                                id="clubNameRegistered" 
                                value={clubNameRegistered}
                                onChange={(e) => setClubNameRegistered(e.target.value)}
                                required 
                                className="input-style w-full py-2"
                                placeholder="e.g., City Rovers FC"
                            />
                        </div>
                    )}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Confirm Role & Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const GoogleLoginButton = ({ setErrorFromParent }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempGoogleUserData, setTempGoogleUserData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [processing, setProcessing] = useState(false); // For button loading state if needed

  const from = location.state?.from?.pathname || "/redirect-dashboard";

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorFromParent('');
    setProcessing(true);
    console.log('[GoogleLoginButton] CredentialResponse from Google:', credentialResponse);
    // credentialResponse.credential is the ID Token (JWT)
    
    try {
      const backendResponse = await api.post('/auth/google-signin', { 
        idToken: credentialResponse.credential 
      });
      console.log('[GoogleLoginButton] Backend response from /google-signin:', backendResponse.data);
      
      const { action, message, googleUserData, ...loginData } = backendResponse.data;

      if (action === 'login') {
        localStorage.setItem('token', loginData.token);
        setUser({ _id: loginData._id, name: loginData.name, email: loginData.email, role: loginData.role, isApproved: loginData.isApproved, imageUrl: loginData.imageUrl, managedClub: loginData.managedClub });
        navigate(from, { replace: true });
      } else if (action === 'select_role') {
        setTempGoogleUserData(googleUserData); // Save Google user data temporarily
        setShowRoleModal(true); // Show modal to select role
      } else {
          throw new Error(message || "Unknown action from backend.");
      }
    } catch (error) {
      console.error('[GoogleLoginButton] Error during Google Sign-In Stage 1:', error.response?.data || error.message || error);
      setErrorFromParent(error.response?.data?.message || "Google Sign-In failed. Please try again.");
    } finally {
        setProcessing(false);
    }
  };

  const handleGoogleError = (errorResponse) => {
    console.error('[GoogleLoginButton] Google login library error:', errorResponse);
    setErrorFromParent("Google Sign-In process failed or was cancelled.");
    setProcessing(false);
  };

  const handleRoleSelectionSubmit = async (selectedRole, clubNameForCoach) => {
    setErrorFromParent('');
    setProcessing(true);
    try {
      const backendResponse = await api.post('/auth/complete-google-signup', {
        googleUserData: tempGoogleUserData,
        role: selectedRole,
        clubNameRegistered: clubNameForCoach // Will be undefined if role is Player
      });
      console.log('[GoogleLoginButton] Backend response from /complete-google-signup:', backendResponse.data);

      const { token, action: finalAction, ...userData } = backendResponse.data;
      localStorage.setItem('token', token);
      setUser({ _id: userData._id, name: userData.name, email: userData.email, role: userData.role, isApproved: userData.isApproved, imageUrl: userData.imageUrl, managedClub: userData.managedClub });
      
      setShowRoleModal(false);
      setTempGoogleUserData(null);

      if (finalAction === 'pending_approval') {
        navigate('/pending-approval', { replace: true });
      } else { // login
        navigate(from, { replace: true });
      }

    } catch (error) {
      console.error('[GoogleLoginButton] Error during Google Sign-Up Stage 2:', error.response?.data || error.message || error);
      setErrorFromParent(error.response?.data?.message || "Completing Google Sign-Up failed.");
    } finally {
        setProcessing(false);
    }
  };

  return (
    <>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap // Optional: for One Tap UI experience
        // width="280px" // Customize button width
        theme="outline" // outline, filled_blue, filled_black
        size="large" // medium, large
        text="continue_with" // signin_with, signup_with, continue_with
        shape="rectangular" // rectangular, pill, circle, square
        logo_alignment="left" // left, center
      />
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => { setShowRoleModal(false); setTempGoogleUserData(null); googleLogout(); /* Log out from Google if flow is cancelled */ }}
        onSubmit={handleRoleSelectionSubmit}
        googleUserName={tempGoogleUserData?.name}
      />
      {/* Reusable styles already in parent or global */}
      <style jsx global>{`
        .input-style { display: block; width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: sm; }
        .input-style:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 1px #6366F1; }
        .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
        .btn-primary:hover { background-color: #4338CA; }
        .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
        .btn-secondary:hover { background-color: #E5E7EB; }
      `}</style>
    </>
  );
};

export default GoogleLoginButton;