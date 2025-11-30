import React from "react";
import { PawPrint, Home, Music } from "lucide-react";
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
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex px-6 pt-4 gap-2">
                {["pet", "room", "sound"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setShopTab(tab)}
                        className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shopTab === tab
                            ? "bg-indigo-500 text-white shadow-md"
                            : isDark ? "bg-white/10 text-indigo-200 hover:bg-white/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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

            <div className={`p-6 overflow-y-auto grid grid-cols-2 gap-4 flex-1 ${isDark ? "bg-indigo-950/50" : "bg-slate-50/50"}`}>
                {SHOP_ITEMS.filter((i) => i.category === shopTab).map((item) => {
                    const owned = inventory.includes(item.id);
                    let isEquipped = false;
                    if (item.category === "pet")
                        isEquipped = equippedPets.includes(item.id);
                    if (item.category === "room") isEquipped = activeTheme === item.id;

                    // Preview Background
                    const previewBg =
                        item.category === "pet" ? item.color : item.bgTop || "#eee";
                    // Dashed border for unowned, Solid + Color for owned
                    const borderClass = owned
                        ? isEquipped
                            ? "border-indigo-500 ring-4 ring-indigo-100 bg-indigo-50/50"
                            : "border-transparent hover:border-indigo-200 hover:shadow-md"
                        : "border-dashed border-slate-300 opacity-90";

                    return (
                        <div
                            key={item.id}
                            className={`relative flex flex-col p-3 rounded-[24px] border-2 transition-all group ${borderClass} ${isDark ? "bg-indigo-900/50 border-indigo-500/30" : "bg-white"}`}
                        >
                            {/* Preview Box */}
                            <div
                                className="h-24 rounded-2xl mb-3 flex items-center justify-center text-4xl shadow-inner relative overflow-hidden"
                                style={{ background: previewBg }}
                            >
                                <div className="z-10 transform group-hover:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </div>
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className={`font-bold text-sm leading-tight ${isDark ? "text-indigo-100" : "text-slate-700"}`}>
                                    {item.name}
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                                    {item.desc}
                                </div>
                            </div>

                            <div className={`mt-3 pt-3 border-t flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-100"}`}>
                                {!owned ? (
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs">
                                        <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center">
                                            $
                                        </div>
                                        {item.price}
                                    </div>
                                ) : (
                                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                                        OWNED
                                    </div>
                                )}

                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={!owned && coins < item.price}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${owned
                                        ? isEquipped
                                            ? "bg-indigo-100 text-indigo-500 cursor-default"
                                            : "bg-white border border-indigo-200 text-indigo-500 hover:bg-indigo-50"
                                        : coins >= item.price
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
                })}
            </div>
        </div>
    );
}
