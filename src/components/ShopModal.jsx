import React from "react";
import { PawPrint, Home, Music, Check, Lock, Sparkles, Coins } from "lucide-react";
import { SHOP_ITEMS } from "../constants";

export function ShopModal({
    shopTab,
    setShopTab,
    inventory,
    equippedPets,
    activeTheme,
    coins,
    handleBuy,
    isDark,
}) {
    const tabs = [
        { id: "pet", label: "Pets", icon: <PawPrint size={15} /> },
        { id: "room", label: "Rooms", icon: <Home size={15} /> },
        { id: "sound", label: "Sounds", icon: <Music size={15} /> },
    ];

    return (
        <div className={`flex flex-col h-full min-h-0 overflow-hidden ${
            isDark ? "bg-indigo-950/80 text-indigo-100" : "bg-[#fafafa] text-[#0c0a09]"
        }`}>
            {/* Category Selector Pills */}
            <div className={`flex px-6 pt-5 pb-3 gap-2 border-b shrink-0 ${
                isDark ? "bg-indigo-950 border-indigo-900/60" : "bg-white border-[#e7e5e4]"
            }`}>
                {tabs.map((tab) => {
                    const isActive = shopTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setShopTab(tab.id)}
                            aria-label={`View ${tab.label}`}
                            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                                isActive
                                    ? isDark
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "bg-[#292524] text-white shadow-sm"
                                    : isDark
                                        ? "bg-transparent text-indigo-300 hover:text-white hover:bg-white/10"
                                        : "bg-transparent text-[#777169] hover:text-[#0c0a09] hover:bg-[#f5f5f5]"
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Product Card Grid */}
            <div className="p-6 overflow-y-auto min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 custom-scrollbar">
                {SHOP_ITEMS.filter((i) => i.category === shopTab).map((item) => {
                    const owned = inventory.includes(item.id);
                    let isEquipped = false;
                    if (item.category === "pet") isEquipped = equippedPets.includes(item.id);
                    if (item.category === "room") isEquipped = activeTheme === item.id;

                    const previewBg = item.category === "pet" ? item.color : item.bgTop || "#f5f5f4";

                    return (
                        <div
                            key={item.id}
                            className={`relative flex flex-col p-4 rounded-2xl border transition-all duration-200 group ${
                                isDark
                                    ? isEquipped
                                        ? "bg-indigo-900/50 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-sm"
                                        : "bg-indigo-900/30 border-indigo-900/60 hover:border-indigo-700/60 hover:shadow-md"
                                    : isEquipped
                                        ? "bg-white border-[#292524] ring-2 ring-[#292524]/10 shadow-sm"
                                        : "bg-white border-[#e7e5e4] hover:border-[#d6d3d1] hover:shadow-md"
                            }`}
                        >
                            {/* Preview Tile */}
                            <div
                                className="h-28 rounded-xl mb-3 flex items-center justify-center text-4xl relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
                                style={{ background: previewBg }}
                            >
                                <div className="z-10 drop-shadow-sm">
                                    {item.icon}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20 pointer-events-none" />
                            </div>

                            {/* Item Meta */}
                            <div className="flex flex-col gap-0.5 mb-3 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className={`font-semibold text-sm ${isDark ? "text-indigo-100" : "text-[#0c0a09]"}`}>
                                        {item.name}
                                    </h4>
                                    {isEquipped && (
                                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                            isDark
                                                ? "bg-indigo-900 text-indigo-200 border-indigo-700/50"
                                                : "bg-[#f0efed] text-[#292524] border-[#e7e5e4]"
                                        }`}>
                                            <Check size={10} strokeWidth={3} /> Active
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs ${isDark ? "text-indigo-300/80" : "text-[#78716c]"}`}>
                                    {item.desc}
                                </p>
                            </div>

                            {/* Footer & Action Pill */}
                            <div className={`pt-3 border-t flex items-center justify-between ${
                                isDark ? "border-indigo-900/60" : "border-[#f0efed]"
                            }`}>
                                {!owned ? (
                                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                                        isDark ? "text-amber-300" : "text-[#292524]"
                                    }`}>
                                        <Coins size={14} className="text-amber-500 fill-amber-500" />
                                        <span>{item.price} Coins</span>
                                    </div>
                                ) : (
                                    <span className={`text-[11px] font-medium ${isDark ? "text-indigo-300/80" : "text-[#78716c]"}`}>
                                        Unlocked
                                    </span>
                                )}

                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={!owned && coins < item.price}
                                    aria-label={`${owned ? (isEquipped ? 'Equipped' : 'Equip') : 'Buy'} ${item.name}`}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                        owned
                                            ? isEquipped
                                                ? isDark
                                                    ? "bg-indigo-900/60 text-indigo-300 cursor-default"
                                                    : "bg-[#f0efed] text-[#777169] cursor-default"
                                                : isDark
                                                    ? "bg-transparent border border-indigo-700 text-indigo-100 hover:bg-indigo-800/40"
                                                    : "bg-transparent border border-[#d6d3d1] text-[#0c0a09] hover:bg-[#f5f5f5]"
                                            : coins >= item.price
                                                ? isDark
                                                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm hover:shadow active:scale-95"
                                                    : "bg-[#292524] text-white hover:bg-[#0c0a09] shadow-sm hover:shadow active:scale-95"
                                                : isDark
                                                    ? "bg-indigo-900/40 text-indigo-400/50 cursor-not-allowed"
                                                    : "bg-[#f0efed] text-[#a8a29e] cursor-not-allowed"
                                    }`}
                                >
                                    {!owned ? (
                                        coins >= item.price ? (
                                            <>
                                                <Sparkles size={12} /> Unlock
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={12} /> Locked
                                            </>
                                        )
                                    ) : isEquipped ? (
                                        "Equipped"
                                    ) : (
                                        "Equip"
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
