import React from 'react';
import { Specialist } from '../types';
import { SPECIALISTS } from '../constants';

interface HeaderProps {
  currentSpecialist: Specialist;
  onSpecialistChange: (s: Specialist) => void;
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentSpecialist, onSpecialistChange, onReset }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
      <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo & Branding */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onReset}
        >
          <div className="gradient-medical p-2 sm:p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            {/* New Improved Medical Pulse/Shield Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="animate-pulse-slow"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="M8 12h3l1-2 1 4 1-2h3" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-lg tracking-tight text-slate-800 leading-none">
              MedDiagnosa <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligent Healthcare</p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-3">
          {/* Specialist Dropdown with Icons */}
          <div className="relative">
            <select 
              className="pl-4 pr-10 py-2.5 bg-slate-100/50 hover:bg-slate-100 border-none rounded-xl text-sm font-semibold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 transition-all outline-none min-w-[180px] sm:min-w-[240px]"
              value={currentSpecialist.id}
              onChange={(e) => {
                const selected = SPECIALISTS.find(s => s.id === e.target.value);
                if (selected) onSpecialistChange(selected);
              }}
            >
              {SPECIALISTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {/* New Chat Button */}
          <button 
            onClick={onReset}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all shadow-sm"
            title="Mulai Sesi Baru"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;