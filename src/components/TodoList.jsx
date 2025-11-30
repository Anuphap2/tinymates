import React, { useState } from "react";
import { ListTodo, Check, Trash2, Plus } from "lucide-react";

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
            { id: Date.now(), text: newTask, done: false },
        ]);
        setNewTask("");
    };

    const deleteTask = (id) =>
        setTasks((prev) => prev.filter((t) => t.id !== id));

    return (
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
}
