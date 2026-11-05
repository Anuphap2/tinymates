import React, { useState } from "react";
import { QrCode, Copy, Check } from "lucide-react";

export function DonateModal({ copyToClipboard, isDark }) {
    const [copied, setCopied] = useState(false);
    const promptPayNumber = "08x-xxx-xxxx";

    const handleCopy = () => {
        copyToClipboard(promptPayNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`p-6 md:p-8 text-center flex flex-col items-center justify-start md:justify-center h-full min-h-0 overflow-y-auto custom-scrollbar ${
            isDark ? "bg-indigo-950/80 text-indigo-100" : "bg-[#fafafa]"
        }`}>
            {/* Header Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-sm mb-4 border ${
                isDark ? "bg-indigo-900/60 border-indigo-800/80" : "bg-white border-[#e7e5e4]"
            }`}>
                ☕
            </div>

            <h3 className={`text-2xl font-serif-editorial mb-1 ${
                isDark ? "text-indigo-100" : "text-[#0c0a09]"
            }`}>
                Support TinyMates
            </h3>
            <p className={`text-xs mb-5 max-w-xs leading-relaxed ${
                isDark ? "text-indigo-300/80" : "text-[#78716c]"
            }`}>
                ร่วมสนับสนุนเพื่อให้น้องๆ สัตว์เลี้ยงและพื้นที่โฟกัสนี้เปิดให้ใช้งานฟรีและพัฒนาให้ดียิ่งขึ้นไป 💖
            </p>

            {/* QR Code Container */}
            <div className={`p-5 rounded-2xl shadow-sm mb-5 border w-52 h-52 flex flex-col items-center justify-center relative group ${
                isDark ? "bg-indigo-900/40 border-indigo-800/60" : "bg-white border-[#e7e5e4]"
            }`}>
                <div className={`p-3 rounded-xl border mb-2 ${
                    isDark ? "bg-indigo-900/60 border-indigo-700/60 text-indigo-200" : "bg-[#f5f5f5] border-[#e7e5e4] text-[#292524]"
                }`}>
                    <QrCode size={48} className="opacity-80" />
                </div>
                <span className={`text-[11px] font-medium ${isDark ? "text-indigo-300" : "text-[#777169]"}`}>
                    PromptPay QR Code
                </span>
                <span className={`text-[10px] mt-1 ${isDark ? "text-indigo-400/70" : "text-[#78716c]"}`}>
                    สแกนเพื่อสนับสนุนกาแฟ
                </span>
            </div>

            {/* Copy PromptPay Button */}
            <button
                onClick={handleCopy}
                aria-label="Copy PromptPay number"
                className={`w-full max-w-xs py-3 px-5 rounded-full text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                    isDark
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-[#292524] hover:bg-[#0c0a09] text-white"
                }`}
            >
                {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
                <span>{copied ? "คัดลอกเบอร์แล้ว! ขอบคุณครับ" : "คัดลอกเบอร์พร้อมเพย์"}</span>
                <span className="bg-white/15 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide">
                    {promptPayNumber}
                </span>
            </button>
        </div>
    );
}
