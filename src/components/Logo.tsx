import React from 'react';
import { useApp } from '../context/AppContext';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
  asLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showSubtitle = true, 
  className = '',
  onClick,
  asLink = true
}) => {
  let app: ReturnType<typeof useApp> | null = null;
  try {
    app = useApp();
  } catch (e) {
    // Logo can be rendered outside AppContext safely
  }

  const dimensions = {
    sm: {
      container: 'w-9 h-9',
      textJilly: 'text-xl',
      textBeauty: 'text-[11px]',
      textSub: 'text-[7px]'
    },
    md: {
      container: 'w-12 h-12 sm:w-14 sm:h-14',
      textJilly: 'text-2xl sm:text-3xl',
      textBeauty: 'text-xs sm:text-sm',
      textSub: 'text-[8px] sm:text-[9px]'
    },
    lg: {
      container: 'w-20 h-20 sm:w-24 sm:h-24',
      textJilly: 'text-4xl sm:text-5xl',
      textBeauty: 'text-base sm:text-lg',
      textSub: 'text-[10px] sm:text-xs'
    },
    xl: {
      container: 'w-28 h-28 sm:w-36 sm:h-36',
      textJilly: 'text-5xl sm:text-6xl',
      textBeauty: 'text-xl sm:text-2xl',
      textSub: 'text-xs sm:text-sm'
    },
  };

  const dim = dimensions[size];

  const handleReturnToHome = (e: React.MouseEvent) => {
    if (!asLink && !onClick) return;
    e.preventDefault();
    
    if (onClick) {
      onClick();
      return;
    }

    if (app) {
      app.setActiveTab('appointments');
      app.setViewMode('admin');
      app.setIsMobileMenuOpen(false);
      if (typeof window !== 'undefined') {
        try {
          window.history.pushState(null, '', '/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          // ignore error in sandbox iframe
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!asLink && !onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleReturnToHome(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div 
      onClick={handleReturnToHome}
      onKeyDown={handleKeyDown}
      role={asLink || onClick ? 'button' : undefined}
      tabIndex={asLink || onClick ? 0 : undefined}
      title={asLink || onClick ? 'Volver al inicio - Jilly Beauty Lab' : undefined}
      className={`flex items-center gap-2.5 sm:gap-3.5 select-none shrink-0 transition-all ${
        asLink || onClick 
          ? 'cursor-pointer group hover:opacity-95 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70 rounded-xl' 
          : ''
      } ${className}`}
    >
      {/* Golden Ring Emblem with Lotus - Hover animation */}
      <div 
        className={`relative flex items-center justify-center shrink-0 ${dim.container} transition-transform group-hover:scale-105 duration-300`}
      >
        <img
          src="/assets/aistudio/logojillybeautty_712619f5.png"
          alt="Jilly Beauty Lab Center"
          className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)] group-hover:drop-shadow-[0_4px_14px_rgba(212,175,55,0.65)] transition-all"
          loading="eager"
        />
      </div>

      {/* Title & Brand text beside logo */}
      {showSubtitle && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-nowrap">
            <span className={`font-serif-luxury italic font-bold text-gold-gradient tracking-tight ${dim.textJilly} group-hover:brightness-110 transition-all`}>
              Jilly
            </span>
            <span className={`font-brand font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#e5c158] uppercase drop-shadow-[0_1px_4px_rgba(212,175,55,0.3)] whitespace-nowrap ${dim.textBeauty} group-hover:text-[#fde047] transition-colors`}>
              Beauty Lab
            </span>
          </div>
          <span className={`font-brand tracking-[0.25em] sm:tracking-[0.35em] text-[#a1a1aa] uppercase font-semibold mt-0.5 sm:mt-1 ${dim.textSub} group-hover:text-[#d4af37] transition-colors`}>
            Center & Spa
          </span>
        </div>
      )}
    </div>
  );
};
