import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Select from 'react-select';
import { Country, City } from 'country-state-city';

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '46px',
    borderRadius: '0.75rem',
    borderWidth: '1px',
    borderColor: state.isFocused ? 'transparent' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px #b83a26' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: state.isFocused ? 'transparent' : '#d1d5db',
    },
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#b83a26' : state.isFocused ? '#fef2f2' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#b83a26',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 50,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#1a1a1a',
    fontSize: '14px',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '14px',
  }),
  input: (provided: any) => ({
    ...provided,
    fontSize: '14px',
  }),
};

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string } | null>(null);

  const countryOptions = useMemo(() => 
    Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: c.name,
    })), 
  []);

  const cityOptions = useMemo(() => 
    selectedCountry
      ? City.getCitiesOfCountry(selectedCountry.value)?.map((c) => ({
          value: c.name,
          label: c.name,
        })) || []
      : [],
  [selectedCountry]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setGeneralError(''); // Clear stale general error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) newErrors.email = 'Valid email is required';

    if (!form.phone || !isValidPhoneNumber(form.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }

    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      newErrors.password = 'Must be 8+ chars: 1 uppercase, 1 lowercase, 1 number, 1 special char';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validate()) {
      setGeneralError('Please fix the errors below');
      return;
    }
    
    try {
      await register({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        city: form.city,
        country: form.country,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setGeneralError(err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Registration failed');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 relative bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/Login_Background.png")' }}
    >
      <div className="absolute inset-0 bg-white/40" />
      
      <div className="w-full max-w-xl bg-[#f4f6f8] rounded-2xl p-10 relative z-10 shadow-2xl border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00202a] tracking-tight mb-2">Traveloop</h1>
          <p className="text-gray-500 text-sm">Create your account to start exploring.</p>
        </div>

        {generalError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-500 text-sm border border-red-100">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">First Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-[10px] mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Last Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
              </div>
              {errors.lastName && <p className="text-red-500 text-[10px] mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="voyager@traveloop.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Phone Number</label>
              <PhoneInput
                international
                defaultCountry="US"
                value={form.phone}
                onChange={(val) => handleChange('phone', val || '')}
                className={errors.phone ? 'PhoneInput--error' : ''}
              />
              {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Country</label>
              <Select
                inputId="country-select"
                name="country"
                autoComplete="new-password"
                options={countryOptions}
                value={selectedCountry}
                onChange={(option) => {
                  setSelectedCountry(option);
                  setSelectedCity(null);
                  handleChange('country', option?.label || '');
                  handleChange('city', '');
                }}
                styles={customSelectStyles}
                placeholder="Select country"
                className={errors.country ? 'border-red-500 rounded-xl' : ''}
              />
              {errors.country && <p className="text-red-500 text-[10px] mt-1">{errors.country}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">City</label>
              <Select
                inputId="city-select"
                name="city"
                autoComplete="new-password"
                options={cityOptions}
                value={selectedCity}
                onChange={(option) => {
                  setSelectedCity(option);
                  handleChange('city', option?.label || '');
                }}
                isDisabled={!selectedCountry}
                styles={customSelectStyles}
                placeholder="Select city"
                className={errors.city ? 'border-red-500 rounded-xl' : ''}
              />
              {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Password</label>
              <div className="relative">
                {/* Dummy input to absorb aggressive Chrome/Edge credential autofill */}
                <input
                  type="text"
                  name="dummy-username"
                  autoComplete="username"
                  style={{ position: 'absolute', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                  tabIndex={-1}
                  readOnly
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#b83a26] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#b83a26] transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-[#b83a26] hover:bg-[#a03220] text-white py-3.5 rounded-xl font-medium flex items-center justify-center transition-all shadow-md">
              Create Account
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00202a] hover:text-[#b83a26] font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
