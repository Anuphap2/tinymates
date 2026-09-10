import React, { useState } from "react";
import { Coffee, QrCode, Copy, Check, Heart } from "lucide-react";

export function DonateModal({ copyToClipboard }) {
    const [copied, setCopied] = useState(false);
    const promptPayNumber = "08x-xxx-xxxx";

    const handleCopy = () => {
        copyToClipboard(promptPayNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full bg-[#fafafa]">
            {/* Header Icon */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4 border border-[#e7e5e4]">
                ☕
            </div>

            <h3 className="text-2xl font-serif-editorial text-[#0c0a09] mb-1">
                Support TinyMates
            </h3>
            <p className="text-xs text-[#777169] mb-5 max-w-xs leading-relaxed">
                ร่วมสนับสนุนเพื่อให้น้องๆ สัตว์เลี้ยงและพื้นที่โฟกัสนี้เปิดให้ใช้งานฟรีและพัฒนาให้ดียิ่งขึ้นไป 💖
            </p>

            {/* QR Code Container */}
            <div className="bg-white p-5 rounded-2xl shadow-sm mb-5 border border-[#e7e5e4] w-52 h-52 flex flex-col items-center justify-center relative group">
                <div className="p-3 bg-[#f5f5f5] rounded-xl border border-[#e7e5e4] mb-2 text-[#292524]">
                    <QrCode size={48} className="opacity-80" />
                </div>
                <span className="text-[11px] font-medium text-[#777169]">PromptPay QR Code</span>
                <span className="text-[10px] text-[#a8a29e] mt-1">สแกนเพื่อสนับสนุนกาแฟ</span>
            </div>

            {/* Copy PromptPay Button */}
            <button
                onClick={handleCopy}
                className="w-full max-w-xs bg-[#292524] hover:bg-[#0c0a09] text-white py-3 px-5 rounded-full text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
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
