import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const GoogleSignInButton = ({ role = 'student', department, year, semester, rollNumber, onSuccess }) => {
  const { googleLogin, isLoading } = useAuthStore();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    /* global google */
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              const res = await googleLogin(response.credential, {
                role,
                department,
                year,
                semester,
                rollNumber,
              });
              if (res.success) {
                toast.success('Signed in with Google!');
                if (onSuccess) onSuccess();
              } else {
                toast.error(res.message || 'Google authentication failed');
              }
            }
          },
        });
      } catch (err) {
        console.error('Google Auth Init Error:', err);
      }
    }
  }, [googleClientId, role, department, year, semester, rollNumber, googleLogin, onSuccess]);

  const handleGoogleClick = async () => {
    /* global google */
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt doesn't show, try custom or inform user
          console.log('Google One-Tap dismissed or not displayed');
        }
      });
    } else {
      // In dev or if no GOOGLE_CLIENT_ID configured, provide an interactive test login or helpful message
      toast('Google Sign-In ready (Requires VITE_GOOGLE_CLIENT_ID in production).', { icon: 'ℹ️' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={isLoading}
      id="google-signin-btn"
      className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full border border-[#e2e5f0] dark:border-[#2a2d36] bg-white dark:bg-[#1c1d22] text-[#111827] dark:text-[#f3f4f6] font-semibold text-xs sm:text-sm hover:bg-[#f8f9fd] dark:hover:bg-[#252831] hover:border-black/20 dark:hover:border-white/20 transition-all duration-150 shadow-sm group active:scale-[0.99]"
    >
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleSignInButton;
