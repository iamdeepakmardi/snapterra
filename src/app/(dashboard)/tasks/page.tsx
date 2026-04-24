"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Square, Trash2, Loader2, Clock } from "lucide-react";
import api from "@/lib/axios";
import { useLayoutContext } from "../layout";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "done";
  created_at: string;
}

export default function TasksPage() {
  const { refreshTrigger } = useLayoutContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "todo" | "done">("todo");

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchTasks, 0);
    return () => clearTimeout(timeoutId);
  }, [refreshTrigger]);

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "todo" ? "done" : "todo";
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
      );
      await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
    } catch (err) {
      alert("Failed to update task");
      fetchTasks(); // Rollback
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden w-full">
      <header className="h-auto sm:h-16 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-8 py-4 sm:py-0 bg-white/80 backdrop-blur-md sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="font-semibold text-zinc-900 shrink-0">Your Tasks</h2>
          <div className="h-4 w-px bg-zinc-200 hidden xs:block" />
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg overflow-x-auto">
            {(["todo", "done", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all capitalize whitespace-nowrap ${
                  filter === f
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs font-medium text-zinc-400 hidden sm:block">
          {filteredTasks.length} tasks
        </div>
      </header>

      <section className="flex-1 overflow-y-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-zinc-200" />
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                  task.status === "done"
                    ? "bg-zinc-50/50 border-zinc-100 opacity-75"
                    : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleStatus(task)}
                  className={`mt-1 shrink-0 transition-colors ${
                    task.status === "done"
                      ? "text-green-500"
                      : "text-zinc-300 hover:text-zinc-500"
                  }`}
                >
                  {task.status === "done" ? (
                    <CheckSquare size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </button>

                <div className="flex-1 min-w-0 py-0.5">
                  <h3
                    className={`text-sm sm:text-base font-semibold leading-tight wrap-break-words ${
                      task.status === "done"
                        ? "text-zinc-500 line-through"
                        : "text-zinc-900"
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p
                      className={`mt-2 text-xs sm:text-sm leading-relaxed break-words ${
                        task.status === "done"
                          ? "text-zinc-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                      <Clock size={10} />
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-2 text-zinc-300 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <CheckSquare size={32} className="text-zinc-200" />
            </div>
            <h3 className="text-zinc-900 font-semibold">No tasks found</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-[240px]">
              {filter === "all"
                ? "Start adding tasks from the sidebar to stay organized."
                : `You don't have any ${filter} tasks right now.`}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
