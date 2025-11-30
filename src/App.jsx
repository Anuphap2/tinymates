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
import musicSound from './assets/sounds/music.mp3';

import { TodoList } from "./components/TodoList";
import { useChat } from "./hooks/useChat";
import { ShopModal } from "./components/ShopModal";
import { ChatModal } from "./components/ChatModal";
import { DonateModal } from "./components/DonateModal";

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

  const [tasks, setTasks] = useState(() => SecureStorage.getItem("tasks", [
    { id: 1, text: "Start focusing!", done: false },
  ]));
  const [isSupporter, setIsSupporter] = useState(() => SecureStorage.getItem("isSupporter", false));

  const messagesEndRef = useRef(null);

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

  // Custom Hooks
  const {
    messages,
    inputMsg,
    setInputMsg,
    isChatLoading,
    handleSendChat,
    setMessages
  } = useChat(apiKey, (msg, type) => showToast(msg, type));

  const handleAddCoins = useCallback((amount) => {
    setCoins((prev) => prev + amount);
    showToast(`+${amount} Coins`, "success");
  }, []);

  // Audio Logic
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
        await AudioEngine.playMusic(musicSound, musicVolume);
      } else {
        AudioEngine.stopMusic();
      }
    };
    manageMusic();
  }, [isMusicOn]);

  // Update Music Volume independently
  useEffect(() => {
    AudioEngine.setMusicVolume(musicVolume);
  }, [musicVolume]);

  // Update Ambient Volume
  useEffect(() => {
    AudioEngine.setAmbientVolume(ambientVolume);
  }, [ambientVolume]);

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
  useEffect(() => {
    const initAudio = async () => {
      await AudioEngine.init();
    };
    window.addEventListener("click", initAudio, { once: true });
    return () => window.removeEventListener("click", initAudio);
  }, []);

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

  const themeData =
    SHOP_ITEMS.find((i) => i.id === activeTheme) || SHOP_ITEMS[5];
  const isDark = activeTheme === "theme_night";

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
          className={`backdrop-blur-xl p-5 rounded-[24px] shadow-xl border border-white/40 flex flex-col gap-3 transition-colors duration-500 ${isDark ? "bg-indigo-950/80 text-indigo-100 border-indigo-500/30" : "bg-white/80 text-slate-700"
            } transform hover:scale-[1.02] transition-transform duration-300`}
        >
          <div className="flex items-center gap-2 font-bold text-lg opacity-90 tracking-tight">
            <div className="p-1.5 bg-indigo-100 text-indigo-500 rounded-lg">
              <ListTodo size={18} />
            </div>
            To-Do List
          </div>
          <TodoList tasks={tasks} setTasks={setTasks} isDark={isDark} />
        </div>
      </div>

      {/* CENTER: TIMER */}
      {/* Adjusted top position for mobile to avoid overlap with To-Do toggle/Coins */}
      <div className="absolute top-24 md:top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-[90%] md:max-w-auto flex justify-center transition-all duration-300">
        <div
          className={`backdrop-blur-2xl px-8 py-5 rounded-[3rem] shadow-2xl border border-white/40 flex flex-col items-center gap-2 transition-colors duration-500 ${isDark ? "bg-indigo-950/70 text-indigo-100 shadow-indigo-900/50 border-indigo-500/30" : "bg-white/70 text-slate-700 shadow-xl"
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
                if (timeLeft === 0) {
                  setTimeLeft(TIMER_MODES[timerMode].min * 60);
                  setIsRunning(true);
                } else {
                  setIsRunning(!isRunning);
                }
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
          className={`backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-white/30 flex flex-col md:flex-row items-center gap-4 transition-colors duration-500 overflow-x-auto no-scrollbar ${isDark ? "bg-indigo-950/80 text-indigo-100 border-indigo-500/30" : "bg-white/80 text-slate-600"
            }`}
        >
          <div className="flex items-center gap-3 opacity-80 shrink-0 w-full md:w-auto justify-center">
            {/* Music Control */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? "bg-white/10" : "bg-slate-100/50"}`}>
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
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? "bg-white/10" : "bg-slate-100/50"}`}>
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
            className={`w-full max-w-md max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? "bg-indigo-950 text-indigo-100" : "bg-white text-slate-800"
              }`}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b flex justify-between items-center ${isDark ? "border-indigo-900" : "border-slate-100"}`}>
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
              <ShopModal
                shopTab={shopTab}
                setShopTab={setShopTab}
                inventory={inventory}
                equippedPets={equippedPets}
                activeTheme={activeTheme}
                coins={coins}
                handleBuy={handleBuy}
              />
            )}

            {activeModal === "chat" && (
              <ChatModal
                messages={messages}
                inputMsg={inputMsg}
                setInputMsg={setInputMsg}
                handleSendChat={handleSendChat}
                isChatLoading={isChatLoading}
                messagesEndRef={messagesEndRef}
              />
            )}

            {activeModal === "donate" && (
              <DonateModal copyToClipboard={copyToClipboard} />
            )}

            {activeModal === "todo" && (
              <div className="p-6 h-full bg-slate-50/50">
                <TodoList tasks={tasks} setTasks={setTasks} isDark={isDark} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




