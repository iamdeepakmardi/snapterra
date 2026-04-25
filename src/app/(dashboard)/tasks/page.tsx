"use client";

import {
  CheckSquare,
  Square,
  Trash2,
  Loader2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Circle,
  MoreVertical,
} from "lucide-react";
import {
  useTasksQuery,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  Task,
} from "@/hooks/useTasks";
import { toast } from "sonner";

const COLUMNS = [
  { id: "todo", title: "To Do", icon: Circle, color: "text-zinc-400" },
  {
    id: "in-progress",
    title: "In Progress",
    icon: Clock,
    color: "text-blue-500",
  },
  { id: "done", title: "Completed", icon: CheckSquare, color: "text-green-500" },
] as const;

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasksQuery();
  const updateStatusMutation = useUpdateTaskStatusMutation();
  const deleteMutation = useDeleteTaskMutation();

  const updateStatus = async (id: number, status: Task["status"]) => {
    updateStatusMutation.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Moved to ${status}`),
        onError: () => toast.error("Failed to move task"),
      }
    );
  };

  const onDelete = async (id: number) => {
    toast.info("Deleting task...", { id: "delete-task" });
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Task deleted", { id: "delete-task" }),
      onError: () => toast.error("Failed to delete task", { id: "delete-task" }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-200" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-hidden w-full">
      <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-8 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-zinc-900">Task Board</h2>
          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
            {tasks.length} Total
          </span>
        </div>
      </header>

      <section className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-[900px]">
          {COLUMNS.map((column) => (
            <div
              key={column.id}
              className="flex-1 flex flex-col min-w-[300px] bg-zinc-100/50 rounded-2xl border border-zinc-200/50"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <column.icon size={16} className={column.color} />
                  <h3 className="font-bold text-sm text-zinc-700 uppercase tracking-tight">
                    {column.title}
                  </h3>
                  <span className="ml-1 text-xs text-zinc-400 font-medium">
                    {tasks.filter((t) => t.status === column.id).length}
                  </span>
                </div>
                <MoreVertical size={14} className="text-zinc-400" />
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {tasks
                  .filter((t) => t.status === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="group bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4
                          className={`text-sm font-semibold leading-snug ${
                            task.status === "done"
                              ? "text-zinc-400 line-through"
                              : "text-zinc-900"
                          }`}
                        >
                          {task.title}
                        </h4>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-zinc-500 line-clamp-3 mb-4 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-50">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                          <Clock size={12} />
                          {new Date(task.created_at).toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-1">
                          {column.id !== "todo" && (
                            <button
                              onClick={() =>
                                updateStatus(
                                  task.id,
                                  column.id === "done" ? "in-progress" : "todo"
                                )
                              }
                              className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded transition-colors"
                              title="Move back"
                            >
                              <ArrowLeft size={14} />
                            </button>
                          )}
                          {column.id !== "done" && (
                            <button
                              onClick={() =>
                                updateStatus(
                                  task.id,
                                  column.id === "todo" ? "in-progress" : "done"
                                )
                              }
                              className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded transition-colors"
                              title="Move forward"
                            >
                              <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                {tasks.filter((t) => t.status === column.id).length === 0 && (
                  <div className="h-24 border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center">
                    <p className="text-[11px] text-zinc-400 font-medium italic">
                      Empty
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
