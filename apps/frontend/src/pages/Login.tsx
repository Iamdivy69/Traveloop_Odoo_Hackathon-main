import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const authError = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (loginMethod === 'phone' && !isValidPhoneNumber(identifier)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.error || 'Invalid credentials';
      setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 relative bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/Login_Background.png")' }}
    >
      <div className="absolute inset-0 bg-[#001b26]/60 backdrop-blur-sm" />
      
      <div className="w-full max-w-md bg-white rounded-2xl p-10 relative z-10 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-h2 font-heading font-bold text-[#0b1c30] tracking-tight mb-1">Traveloop</h1>
          <p className="text-[#94a3b8] text-sm">Your journey begins here.</p>
        </div>

        <div className="flex p-1 bg-[#f1f5f9] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setLoginMethod('email'); setIdentifier(''); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${loginMethod === 'email' ? 'bg-white text-[#0b1c30] shadow-sm' : 'text-[#94a3b8] hover:text-[#64748B]'}`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('phone'); setIdentifier(''); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${loginMethod === 'phone' ? 'bg-white text-[#0b1c30] shadow-sm' : 'text-[#94a3b8] hover:text-[#64748B]'}`}
          >
            Phone
          </button>
        </div>

        {(error || authError) && (
          <div className="mb-6 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">
            {error || (typeof authError === 'object' && authError !== null ? (authError as any).message || JSON.stringify(authError) : authError)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {loginMethod === 'email' ? (
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#94a3b8] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="voyager@traveloop.com"
                  className="input-field pl-11"
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Phone Number</label>
              <PhoneInput
                international
                defaultCountry="US"
                value={identifier}
                onChange={(val) => setIdentifier(val || '')}
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#64748B]">Password</label>
              <Link to="/forgot-password" type="button" className="text-xs text-[#94a3b8] hover:text-[#E8604C] font-medium transition-colors">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#94a3b8] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-11 pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#E8604C] transition-colors focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#E8604C] hover:bg-[#ae311e] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-[#e2e8f0]"></div>
          <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Or continue with</span>
          <div className="flex-1 h-px bg-[#e2e8f0]"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-2 py-3 border border-[#e2e8f0] rounded-xl hover:bg-[#f8fafc] transition-colors bg-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.78 1.44.11 2.6.79 3.32 1.98-2.85 1.76-2.38 5.48.51 6.72-.75 1.84-1.78 3.53-2.64 4.25zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Apple</span>
          </button>
          <button type="button" className="flex items-center justify-center gap-2 py-3 border border-[#e2e8f0] rounded-xl hover:bg-[#f8fafc] transition-colors bg-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#64748B]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#E8604C] hover:text-[#ae311e] font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
