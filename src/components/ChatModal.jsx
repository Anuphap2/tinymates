import React from "react";
import { Send } from "lucide-react";

export function ChatModal({
    messages,
    inputMsg,
    setInputMsg,
    handleSendChat,
    isChatLoading,
    messagesEndRef,
    isDark,
}) {
    return (
        <div className={`flex flex-col h-full ${isDark ? "bg-indigo-950/50" : "bg-slate-50/50"}`}>
            <div className="flex-1 p-6 overflow-y-auto space-y-3">
                {messages.length === 0 && (
                    <div className="text-center p-10 opacity-50">
                        <div className="text-6xl mb-4">🐱</div>Say hi to your pet!
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm ${m.role === "user"
                            ? "bg-indigo-500 text-white self-end rounded-br-sm"
                            : isDark ? "bg-indigo-900/80 text-indigo-100 self-start rounded-bl-sm" : "bg-white self-start rounded-bl-sm"
                            }`}
                    >
                        {m.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className={`p-4 border-t flex gap-3 ${isDark ? "bg-indigo-950 border-indigo-900" : "bg-white border-slate-100"}`}>
                <input
                    className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDark ? "bg-indigo-900/50 text-white placeholder-indigo-300/50" : "bg-slate-100 text-slate-800"}`}
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Type a message..."
                />
                <button
                    onClick={handleSendChat}
                    disabled={!inputMsg.trim() || isChatLoading}
                    className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
