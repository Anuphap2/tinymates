import React from "react";
import { Send, Sparkles, Heart, Coffee } from "lucide-react";

export function ChatModal({
    messages,
    inputMsg,
    setInputMsg,
    handleSendChat,
    isChatLoading,
    messagesEndRef,
    isDark,
}) {
    const suggestions = [
        { text: "ขอกำลังใจหน่อยน้า 💖", icon: <Heart size={12} className="text-rose-500" /> },
        { text: "เริ่มโฟกัส 25 นาทีกัน! ⏱️", icon: <Sparkles size={12} className="text-amber-500" /> },
        { text: "เหนื่อยแล้ว ขอวิธีพักสายตาหน่อย 🍵", icon: <Coffee size={12} className="text-teal-500" /> },
    ];

    return (
        <div className={`flex flex-col h-full min-h-0 overflow-hidden ${
            isDark ? "bg-indigo-950/80 text-indigo-100" : "bg-[#fafafa] text-[#0c0a09]"
        }`}>
            {/* Quick Prompt Pills */}
            <div className={`px-5 py-3 border-b flex gap-2 overflow-x-auto no-scrollbar shrink-0 ${
                isDark ? "bg-indigo-950 border-indigo-900/60" : "bg-white border-[#e7e5e4]"
            }`}>
                {suggestions.map((s, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSendChat(s.text)}
                        aria-label={s.text}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 active:scale-95 ${
                            isDark
                                ? "border-indigo-800/60 bg-indigo-900/40 text-indigo-200 hover:bg-indigo-900/70 hover:border-indigo-700"
                                : "border-[#e7e5e4] bg-[#f5f5f5] text-[#292524] hover:bg-[#f0efed] hover:border-[#d6d3d1]"
                        }`}
                    >
                        {s.icon}
                        <span>{s.text}</span>
                    </button>
                ))}
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 min-h-0 p-5 overflow-y-auto space-y-3 custom-scrollbar">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                    >
                        <div
                            className={`p-3.5 rounded-2xl text-xs md:text-sm max-w-[85%] leading-relaxed transition-all ${
                                m.role === "user"
                                    ? isDark
                                        ? "bg-indigo-600 text-white rounded-br-sm shadow-sm"
                                        : "bg-[#292524] text-white rounded-br-sm shadow-sm"
                                    : isDark
                                        ? "bg-indigo-900/60 text-indigo-100 border border-indigo-800/60 rounded-bl-sm shadow-sm"
                                        : "bg-white text-[#0c0a09] border border-[#e7e5e4] rounded-bl-sm shadow-sm"
                            }`}
                        >
                            {m.text}
                        </div>
                    </div>
                ))}

                {isChatLoading && (
                    <div className={`flex items-center gap-1.5 p-3 rounded-2xl text-xs w-fit border ${
                        isDark
                            ? "bg-indigo-900/50 border-indigo-800/60 text-indigo-300"
                            : "bg-white border-[#e7e5e4] text-[#777169]"
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? "bg-indigo-300" : "bg-[#777169]"}`} />
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${isDark ? "bg-indigo-300" : "bg-[#777169]"}`} />
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${isDark ? "bg-indigo-300" : "bg-[#777169]"}`} />
                        <span className="ml-1 text-[11px]">น้องกำลังคิดคำตอบ...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className={`p-4 border-t flex gap-2 items-center shrink-0 ${
                isDark ? "bg-indigo-950 border-indigo-900/60" : "bg-white border-[#e7e5e4]"
            }`}>
                <input
                    className={`flex-1 rounded-full px-4 py-2.5 text-xs md:text-sm border outline-none transition-all duration-200 ${
                        isDark
                            ? "bg-indigo-900/50 border-indigo-800/60 text-indigo-100 placeholder-indigo-400/50 focus:border-indigo-400 focus:bg-indigo-900/80"
                            : "bg-[#f5f5f5] border-[#e7e5e4] text-[#0c0a09] placeholder-[#78716c] focus:border-[#292524] focus:bg-white"
                    }`}
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="พิมพ์คุยกับน้องสัตว์เลี้ยงได้เลย..."
                />
                <button
                    onClick={() => handleSendChat()}
                    disabled={!inputMsg.trim() || isChatLoading}
                    aria-label="Send message"
                    className={`w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-200 active:scale-95 ${
                        isDark
                            ? "bg-indigo-600 text-white hover:bg-indigo-500"
                            : "bg-[#292524] text-white hover:bg-[#0c0a09]"
                    }`}
                >
                    <Send size={15} />
                </button>
            </div>
        </div>
    );
}
