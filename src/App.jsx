import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  ShoppingBag,
  Volume2,
  Coins,
  Lock,
  Check,
  MessageCircle,
  Send,
  Sparkles,
  X,
  Heart,
  Music,
  PawPrint,
  Home,
  ListTodo,
  Plus,
  Trash2,
  QrCode,
} from "lucide-react";
import { SHOP_ITEMS, TIMER_MODES } from "./constants";
import { AudioEngine } from "./utils/AudioEngine";
import SecureStorage from "./utils/secureStorage";
import { ControlButton } from "./components/ControlButton";
import RoomCanvas2D from "./components/RoomCanvas2D";
import './index.css';


const apiKey = import.meta.env.VITE_GEMINI_API_KEY;



export default function CozyFocusApp() {
  const [coins, setCoins] = useState(() => SecureStorage.getItem("coins", 100));
  const [inventory, setInventory] = useState(() => SecureStorage.getItem("inventory", [
    "pet_cat",
    "pet_dog",
    "theme_day",
    "theme_cozy",
    "sound_rain",
    "sound_fire",
  ]));
  const [equippedPets, setEquippedPets] = useState(() => SecureStorage.getItem("equippedPets", ["pet_cat"]));
  const [activeTheme, setActiveTheme] = useState(() => SecureStorage.getItem("activeTheme", "theme_day"));
  const [activeSounds, setActiveSounds] = useState(() => SecureStorage.getItem("activeSounds", ["sound_rain"]));
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.3);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [shopTab, setShopTab] = useState("pet");
  const [toasts, setToasts] = useState([]);

  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // New: To-Do List State
  const [tasks, setTasks] = useState(() => SecureStorage.getItem("tasks", [
    { id: 1, text: "Start focusing!", done: false },
  ]));
  const [newTask, setNewTask] = useState("");
  const [isSupporter, setIsSupporter] = useState(() => SecureStorage.getItem("isSupporter", false));

  const messagesEndRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Ref for rate limiting
  const lastChatTime = useRef(0);

  // Persist state to SecureStorage
  useEffect(() => {
    SecureStorage.setItem("coins", coins);
    SecureStorage.setItem("inventory", inventory);
    SecureStorage.setItem("equippedPets", equippedPets);
    SecureStorage.setItem("activeTheme", activeTheme);
    SecureStorage.setItem("activeSounds", activeSounds);
    SecureStorage.setItem("tasks", tasks);
    SecureStorage.setItem("isSupporter", isSupporter);
  }, [coins, inventory, equippedPets, activeTheme, activeSounds, tasks, isSupporter]);

  // Audio Engine Init
  // Audio Engine Init
  useEffect(() => {
    const initAudio = async () => {
      await AudioEngine.init();
    };
    // Initialize on first click to bypass autoplay policy
    window.addEventListener("click", initAudio, { once: true });
    return () => window.removeEventListener("click", initAudio);
  }, []);

  useEffect(() => {
    if (activeModal === "chat")
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeModal]);

  // --- HELPER FUNCTIONS ---
  const showToast = (text, type = "info") => {
    setToasts((prev) => {
      const last = prev[prev.length - 1];
      const newId = Date.now() + Math.random();
      if (last && last.text === text && last.type === type) {
        const updated = [...prev];
        updated[prev.length - 1] = {
          ...last,
          count: (last.count || 1) + 1,
          id: newId,
        };
        setTimeout(
          () => setToasts((curr) => curr.filter((t) => t.id !== newId)),
          2500
        );
        return updated;
      }
      const t = { id: newId, text, type, count: 1 };
      setTimeout(
        () => setToasts((curr) => curr.filter((x) => x.id !== newId)),
        2500
      );
      return [...prev, t].slice(-5);
    });
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("คัดลอกแล้ว! ขอบคุณครับ ❤️", "success");
      setCoins((c) => c + 100);
      setIsSupporter(true);
    } catch (err) {
      showToast("คัดลอกไม่สำเร็จ", "error");
    }
    document.body.removeChild(textArea);
  };

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (timerMode === "focus" && prev % 60 === 0 && prev !== 25 * 60)
            setCoins((c) => c + 5);
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      AudioEngine.init();
      if (timerMode === "focus") {
        setCoins((c) => c + 100);
        showToast("เก่งมาก! รับ 100 Coins", "success");
      } else {
        showToast("หมดเวลาพักแล้ว!", "info");
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  // Audio
  // Audio
  // Audio
  const playSoundById = async (soundId, vol) => {
    try {
      switch (soundId) {
        case "sound_rain": await AudioEngine.playRain(vol); break;
        case "sound_fire": await AudioEngine.playFire(vol); break;
        case "sound_waves": await AudioEngine.playWaves(vol); break;
        case "sound_night": await AudioEngine.playCrickets(vol); break;
        case "sound_white": await AudioEngine.playWhite(vol); break;
        case "sound_wind": await AudioEngine.playWind(vol); break;
        default: break;
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };

  const handleToggleSound = async (soundId) => {
    const ctx = AudioEngine.init();

    if (activeSounds.includes(soundId)) {
      // Remove sound
      AudioEngine.stopAmbient(soundId);
      setActiveSounds(prev => prev.filter(id => id !== soundId));
    } else {
      // Add sound
      if (activeSounds.length >= 3) {
        showToast("เปิดพร้อมกันได้สูงสุด 3 เสียงนะ", "error");
        return;
      }
      setActiveSounds(prev => [...prev, soundId]);
      await playSoundById(soundId, ambientVolume);
    }
  };

  // Music Logic
  const [isMusicOn, setIsMusicOn] = useState(true);

  useEffect(() => {
    const manageMusic = async () => {
      if (isMusicOn) {
        await AudioEngine.playMusic("/src/assets/sounds/music.mp3", musicVolume);
      } else {
        AudioEngine.stopMusic();
      }
    };
    manageMusic();
  }, [isMusicOn]); // Volume handled separately

  // Update Music Volume independently
  useEffect(() => {
    AudioEngine.setMusicVolume(musicVolume);
  }, [musicVolume]);

  // Update Ambient Volume
  useEffect(() => {
    AudioEngine.setAmbientVolume(ambientVolume);
  }, [ambientVolume]);

  // Restore active sounds on mount/resume


  useEffect(() => {
    const restoreSounds = async () => {
      for (const id of activeSounds) {
        await playSoundById(id, ambientVolume);
      }
    };
    // We need a user interaction first usually.
    // But let's try.
    if (activeSounds.length > 0) restoreSounds();
  }, []); // On mount only? Or when activeSounds changes? 
  // If we put activeSounds here, it will re-trigger on every toggle.
  // handleToggleSound already plays. So we only need this for initial load.

  // Actually, better to just let handleToggleSound do the work for user interactions.
  // For initial load, we might need a "start" button or just rely on the first click.
  // Let's leave this effect empty for now and rely on user toggling or a "Resume" feature if needed.
  // Actually, the previous code didn't auto-play on load perfectly either without click.
  // Let's just ensure volume updates work.


  // Shop Logic
  const handleBuy = (item) => {
    if (inventory.includes(item.id)) {
      if (item.category === "room") {
        setActiveTheme(item.id);
        showToast(`เปลี่ยนห้องเป็น: ${item.name}`);
      }
      if (item.category === "sound") handleToggleSound(item.id);
      if (item.category === "pet") {
        if (equippedPets.includes(item.id)) {
          setEquippedPets((prev) => prev.filter((id) => id !== item.id));
          showToast(`${item.name} พักผ่อน`);
        } else {
          if (equippedPets.length >= 5)
            showToast("ห้องเต็มแล้ว (Max 5)", "error");
          else {
            setEquippedPets((prev) => [...prev, item.id]);
            showToast(`${item.name} ออกมาแล้ว!`);
          }
        }
      }
      return;
    }
    if (coins >= item.price) {
      setCoins((c) => c - item.price);
      setInventory((i) => [...i, item.id]);
      if (item.category === "pet")
        setEquippedPets((prev) => [...prev, item.id]);
      showToast(`ปลดล็อก ${item.name}!`, "success");
    } else showToast("เหรียญไม่พอจ้า", "error");
  };

  // To-Do Logic
  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: newTask, done: false },
    ]);
    setNewTask("");
  };
  const handleAddCoins = useCallback((amount) => {
    setCoins((prev) => prev + amount);
    showToast(`+${amount} Coins`, "success");
  }, []);
  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  // --- SECURE CHAT HANDLER ---
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

  const themeData =
    SHOP_ITEMS.find((i) => i.id === activeTheme) || SHOP_ITEMS[5];
  const isDark = activeTheme === "theme_night";

  // Reusable To-Do Content
  const renderTodoContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar p-1">
        {tasks.length === 0 && (
          <div className="text-xs opacity-50 text-center py-4">
            เพิ่มงานที่ต้องทำตรงนี้...
          </div>
        )}
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm group bg-white/50 p-2 rounded-lg hover:bg-white/80 transition-colors">
            <button
              onClick={() => toggleTask(t.id)}
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${t.done
                ? "bg-indigo-500 border-indigo-500 text-white"
                : "border-slate-400 bg-white"
                }`}
            >
              {t.done && <Check size={12} />}
            </button>
            <span
              className={`flex-1 truncate ${t.done ? "line-through opacity-50" : ""
                }`}
            >
              {t.text}
            </span>
            <button
              onClick={() => deleteTask(t.id)}
              className="opacity-40 hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-all"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200/50">
        <input
          className={`flex-1 text-sm bg-white/50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all ${isDark ? "placeholder-slate-500 bg-slate-800/50 border-slate-700 text-white" : "placeholder-slate-400"
            }`}
          placeholder="พิมพ์งานใหม่..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button
          onClick={addTask}
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-3 py-2 shadow-sm transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-sans select-none transition-colors duration-1000"
      style={{
        background: `linear-gradient(to bottom, ${themeData.bgTop}, ${themeData.bgBot})`,
      }}
    >
      <RoomCanvas2D
        equippedPets={equippedPets}
        activeTheme={activeTheme}
        activeSound={activeSounds.length > 0 ? activeSounds[0] : null}
        activeSounds={activeSounds}
        isFocusing={isRunning && timerMode === "focus"} // Pass focus state
        isSupporter={isSupporter}
        onAddCoins={handleAddCoins}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* LEFT SIDE: TO-DO LIST (Desktop Only) */}
      <div className="absolute top-6 left-6 z-40 w-72 pointer-events-auto hidden md:block">
        <div
          className={`backdrop-blur-xl p-5 rounded-[24px] shadow-xl border border-white/40 flex flex-col gap-3 transition-colors duration-500 ${isDark ? "bg-slate-900/80 text-white" : "bg-white/80 text-slate-700"
            } transform hover:scale-[1.02] transition-transform duration-300`}
        >
          <div className="flex items-center gap-2 font-bold text-lg opacity-90 tracking-tight">
            <div className="p-1.5 bg-indigo-100 text-indigo-500 rounded-lg">
              <ListTodo size={18} />
            </div>
            To-Do List
          </div>
          {renderTodoContent()}
        </div>
      </div>

      {/* CENTER: TIMER */}
      {/* Adjusted top position for mobile to avoid overlap with To-Do toggle/Coins */}
      <div className="absolute top-24 md:top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-[90%] md:max-w-auto flex justify-center transition-all duration-300">
        <div
          className={`backdrop-blur-2xl px-8 py-5 rounded-[3rem] shadow-2xl border border-white/40 flex flex-col items-center gap-2 transition-colors duration-500 ${isDark ? "bg-slate-900/70 text-white shadow-indigo-500/20" : "bg-white/70 text-slate-700 shadow-xl"
            }`}
        >
          <div className="flex gap-1.5 mb-1 bg-black/5 p-1 rounded-full">
            {Object.keys(TIMER_MODES).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setIsRunning(false);
                  setTimerMode(m);
                  setTimeLeft(TIMER_MODES[m].min * 60);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${timerMode === m
                  ? "bg-white text-indigo-600 shadow-sm scale-105"
                  : "text-slate-500 hover:bg-white/50"
                  }`}
              >
                {TIMER_MODES[m].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <span className="text-7xl font-black font-mono tracking-tighter tabular-nums opacity-90 drop-shadow-sm">
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                AudioEngine.init();
              }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-90 hover:scale-110 hover:shadow-xl ${isRunning ? "bg-amber-400 rotate-0" : "bg-indigo-500 hover:rotate-6"
                }`}
            >
              {isRunning ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" className="ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: COINS & MENU */}
      <div className="absolute top-6 right-6 z-40 flex flex-col gap-3 items-end pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full font-bold shadow-lg flex items-center gap-2 text-slate-700 transform hover:scale-105 transition-transform cursor-default border-2 border-white/50 ring-2 ring-yellow-100">
          <Coins size={20} className="text-yellow-500 fill-yellow-500 drop-shadow-sm" />
          <span className="text-lg">{coins}</span>
        </div>
        <div className="flex gap-3 flex-col md:flex-row">
          {/* Mobile Only To-Do Button */}
          <div className="md:hidden">
            <ControlButton
              icon={<ListTodo />}
              color="text-indigo-500"
              onClick={() => setActiveModal("todo")}
              label="To-Do"
            />
          </div>
          <ControlButton
            icon={<MessageCircle />}
            color="text-blue-500"
            onClick={() => setActiveModal("chat")}
            label="Chat"
          />
          <ControlButton
            icon={<ShoppingBag />}
            color="text-pink-500"
            onClick={() => {
              setActiveModal("shop");
              setShopTab("pet");
            }}
            label="Shop"
          />
          <ControlButton
            icon={<Heart />}
            color="text-red-500"
            onClick={() => setActiveModal("donate")}
            label="Support"
          />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-full max-w-[90%] md:max-w-3xl px-4">
        <div
          className={`backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-white/30 flex flex-col md:flex-row items-center gap-4 transition-colors duration-500 overflow-x-auto no-scrollbar ${isDark ? "bg-slate-900/80 text-white" : "bg-white/80 text-slate-600"
            }`}
        >
          <div className="flex items-center gap-3 opacity-80 shrink-0 w-full md:w-auto justify-center">
            {/* Music Control */}
            <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-xl">
              <button
                onClick={() => setIsMusicOn(!isMusicOn)}
                className={`p-1.5 rounded-full transition-all ${isMusicOn ? "bg-indigo-100 text-indigo-500" : "bg-slate-200 text-slate-400"}`}
                title="Toggle Music"
              >
                <Music size={16} />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-16 md:w-20 accent-indigo-500 h-1.5 bg-slate-300/50 rounded-lg appearance-none cursor-pointer"
                title="Music Volume"
              />
            </div>

            {/* Ambient Control */}
            <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-xl">
              <Volume2 size={16} className="text-slate-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-16 md:w-20 accent-teal-500 h-1.5 bg-slate-300/50 rounded-lg appearance-none cursor-pointer"
                title="Ambient Volume"
              />
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-300/30 shrink-0"></div>
          <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar">
            {SHOP_ITEMS.filter((i) => i.category === "sound").map((s) => (
              <button
                key={s.id}
                onClick={() => handleBuy(s)}
                className={`relative shrink-0 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all hover:scale-105 active:scale-95 ${activeSounds.includes(s.id)
                  ? "bg-teal-100 text-teal-700 shadow-inner ring-2 ring-teal-200"
                  : "bg-white/50 hover:bg-white"
                  }`}
              >
                {s.icon} <span>{s.name}</span>
                {!inventory.includes(s.id) && (
                  <Lock size={12} className="opacity-50" />
                )}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <div className="absolute bottom-32 right-6 z-[60] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 border border-white/40 ${t.type === "success"
              ? "bg-emerald-500/90 text-white"
              : "bg-white/90 text-slate-700"
              }`}
          >
            {t.type === "success" ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <Sparkles size={16} strokeWidth={3} />
            )}
            <span className="font-bold text-sm">{t.text}</span>
            {t.count > 1 && (
              <span className="bg-black/10 px-2 py-0.5 rounded-lg text-[10px] font-black">
                x{t.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {activeModal && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className={`w-full max-w-md max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-800"
              }`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center border-slate-100 ">
              <h2 className="font-bold text-xl flex items-center gap-2">
                {activeModal === "shop" && (
                  <>
                    <ShoppingBag className="text-pink-500" /> Pet & Decor
                  </>
                )}
                {activeModal === "chat" && (
                  <>
                    <MessageCircle className="text-blue-500" /> AI Companion
                  </>
                )}
                {activeModal === "donate" && (
                  <>
                    <Heart className="text-red-500" /> Support
                  </>
                )}
                {activeModal === "todo" && (
                  <>
                    <ListTodo className="text-indigo-500" /> To-Do List
                  </>
                )}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* SHOP CONTENT (Refined Layout) */}
            {activeModal === "shop" && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex px-6 pt-4 gap-2">
                  {["pet", "room", "sound"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setShopTab(tab)}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shopTab === tab
                        ? "bg-indigo-500 text-white shadow-md"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                      {tab === "pet" ? (
                        <PawPrint size={14} />
                      ) : tab === "room" ? (
                        <Home size={14} />
                      ) : (
                        <Music size={14} />
                      )}{" "}
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6 overflow-y-auto grid grid-cols-2 gap-4 bg-slate-50/50  flex-1">
                  {SHOP_ITEMS.filter((i) => i.category === shopTab).map(
                    (item) => {
                      const owned = inventory.includes(item.id);
                      let isEquipped = false;
                      if (item.category === "pet")
                        isEquipped = equippedPets.includes(item.id);
                      if (item.category === "room")
                        isEquipped = activeTheme === item.id;

                      // Preview Background
                      const previewBg =
                        item.category === "pet"
                          ? item.color
                          : item.bgTop || "#eee";
                      // Dashed border for unowned, Solid + Color for owned
                      const borderClass = owned
                        ? isEquipped
                          ? "border-indigo-500 ring-2 ring-indigo-100"
                          : "border-transparent hover:border-indigo-200 hover:shadow-md"
                        : "border-dashed border-slate-300 opacity-90";

                      return (
                        <div
                          key={item.id}
                          className={`relative flex flex-col p-3 rounded-[24px] border-2 bg-white  transition-all group ${borderClass}`}
                        >
                          {/* Top Image Area */}
                          <div
                            className="w-full aspect-square rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden shadow-inner"
                            style={{ background: previewBg }}
                          >
                            {/* Icon */}
                            <div className="text-6xl drop-shadow-md filter grayscale-0 transform group-hover:scale-110 transition-transform duration-300">
                              {item.icon || item.emoji}
                            </div>

                            {/* Price Badge (Only if NOT owned) */}
                            {!owned && (
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1 z-10">
                                <Coins
                                  size={10}
                                  className="text-yellow-500 fill-yellow-500"
                                />{" "}
                                {item.price}
                              </div>
                            )}
                          </div>

                          {/* Info Section */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="mb-3 text-center">
                              <div className="text-sm font-bold text-slate-800 leading-tight">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                {item.desc}
                              </div>
                            </div>

                            {/* Action Button (Full Width) */}
                            <button
                              onClick={() => handleBuy(item)}
                              className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95
                                                        ${owned
                                  ? isEquipped
                                    ? "bg-indigo-100 text-indigo-600 cursor-default"
                                    : "bg-slate-100 text-slate-500 hover:bg-indigo-500 hover:text-white"
                                  : coins >=
                                    item.price
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200/50 hover:bg-indigo-600"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }
                                                    `}
                            >
                              {owned
                                ? isEquipped
                                  ? item.category === "pet"
                                    ? "Active"
                                    : "Active"
                                  : "Select"
                                : coins >= item.price
                                  ? "Unlock"
                                  : "Locked"}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {activeModal === "chat" && (
              <div className="flex flex-col h-full bg-slate-50/50 ">
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
                        : "bg-white self-start rounded-bl-sm"
                        }`}
                    >
                      {m.text}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t  flex gap-3 bg-white ">
                  <input
                    className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50"
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
            )}

            {activeModal === "donate" && (
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
            )}

            {activeModal === "todo" && (
              <div className="p-6 h-full bg-slate-50/50">
                {renderTodoContent()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




