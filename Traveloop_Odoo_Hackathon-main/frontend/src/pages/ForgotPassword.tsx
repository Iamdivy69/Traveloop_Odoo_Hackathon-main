import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Compass } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    // Simulate API call
    setSubmitted(true);
    setError('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 relative bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/Login_Background.png")' }}
    >
      <div className="absolute inset-0 bg-[#001b26]/60 backdrop-blur-sm" />
      
      <div className="w-full max-w-md bg-white rounded-2xl p-10 relative z-10 shadow-xl">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-[#001b26] flex items-center justify-center mx-auto mb-4">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-h2 font-heading font-bold text-[#0b1c30] tracking-tight mb-1 font-heading">Reset Password</h1>
          <p className="text-[#94a3b8] text-sm">We'll send you a link to reset your password</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="bg-[#ecfdf5] text-[#059669] p-4 rounded-xl border border-[#059669]/10 text-sm">
              If an account exists for {email}, you will receive a password reset link shortly.
            </div>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-[#0b1c30] hover:text-[#E8604C] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#94a3b8] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voyager@traveloop.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#E8604C] hover:bg-[#ae311e] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all shadow-sm hover:shadow-md">
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#E8604C] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
