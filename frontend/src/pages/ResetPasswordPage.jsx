import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Password reset is now handled in ForgotPasswordPage as a multi-step OTP flow
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/forgot-password', { replace: true }); }, []);
  return null;
}
