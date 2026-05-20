import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', iconOnly = false, dark = false, size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
  };

  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-[13px]',
    md: 'text-[15px]',
    lg: 'text-2xl',
  };

  return (
    <Link to="/dashboard" className={`flex items-center gap-3 ${className}`}>
      <div className={`${containerSizes[size]} rounded-full ${dark ? 'bg-white' : 'bg-[#001b26]'} flex items-center justify-center flex-shrink-0`}>
        <Compass className={`${iconSizes[size]} ${dark ? 'text-[#001b26]' : 'text-white'}`} />
      </div>
      {!iconOnly && (
        <div>
          <h1 className={`font-bold ${textSizes[size]} ${dark ? 'text-white' : 'text-[#0b1c30]'} tracking-tight font-heading leading-none`}>
            Traveloop
          </h1>
          {size !== 'sm' && (
            <p className={`text-[10px] ${dark ? 'text-white/60' : 'text-[#94a3b8]'} font-medium mt-0.5`}>
              Intelligent Concierge
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
