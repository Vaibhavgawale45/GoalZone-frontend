// client/src/Pages/auth/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js'; // Adjust path as needed
import { toast } from 'react-toastify'; // Import toast

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Player'); // Default role
  const [clubNameRegistered, setClubNameRegistered] = useState(''); // For coaches
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  
  const { register, user: authUser, setUser: setAuthUser } = useAuth(); // Get setUser also
  const navigate = useNavigate();

  // This useEffect handles redirection if authUser state changes (e.g., player logs in)
  useEffect(() => {
    if (authUser && authUser.role === 'Player') {
        console.log("[RegisterPage useEffect] Player logged in, navigating to dashboard.");
        // No toast here, as successful registration toast is in handleSubmit
        navigate('/player/dashboard', { replace: true });
    }
    // We don't navigate for Coach here based on authUser change,
    // because they don't auto-login and handleSubmit directs them to /pending-approval.
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match."); return;
    }
    if (role === 'Coach' && !clubNameRegistered.trim()) {
      toast.error("Club Name is required for Coach registration."); return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }

    setLoading(true); // Set loading to true BEFORE the API call
    let registrationSuccessful = false; // Flag to track success

    try {
      const userData = { name, email, password, role };
      if (role === 'Coach') userData.clubNameRegistered = clubNameRegistered;
      if (phone.trim()) userData.phone = phone.trim();
      if (imageUrl.trim()) userData.imageUrl = imageUrl.trim();
      
      console.log("[RegisterPage FE] Sending data for registration:", userData);
      const registeredUserResponse = await register(userData); // This is from AuthContext
      console.log("[RegisterPage FE] Response from register function:", registeredUserResponse);


      if (registeredUserResponse && registeredUserResponse._id) { // Check for a valid user object
        registrationSuccessful = true; // Mark as successful

        if (registeredUserResponse.role === 'Player') {
          toast.success("Registration successful! Welcome!");
          // AuthContext's register should have called setAuthUser,
          // which will trigger the useEffect for player navigation.
          // If not, you might need:
          // setAuthUser(registeredUserResponse); // Explicitly set user in context if register action doesn't do it
          // navigate('/player/dashboard', { replace: true }); // And direct navigate
        } else if (registeredUserResponse.role === 'Coach') {
          toast.info("Registration successful! Your account is pending admin approval.");
          navigate('/pending-approval', { replace: true });
        } else { // Fallback for other roles or undefined role from backend
          toast.success("Registration successful!");
          navigate('/login', { replace: true });
        }
      } else {
        // This means `register()` from AuthContext might have succeeded partially 
        // or didn't return the expected user object.
        console.warn("[RegisterPage FE] Registration Response was not as expected:", registeredUserResponse);
        toast.warn("Registration submitted. If you encounter issues, please try logging in or contact support.");
         // Don't navigate immediately; let user see the warning. setLoading(false) will happen.
         // OR navigate('/login', {replace: true}); if that's preferred
      }
    } catch (err) {
      console.error("Registration page error in handleSubmit catch:", err);
      toast.error(err.message || 'Registration failed. Please try again.');
      registrationSuccessful = false; // Explicitly mark as failed
    } finally {
      console.log("[RegisterPage FE] handleSubmit finally block reached. registrationSuccessful:", registrationSuccessful);
      setLoading(false); // CRITICAL: ALWAYS set loading to false
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your Account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Removed local error div as toasts handle feedback */}

          <div>
            <label htmlFor="name-register" className="label-style">Full Name*</label>
            <input id="name-register" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="input-style" placeholder="Your Full Name" disabled={loading} />
          </div>
          <div>
            <label htmlFor="email-register" className="label-style">Email address*</label>
            <input id="email-register" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-style" placeholder="you@example.com" disabled={loading} />
          </div>
          <div>
            <label htmlFor="password-register" className="label-style">Password* <span className="text-xs text-gray-500">(min. 6 chars)</span></label>
            <input id="password-register" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-style" placeholder="••••••••" disabled={loading} />
          </div>
          <div>
            <label htmlFor="confirm-password-register" className="label-style">Confirm Password*</label>
            <input id="confirm-password-register" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-style" placeholder="••••••••" disabled={loading} />
          </div>
          <div>
            <label htmlFor="role-register" className="label-style">Register as*</label>
            <select id="role-register" name="role" value={role} onChange={(e) => setRole(e.target.value)}
              className="input-style appearance-none bg-white" disabled={loading}>
              <option value="Player">Player</option>
              <option value="Coach">Coach</option>
            </select>
          </div>
          {role === 'Coach' && (
            <div>
              <label htmlFor="clubNameRegistered-register" className="label-style">Club Name (to register/manage)*</label>
              <input id="clubNameRegistered-register" name="clubNameRegistered" type="text" required={role === 'Coach'} value={clubNameRegistered} onChange={(e) => setClubNameRegistered(e.target.value)}
                className="input-style" placeholder="e.g., City Rovers FC" disabled={loading} />
            </div>
          )}
          {role === 'Player' && ( 
            <div className="pt-4 border-t mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-3">Optional Information</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="phone-register" className="label-style">Phone Number</label>
                        <input id="phone-register" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="input-style" placeholder="Your Phone Number" disabled={loading} />
                    </div>
                    <div>
                        <label htmlFor="imageUrl-register" className="label-style">Profile Image URL</label>
                        <input id="imageUrl-register" name="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                        className="input-style" placeholder="http://example.com/image.jpg" disabled={loading} />
                    </div>
                </div>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>) : 
                (`Register as ${role}`)
              }
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
       <style jsx global>{`
        .input-style { @apply mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm; }
        .label-style { @apply block text-sm font-medium text-gray-700; }
        .btn-primary { @apply group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400; }
        select.input-style { @apply pr-10; } 
      `}</style>
    </div>
  );
};

export default RegisterPage;