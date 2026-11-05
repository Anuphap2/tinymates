import React, { useState } from "react";
import { Check, Trash2, Plus, Sparkles } from "lucide-react";

export function TodoList({ tasks, setTasks, isDark }) {
    const [newTask, setNewTask] = useState("");

    const toggleTask = (id) =>
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
        );

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks((prev) => [
            ...prev,
            { id: Date.now(), text: newTask.trim(), done: false },
        ]);
        setNewTask("");
    };

    const deleteTask = (id) =>
        setTasks((prev) => prev.filter((t) => t.id !== id));

    const completedCount = tasks.filter((t) => t.done).length;

    return (
        <div className="flex flex-col h-full">
            {/* Header sub-indicator */}
            <div className={`flex items-center justify-between pb-2 mb-2 border-b text-xs ${
                isDark ? "border-indigo-900/60 text-indigo-300" : "border-[#e7e5e4]/80 text-[#777169]"
            }`}>
                <span className="font-medium">Focus Checklist</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] tracking-wide ${
                    isDark ? "bg-indigo-900 text-indigo-200" : "bg-[#f0efed] text-[#292524]"
                }`}>
                    {completedCount} / {tasks.length} done
                </span>
            </div>

            {/* Task Items */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[260px] custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className={`text-xs text-center py-6 flex flex-col items-center gap-1.5 ${
                        isDark ? "text-indigo-300/60" : "text-[#78716c]"
                    }`}>
                        <Sparkles size={16} className="opacity-40" />
                        <span>เพิ่มสิ่งที่ต้องการโฟกัสวันนี้...</span>
                    </div>
                ) : (
                    tasks.map((t) => (
                        <div
                            key={t.id}
                            className={`flex items-center gap-2.5 p-2 rounded-xl transition-all duration-200 group border ${
                                t.done
                                    ? "bg-transparent border-transparent opacity-60"
                                    : isDark
                                        ? "bg-indigo-900/40 border-indigo-800/40 hover:bg-indigo-900/60 hover:border-indigo-700/60 shadow-xs"
                                        : "bg-white/80 border-[#e7e5e4] hover:border-[#d6d3d1] hover:bg-white shadow-xs"
                            }`}
                        >
                            <button
                                onClick={() => toggleTask(t.id)}
                                aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                    t.done
                                        ? isDark
                                            ? "bg-indigo-500 border-indigo-500 text-white"
                                            : "bg-[#292524] border-[#292524] text-white"
                                        : isDark
                                            ? "border-indigo-700 bg-indigo-950 hover:border-indigo-400"
                                            : "border-[#d6d3d1] bg-white hover:border-[#292524]"
                                }`}
                            >
                                {t.done && <Check size={10} strokeWidth={3} />}
                            </button>
                            <span
                                className={`flex-1 text-xs md:text-sm truncate transition-all ${
                                    t.done
                                        ? isDark
                                            ? "line-through text-indigo-400/60"
                                            : "line-through text-[#78716c]"
                                        : isDark
                                            ? "text-indigo-100 font-medium"
                                            : "text-[#0c0a09] font-medium"
                                }`}
                            >
                                {t.text}
                            </span>
                            <button
                                onClick={() => deleteTask(t.id)}
                                aria-label="Delete task"
                                className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-150 ${
                                    isDark ? "text-indigo-400 hover:text-rose-400" : "text-[#78716c] hover:text-[#dc2626]"
                                }`}
                                title="Delete task"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add Task Input */}
            <div className={`flex gap-1.5 mt-3 pt-2.5 border-t ${
                isDark ? "border-indigo-900/60" : "border-[#e7e5e4]/80"
            }`}>
                <input
                    className={`flex-1 text-xs md:text-sm rounded-full px-3.5 py-2 outline-none transition-all ${
                        isDark
                            ? "bg-indigo-900/50 border border-indigo-800/60 text-indigo-100 placeholder-indigo-400/40 focus:border-indigo-400 focus:bg-indigo-900/80"
                            : "bg-white border border-[#e7e5e4] text-[#0c0a09] placeholder-[#78716c] focus:border-[#292524]"
                    }`}
                    placeholder="เพิ่มงานใหม่..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                />
                <button
                    onClick={addTask}
                    disabled={!newTask.trim()}
                    aria-label="Add new task"
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 ${
                        isDark
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-[#292524] hover:bg-[#0c0a09] text-white"
                    }`}
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}
