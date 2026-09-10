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
        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#fafafa]">
            {/* Quick Prompt Pills */}
            <div className="px-5 py-3 border-b border-[#e7e5e4] bg-white flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                {suggestions.map((s, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSendChat(s.text)}
                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-[#e7e5e4] bg-[#f5f5f5] text-[#292524] hover:bg-[#f0efed] hover:border-[#d6d3d1] transition-all flex items-center gap-1.5 active:scale-95"
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
                                    ? "bg-[#292524] text-white rounded-br-sm shadow-sm"
                                    : "bg-white text-[#0c0a09] border border-[#e7e5e4] rounded-bl-sm shadow-sm"
                            }`}
                        >
                            {m.text}
                        </div>
                    </div>
                ))}

                {isChatLoading && (
                    <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#e7e5e4] text-[#777169] text-xs w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#777169] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#777169] animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#777169] animate-bounce [animation-delay:0.4s]" />
                        <span className="ml-1 text-[11px]">น้องกำลังคิดคำตอบ...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[#e7e5e4] bg-white flex gap-2 items-center shrink-0">
                <input
                    className="flex-1 rounded-full px-4 py-2.5 text-xs md:text-sm bg-[#f5f5f5] border border-[#e7e5e4] text-[#0c0a09] placeholder-[#a8a29e] outline-none focus:border-[#292524] focus:bg-white transition-all duration-200"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="พิมพ์คุยกับน้องสัตว์เลี้ยงได้เลย..."
                />
                <button
                    onClick={() => handleSendChat()}
                    disabled={!inputMsg.trim() || isChatLoading}
                    className="w-10 h-10 rounded-full bg-[#292524] text-white flex items-center justify-center hover:bg-[#0c0a09] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-200 active:scale-95"
                >
                    <Send size={15} />
                </button>
            </div>
        </div>
    );
}
