import React from "react";

export const ControlButton = ({ icon, color, onClick, label }) => (
    <button
        onClick={onClick}
        className={`group relative w-10 h-10 md:w-12 md:h-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg flex items-center justify-center ${color} transition-all hover:scale-110 active:scale-95 border border-white/40`}
    >
        {icon}
        <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 group-hover:bottom-[-35px] transition-all whitespace-nowrap pointer-events-none z-20 hidden md:block">
            {label}
        </span>
    </button>
);
