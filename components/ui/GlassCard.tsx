import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerAction?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, headerAction }) => {
  return (
    <div className={`relative bg-white/40 backdrop-blur-xl border-t border-l border-white/60 shadow-lg rounded-3xl p-6 overflow-hidden ${className}`}>
      {/* Glossy Reflection Effect */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl" />
      
      {(title || headerAction) && (
        <div className="relative z-10 flex justify-between items-center mb-4 border-b border-white/30 pb-2">
          {title && <h2 className="text-xl font-bold text-blue-900 drop-shadow-sm">{title}</h2>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};