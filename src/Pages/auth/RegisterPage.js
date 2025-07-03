// client/src/Pages/auth/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { toast } from 'react-toastify';
import { FiAlertTriangle } from 'react-icons/fi';

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

  const { register, user: authUser, setUser: setAuthUser, dashboardPath } = useAuth();
  const navigate = useNavigate();

  // This useEffect is still useful for post-registration redirects
  useEffect(() => {
    if (authUser && authUser.role === 'Player') {
      // This will now primarily handle the redirect *after* a successful registration,
      // as the render block below prevents already-logged-in users from seeing the form.
    }
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

    setLoading(true);

    try {
      const userData = { name, email, password, role, phone, imageUrl };
      if (role === 'Coach') userData.clubNameRegistered = clubNameRegistered;

      const registeredUserResponse = await register(userData);

      if (registeredUserResponse && registeredUserResponse._id) {
        if (registeredUserResponse.role === 'Player') {
          toast.success("Registration successful! Welcome!");
          navigate('/player/dashboard', { replace: true });
        } else if (registeredUserResponse.role === 'Coach') {
          toast.info("Registration successful! Your account is pending admin approval.");
          navigate('/pending-approval', { replace: true });
        } else {
          toast.success("Registration successful!");
          navigate('/login', { replace: true });
        }
      } else {
        toast.warn("Registration submitted. If you encounter issues, please try logging in or contact support.");
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- GATEKEEPER FOR ALREADY LOGGED-IN USERS ---
  // If the user is already logged in, show an info message instead of the form.
  if (authUser) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-6 bg-white p-10 rounded-xl shadow-lg text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            You are already logged in
          </h2>
          <p className="text-gray-600">
            You cannot register a new account while you are signed in as <span className="font-semibold">{authUser.email}</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
             <button className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#080E19] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              ><Link
              to={dashboardPath}
              className="btn-primary w-full" // Use the same style as the register button
            >
              Go to My Dashboard
            </Link>
            </button>
            <button>
            <Link
              to="/"
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Home Page
            </Link>
            </button>
          </div>
        </div>
        <style jsx global>{`
          .btn-primary { @apply group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400; }
        `}</style>
      </div>
    );
  }

  // --- REGISTRATION FORM (for logged-out users) ---
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your Account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            <label htmlFor="phone-register" className="label-style">Phone Number</label>
            <input id="phone-register" name="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
            className="input-style" placeholder="Your Phone Number" disabled={loading} />
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
              {loading ? 'Registering...' : `Register as ${role}`}
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