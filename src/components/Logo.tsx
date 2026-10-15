import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true, className = '' }) => {
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

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 select-none shrink-0 ${className}`}>
      {/* Golden Ring Emblem with Lotus - Perfectly framed without outer clipping */}
      <div 
        className={`relative flex items-center justify-center shrink-0 ${dim.container} transition-transform hover:scale-105 duration-300`}
      >
        <img
          src="/favicon.svg"
          alt="Jilly Beauty Lab Center"
          className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]"
          loading="eager"
        />
      </div>

      {/* Title & Brand text beside logo */}
      {showSubtitle && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-nowrap">
            <span className={`font-serif-luxury italic font-bold text-gold-gradient tracking-tight ${dim.textJilly}`}>
              Jilly
            </span>
            <span className={`font-brand font-bold tracking-[0.2em] sm:tracking-[0.25em] text-[#e5c158] uppercase drop-shadow-[0_1px_4px_rgba(212,175,55,0.3)] whitespace-nowrap ${dim.textBeauty}`}>
              Beauty Lab
            </span>
          </div>
          <span className={`font-brand tracking-[0.25em] sm:tracking-[0.35em] text-[#a1a1aa] uppercase font-semibold mt-0.5 sm:mt-1 ${dim.textSub}`}>
            Center & Spa
          </span>
        </div>
      )}
    </div>
  );
};
