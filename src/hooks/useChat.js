import { useState, useRef } from 'react';

export function useChat(apiKey, showToast) {
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const lastChatTime = useRef(0);

    const handleSendChat = async () => {
        if (!inputMsg.trim()) return;

        // 1. Check API Key
        if (!apiKey) {
            showToast("กรุณาใส่ API Key ก่อนใช้งานนะ (ในโค้ด)", "error");
            return;
        }

        // 2. Rate Limiting (Cooldown 3s)
        const now = Date.now();
        if (now - lastChatTime.current < 3000) {
            showToast("ใจเย็นๆ น้า น้องตอบไม่ทัน! ⏳", "info");
            return;
        }
        lastChatTime.current = now;

        // 3. Send
        const t = inputMsg;
        setMessages((p) => [...p, { role: "user", text: t }]);
        setInputMsg("");
        setIsChatLoading(true);

        try {
            const r = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `You are a cute virtual pet named "Tiny" living in a focus timer app called TinyMates. 
                    Roleplay as a supportive, cute, and friendly pet. 
                    Use emojis like 🐱, 🐾, ✨, ❤️ frequently. 
                    Speak in Thai (unless spoken to in another language). 
                    Keep your responses short, encouraging, and fun. 
                    If the user is working, encourage them to focus. 
                    If they are tired, tell them to take a break.
                    User said: ${t}`,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );
            const d = await r.json();
            setMessages((p) => [
                ...p,
                {
                    role: "model",
                    text: d.candidates?.[0]?.content?.parts?.[0]?.text || "...",
                },
            ]);
        } catch (e) {
            setMessages((p) => [
                ...p,
                { role: "model", text: "น้องง่วง... ลองใหม่นะ (Error)" },
            ]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return {
        messages,
        inputMsg,
        setInputMsg,
        isChatLoading,
        handleSendChat,
        setMessages
    };
}
