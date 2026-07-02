import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, KeyRound, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

const STEPS = { EMAIL: 1, OTP: 2, PASSWORD: 3, SUCCESS: 4 };

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP input refs for auto-focus
  const otpRefs = Array.from({ length: 6 }, () => React.createRef());

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const sendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error('Please enter a valid email address.');
    }
    setLoading(true);
    try {
      await api.post('/otp/forgot-password', { email });
      toast.success('OTP sent! Check your email inbox.');
      setStep(STEPS.OTP);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return toast.error('Please enter the complete 6-digit OTP.');
    setLoading(true);
    try {
      await api.post('/otp/verify-reset', { email, otp: otpString });
      toast.success('OTP verified successfully!');
      setStep(STEPS.PASSWORD);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');
    setLoading(true);
    try {
      await api.post('/otp/reset-password', { email, otp: otp.join(''), newPassword });
      toast.success('Password reset successfully!');
      setStep(STEPS.SUCCESS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      await api.post('/otp/forgot-password', { email });
      setOtp(['', '', '', '', '', '']);
      toast.success('New OTP sent!');
    } catch {
      toast.error('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">

        {/* Step 1: Email */}
        {step === STEPS.EMAIL && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password?</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your email and we'll send you a reset OTP.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendOTP()}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <p className="text-center text-sm text-slate-500">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Log In</Link>
              </p>
            </div>
          </>
        )}

        {/* Step 2: OTP */}
        {step === STEPS.OTP && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enter OTP</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                We sent a 6-digit code to <strong className="text-slate-700 dark:text-slate-200">{email}</strong>
              </p>
            </div>
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition"
                />
              ))}
            </div>
            <div className="space-y-3">
              <button onClick={verifyOTP} disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
              </button>
              <button onClick={resendOTP} disabled={loading}
                className="w-full py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                Didn't receive it? Resend OTP
              </button>
              <button onClick={() => setStep(STEPS.EMAIL)} className="w-full text-sm text-slate-500 hover:text-slate-700">
                ← Change email
              </button>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === STEPS.PASSWORD && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Password</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Create a strong new password.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                <div className="mt-1 flex gap-1">
                  {[8, 12, 16].map(len => (
                    <div key={len} className={`h-1 flex-1 rounded-full transition-colors ${newPassword.length >= len ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                    confirmPassword && confirmPassword !== newPassword ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-purple-500'
                  }`} />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <button onClick={resetPassword} disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {step === STEPS.SUCCESS && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Reset!</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Your password has been successfully updated. You can now log in.</p>
            <button onClick={() => navigate('/login')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
