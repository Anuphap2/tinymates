import React from "react";
import { QrCode } from "lucide-react";

export function DonateModal({ copyToClipboard }) {
    return (
        <div className="p-10 text-center flex flex-col items-center justify-center h-full bg-gradient-to-b from-indigo-50/50 to-pink-50/50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl mb-6 animate-bounce">
                ☕
            </div>
            <h3 className="text-2xl font-bold mb-2">Buy me a coffee</h3>
            <p className="text-sm opacity-60 mb-6 max-w-xs">
                Your support keeps this cozy room alive and free for everyone!
                ❤️
            </p>

            {/* QR Code Image Placeholder */}
            <div className="bg-white p-4 rounded-xl shadow-inner mb-4 border-2 border-dashed border-slate-200 w-48 h-48 flex items-center justify-center relative overflow-hidden">
                <div className="text-center text-slate-400">
                    <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                    <span className="text-xs">วางรูป QR Code ตรงนี้</span>
                </div>
                {/* 🔴 ใส่รูป QR Code จริงตรงนี้ 
                                   <img src="URL" className="absolute inset-0 w-full h-full object-contain" />
                                */}
            </div>

            <button
                onClick={() => {
                    copyToClipboard("08x-xxx-xxxx");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <span>Copy PromptPay</span>{" "}
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                    08x-xxx-xxxx
                </span>
            </button>
        </div>
    );
}
