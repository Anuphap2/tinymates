import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ShoppingBag,
  Volume2,
  Coins,
  Lock,
  Check,
  MessageCircle,
  Sparkles,
  X,
  Heart,
  Music,
  ListTodo,
  ChevronDown,
  ChevronUp,
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
  const [equippedPets, setEquippedPets] = useState(() => SecureStorage.getItem("equippedPets", ["pet_cat", "pet_dog"]));
  const [activeTheme, setActiveTheme] = useState(() => SecureStorage.getItem("activeTheme", "theme_day"));
  const [activeSounds, setActiveSounds] = useState(() => SecureStorage.getItem("activeSounds", ["sound_rain"]));
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [musicVolume, setMusicVolume] = useState(0.25);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [shopTab, setShopTab] = useState("pet");
  const [toasts, setToasts] = useState([]);
  const [isTodoListCollapsed, setIsTodoListCollapsed] = useState(false);

  const [tasks, setTasks] = useState(() => SecureStorage.getItem("tasks", [
    { id: 1, text: "Focus for 25 minutes", done: false },
    { id: 2, text: "Drink a glass of water", done: false },
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
      return [...prev, t].slice(-4);
    });
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("คัดลอกเบอร์แล้ว! ขอบคุณมากครับ 💖", "success");
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
  } = useChat(apiKey, (msg, type) => showToast(msg, type));

  const handleAddCoins = useCallback((amount) => {
    setCoins((prev) => prev + amount);
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
    AudioEngine.init();

    if (activeSounds.includes(soundId)) {
      AudioEngine.stopAmbient(soundId);
      setActiveSounds(prev => prev.filter(id => id !== soundId));
    } else {
      if (activeSounds.length >= 3) {
        showToast("เปิดเสียงบรรยากาศพร้อมกันได้สูงสุด 3 เสียงนะ", "info");
        return;
      }
      setActiveSounds(prev => [...prev, soundId]);
      await playSoundById(soundId, ambientVolume);
    }
  };

  // Music Logic
  const [isMusicOn, setIsMusicOn] = useState(false);

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

  useEffect(() => {
    AudioEngine.setMusicVolume(musicVolume);
  }, [musicVolume]);

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

  // Audio Engine Init on first interaction
  useEffect(() => {
    const initAudio = async () => {
      await AudioEngine.init();
    };
    window.addEventListener("click", initAudio, { once: true });
    window.addEventListener("keydown", initAudio, { once: true });
    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Timer Interval
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (timerMode === "focus" && prev % 60 === 0 && prev !== 25 * 60) {
            setCoins((c) => c + 5);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      AudioEngine.init();
      if (timerMode === "focus") {
        setCoins((c) => c + 100);
        showToast("ยอดเยี่ยมมาก! โฟกัสสำเร็จ รับ 100 Coins 🎉", "success");
      } else {
        showToast("หมดเวลาพักผ่อนแล้ว พร้อมลุยต่อกันเลย!", "info");
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
      if (item.category === "sound") {
        handleToggleSound(item.id);
      }
      if (item.category === "pet") {
        if (equippedPets.includes(item.id)) {
          if (equippedPets.length === 1) {
            showToast("ต้องมีสัตว์เลี้ยงอยู่ในห้องอย่างน้อย 1 ตัวนะ", "info");
            return;
          }
          setEquippedPets((prev) => prev.filter((id) => id !== item.id));
          showToast(`${item.name} พักผ่อน`);
        } else {
          if (equippedPets.length >= 5) {
            showToast("ห้องเต็มแล้ว (สูงสุด 5 ตัว)", "error");
          } else {
            setEquippedPets((prev) => [...prev, item.id]);
            showToast(`${item.name} ออกมาเดินเล่นแล้ว! ✨`);
          }
        }
      }
      return;
    }
    if (coins >= item.price) {
      setCoins((c) => c - item.price);
      setInventory((i) => [...i, item.id]);
      if (item.category === "pet") {
        setEquippedPets((prev) => [...prev, item.id]);
      }
      showToast(`ปลดล็อก ${item.name} สำเร็จ!`, "success");
    } else {
      showToast("เหรียญยังไม่พอ สะสมต่ออีกนิดนะ!", "error");
    }
  };

  const themeData = SHOP_ITEMS.find((i) => i.id === activeTheme) || SHOP_ITEMS[5];
  const isDark = activeTheme === "theme_night";

  // Calculate timer progress percentage
  const totalModeSeconds = (TIMER_MODES[timerMode]?.min || 25) * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalModeSeconds - timeLeft) / totalModeSeconds) * 100));

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-sans select-none transition-colors duration-1000 bg-[#f5f5f5]"
      style={{
        background: `linear-gradient(to bottom, ${themeData.bgTop}, ${themeData.bgBot})`,
      }}
    >
      {/* 2D Interactive Room Canvas */}
      <RoomCanvas2D
        equippedPets={equippedPets}
        activeTheme={activeTheme}
        activeSound={activeSounds.length > 0 ? activeSounds[0] : null}
        activeSounds={activeSounds}
        isFocusing={isRunning && timerMode === "focus"}
        isSupporter={isSupporter}
        onAddCoins={handleAddCoins}
      />

      {/* Subtle Noise Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* TOP BRAND & STATUS BAR */}
      <header className="absolute top-5 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-serif-editorial text-[#0c0a09] tracking-tight">
                TinyMates
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#f0efed] text-[#777169] border border-[#e7e5e4]">
                Focus Studio
              </span>
            </div>
            <p className="text-[11px] text-[#777169] hidden md:block">
              Mindful pomodoro companion & cozy pet sanctuary
            </p>
          </div>
        </div>

        {/* Right: Coins pill & Action buttons */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Coin Badge Pill */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-[#0c0a09] border border-[#e7e5e4] transition-all hover:border-[#d6d3d1]">
            <Coins size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-semibold tracking-tight">{coins}</span>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Only To-Do Toggle */}
            <div className="md:hidden">
              <ControlButton
                icon={<ListTodo size={17} />}
                onClick={() => setActiveModal("todo")}
                label="To-Do"
              />
            </div>
            <ControlButton
              icon={<MessageCircle size={17} />}
              onClick={() => setActiveModal("chat")}
              label="Companion Chat"
            />
            <ControlButton
              icon={<ShoppingBag size={17} />}
              onClick={() => {
                setActiveModal("shop");
                setShopTab("pet");
              }}
              label="Decor & Pets"
            />
            <ControlButton
              icon={<Heart size={17} className="text-rose-500" />}
              onClick={() => setActiveModal("donate")}
              label="Support Project"
            />
          </div>
        </div>
      </header>

      {/* LEFT DOCKED TO-DO LIST (Desktop) */}
      <div className="absolute top-20 left-6 z-30 w-72 pointer-events-auto hidden md:block transition-all duration-300">
        <div className="el-card-glass p-4 rounded-2xl shadow-sm border border-[#e7e5e4] flex flex-col gap-2.5">
          <div className="flex items-center justify-between font-serif-editorial text-base text-[#0c0a09]">
            <div className="flex items-center gap-2">
              <ListTodo size={16} className="text-[#292524]" />
              <span>Today's Focus</span>
            </div>
            <button
              onClick={() => setIsTodoListCollapsed(!isTodoListCollapsed)}
              className="text-[#777169] hover:text-[#0c0a09] p-1 rounded-full hover:bg-black/5 transition-all"
            >
              {isTodoListCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
          {!isTodoListCollapsed && (
            <TodoList tasks={tasks} setTasks={setTasks} isDark={isDark} />
          )}
        </div>
      </div>

      {/* CENTERPIECE: ELEVENLABS EDITORIAL POMODORO TIMER */}
      <div className="absolute top-20 md:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center">
        <div className="el-card-glass px-6 py-4 md:px-8 md:py-5 rounded-3xl shadow-sm border border-[#e7e5e4] flex flex-col items-center gap-3 w-fit transition-all duration-300">
          {/* Mode Selector Pill */}
          <div className="flex gap-1 p-1 bg-[#f0efed] rounded-full border border-[#e7e5e4]/60">
            {Object.keys(TIMER_MODES).map((m) => {
              const isActive = timerMode === m;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setIsRunning(false);
                    setTimerMode(m);
                    setTimeLeft(TIMER_MODES[m].min * 60);
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                    isActive
                      ? "bg-[#292524] text-white shadow-xs"
                      : "text-[#777169] hover:text-[#0c0a09]"
                  }`}
                >
                  {TIMER_MODES[m].label}
                </button>
              );
            })}
          </div>

          {/* Time Digits & Controls */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-light font-serif-editorial tracking-tight tabular-nums text-[#0c0a09]">
                {Math.floor(timeLeft / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
              {/* Progress Hairline */}
              <div className="w-full h-1 bg-[#e7e5e4] rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#292524] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Play/Pause Button */}
            <div className="flex items-center gap-2">
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
                className={`h-11 px-5 rounded-full flex items-center justify-center gap-2 text-white transition-all duration-200 shadow-sm hover:shadow active:scale-95 text-xs font-semibold tracking-wide ${
                  isRunning
                    ? "bg-[#d97706] hover:bg-[#b45309]"
                    : "bg-[#292524] hover:bg-[#0c0a09]"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause size={15} fill="currentColor" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={15} fill="currentColor" className="ml-0.5" />
                    <span>Start</span>
                  </>
                )}
              </button>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(TIMER_MODES[timerMode].min * 60);
                }}
                className="w-11 h-11 rounded-full border border-[#e7e5e4] bg-white text-[#777169] hover:text-[#0c0a09] hover:bg-[#f5f5f5] flex items-center justify-center transition-all duration-200 active:scale-95"
                title="Reset timer"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ELEVENLABS AUDIO WAVEFORM & SOUNDSCAPES DECK */}
      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto w-full max-w-[95%] md:max-w-3xl px-2">
        <div className="el-card-glass px-4 py-2.5 md:px-6 md:py-3 rounded-full shadow-sm border border-[#e7e5e4] flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* Music Control with Equalizer Waveform */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMusicOn(!isMusicOn)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 border ${
                isMusicOn
                  ? "bg-[#292524] text-white border-[#292524] shadow-xs"
                  : "bg-white text-[#777169] border-[#e7e5e4] hover:border-[#d6d3d1] hover:text-[#0c0a09]"
              }`}
            >
              <Music size={14} />
              <span>Lo-Fi Music</span>
              {/* Dancing Equalizer Waveform */}
              {isMusicOn && (
                <div className="flex items-center gap-0.5 h-3 ml-0.5">
                  <span className="w-0.5 bg-white rounded-full wave-bar-1" />
                  <span className="w-0.5 bg-white rounded-full wave-bar-2" />
                  <span className="w-0.5 bg-white rounded-full wave-bar-3" />
                  <span className="w-0.5 bg-white rounded-full wave-bar-4" />
                </div>
              )}
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-1.5">
              <Volume2 size={13} className="text-[#777169]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAmbientVolume(val);
                  setMusicVolume(val);
                }}
                className="w-14 md:w-20 h-1 bg-[#e7e5e4] rounded-lg appearance-none cursor-pointer accent-[#292524]"
                title="Volume control"
              />
            </div>
          </div>

          <div className="hidden md:block w-px h-5 bg-[#e7e5e4] shrink-0" />

          {/* Ambient Soundscapes Pill Toggles */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {SHOP_ITEMS.filter((i) => i.category === "sound").map((s) => {
              const isSoundActive = activeSounds.includes(s.id);
              const isOwned = inventory.includes(s.id);

              return (
                <button
                  key={s.id}
                  onClick={() => handleBuy(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                    isSoundActive
                      ? "bg-[#292524] text-white border-[#292524] shadow-xs"
                      : "bg-white text-[#777169] border-[#e7e5e4] hover:border-[#d6d3d1] hover:text-[#0c0a09]"
                  }`}
                >
                  <span className="text-xs">{s.name}</span>
                  {!isOwned && <Lock size={10} className="opacity-50" />}
                  {isSoundActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </footer>

      {/* ELEVENLABS PILL TOAST NOTIFICATIONS */}
      <div className="absolute bottom-24 right-6 z-[60] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-full shadow-md backdrop-blur-md flex items-center gap-2.5 border border-[#e7e5e4] text-xs font-medium animate-in slide-in-from-right-8 duration-200 ${
              t.type === "success"
                ? "bg-[#292524] text-white"
                : "bg-white/95 text-[#0c0a09]"
            }`}
          >
            {t.type === "success" ? (
              <Check size={14} className="text-emerald-400" strokeWidth={2.5} />
            ) : (
              <Sparkles size={14} className="text-amber-500" strokeWidth={2.5} />
            )}
            <span>{t.text}</span>
            {t.count > 1 && (
              <span className="bg-black/10 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                x{t.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ELEVENLABS MODAL SYSTEM */}
      {activeModal && (
        <div
          className="absolute inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-lg h-[82vh] max-h-[680px] rounded-3xl shadow-2xl flex flex-col overflow-hidden bg-white border border-[#e7e5e4] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e7e5e4] flex justify-between items-center bg-white shrink-0">
              <h2 className="font-serif-editorial text-xl text-[#0c0a09] flex items-center gap-2">
                {activeModal === "shop" && "Pet & Room Collection"}
                {activeModal === "chat" && "Mindful Companion"}
                {activeModal === "donate" && "Support the Creator"}
                {activeModal === "todo" && "Focus Checklist"}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full border border-[#e7e5e4] hover:bg-[#f5f5f5] flex items-center justify-center text-[#777169] hover:text-[#0c0a09] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Contents */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
                <div className="p-6 h-full min-h-0 overflow-y-auto custom-scrollbar bg-[#fafafa]">
                  <TodoList tasks={tasks} setTasks={setTasks} isDark={isDark} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
