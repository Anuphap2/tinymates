import { useState, useRef } from 'react';

const PET_FALLBACK_REPLIES = [
    "สู้ๆ น้าคนเก่ง! วันนี้ตั้งใจมากๆ แล้ว น้องส่งพลังใจก้อนโตให้เลยยย 🐾💖",
    "ถ้าเหนื่อยก็พักดื่มน้ำ ยืดเส้นยืดสายสักนิดน้า น้องจะนั่งเฝ้าอยู่ตรงนี้เอง ✨🐱",
    "เยี่ยมไปเลย! โฟกัสทีละนิด ทีละก้าว แล้วความสำเร็จจะมาหาเองนะ ⏱️✨",
    "น้องคอยเชียร์อยู่น้า อย่าลืมยิ้มให้ตัวเองด้วยนะวันนี้! 🌟🐾",
    "โฮ่งๆ/เหมียวๆ! ตั้งใจอ่าน/ทำงานขนาดนี้ เก่งที่สุดในโลกเลย! 🐶💖"
];

function getLocalPetReply(userText) {
    const lower = userText.toLowerCase();
    if (lower.includes("เหนื่อย") || lower.includes("ง่วง") || lower.includes("พัก")) {
        return "ถ้าเหนื่อยก็แวะพักดื่มน้ำหรือหลับตาสัก 5 นาทีนะคนเก่ง น้องจะนั่งเฝ้าตรงนี้น้า 🐾💤";
    }
    if (lower.includes("กำลังใจ") || lower.includes("สู้") || lower.includes("ท้อ")) {
        return "น้องส่งกอดอุ่นๆ และพลังใจให้เต็มร้อยเลยยย! เธอทำได้แน่นอน ฮึบๆ! 💖✨";
    }
    if (lower.includes("โฟกัส") || lower.includes("เริ่ม") || lower.includes("งาน")) {
        return "สุดยอดเลย! มาเริ่มโฟกัสไปด้วยกัน 25 นาทีนี้ ลุยยยย! ⏱️🐾";
    }
    if (lower.includes("สวัสดี") || lower.includes("หวัดดี") || lower.includes("hi") || lower.includes("hello")) {
        return "สวัสดีงับ! ยินดีที่ได้อยู่เคียงข้างเธอวันนี้น้า มีอะไรเล่าให้น้องฟังได้ตลอดเลย 🐱✨";
    }
    return PET_FALLBACK_REPLIES[Math.floor(Math.random() * PET_FALLBACK_REPLIES.length)];
}

export function useChat(apiKey, showToast) {
    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "สวัสดีงับ! น้องเป็นเพื่อนคู่คิดตัวจิ๋ว ยินดีที่ได้มาโฟกัสด้วยกันวันนี้ มีอะไรอยากคุยหรือขอกำลังใจบอกน้องได้เลยน้า 🐾✨"
        }
    ]);
    const [inputMsg, setInputMsg] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const lastChatTime = useRef(0);

    const handleSendChat = async (customText) => {
        const textToSend = (typeof customText === "string" ? customText : inputMsg).trim();
        if (!textToSend) return;

        // Rate Limiting (Cooldown 1.5s)
        const now = Date.now();
        if (now - lastChatTime.current < 1500) {
            showToast("ใจเย็นๆ น้า น้องพิมพ์ไม่ทัน! ⏳", "info");
            return;
        }
        lastChatTime.current = now;

        setMessages((p) => [...p, { role: "user", text: textToSend }]);
        setInputMsg("");
        setIsChatLoading(true);

        // If no API key, use delightful local pet companion responses
        if (!apiKey) {
            setTimeout(() => {
                const reply = getLocalPetReply(textToSend);
                setMessages((p) => [...p, { role: "model", text: reply }]);
                setIsChatLoading(false);
            }, 600);
            return;
        }

        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `You are a supportive, warm, and cute focus companion pet named "Tiny" in the TinyMates pomodoro app.
Roleplay as a loving pet. Use emojis (🐾, ✨, 💖, 🐱, 🐶).
Speak warm friendly Thai. Keep answers concise (1-3 sentences), encouraging, and empathetic.
User says: ${textToSend}`
                                    }
                                ]
                            }
                        ]
                    })
                }
            );

            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
                setMessages((p) => [...p, { role: "model", text: reply }]);
            } else {
                setMessages((p) => [...p, { role: "model", text: getLocalPetReply(textToSend) }]);
            }
        } catch (e) {
            // Fallback gracefully to pet reply
            setMessages((p) => [...p, { role: "model", text: getLocalPetReply(textToSend) }]);
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
