import React, { useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * A lightweight, premium Tooltip component.
 * Usage: <Tooltip text="Your help text here"> <button>Hover Me</button> </Tooltip>
 */
export default function Tooltip({ text, children, position = 'top', className }) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-900 dark:border-t-slate-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-900 dark:border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-900 dark:border-l-slate-800',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-900 dark:border-r-slate-800',
  };

  return (
    <div 
      className="relative inline-flex flex-shrink-0 items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div className={cn(
          "absolute z-[100] px-3 py-2 text-[10px] font-bold text-white uppercase tracking-widest bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl ring-1 ring-white/20 whitespace-normal min-w-[140px] max-w-[220px] text-center animate-in fade-in zoom-in-95 duration-200",
          positionClasses[position],
          className
        )}>
          {text}
          <div className={cn(
            "absolute w-0 h-0 border-[4px] border-transparent",
            arrowClasses[position]
          )} />
        </div>
      )}
    </div>
  );
}
