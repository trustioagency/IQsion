
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', icon }) => {
  return (
    <div className={`bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Card;
