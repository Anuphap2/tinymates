import React from "react";

export const ControlButton = ({ icon, color = "text-[#292524]", onClick, label }) => (
    <button
        onClick={onClick}
        aria-label={label}
        className={`group relative w-10 h-10 md:w-11 md:h-11 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:shadow-md flex items-center justify-center ${color} transition-all duration-200 hover:scale-105 active:scale-95 border border-[#e7e5e4] hover:border-[#d6d3d1] hover:bg-white`}
    >
        {icon}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#0c0a09] text-white text-[11px] font-medium tracking-wide px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-30 shadow-md hidden md:block">
            {label}
        </span>
    </button>
);
