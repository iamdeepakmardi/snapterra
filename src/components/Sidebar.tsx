"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Image,
  Plus,
  Tag,
  Type,
  FileUp,
  Loader2,
  Globe,
  LayoutGrid,
  Link as LinkIcon,
  CheckSquare,
  FileText,
  X,
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import api from "@/lib/axios";
import { useCreateTaskMutation } from "@/hooks/useTasks";
import { useQueryClient } from "@tanstack/react-query";
import { useUserQuery, useLogoutMutation } from "@/hooks/useUser";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState as useReactState } from "react";

interface SidebarProps {
  onSuccess: () => void;
  onClose?: () => void;
}

const Sidebar = ({ onSuccess, onClose }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useReactState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createTaskMutation = useCreateTaskMutation();
  const queryClient = useQueryClient();
  const { data: user } = useUserQuery();
  const logoutMutation = useLogoutMutation();

  const [activeTab, setActiveTab] = useState<"screenshot" | "link" | "task">(
    "screenshot",
  );
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { startUpload, isUploading } = useUploadThing("screenshotUploader", {
    onClientUploadComplete: async () => {
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["screenshots"] });
      toast.success("Screenshot saved successfully");
      onSuccess();
    },
    onUploadError: (e) => toast.error(`Upload failed: ${e.message}`),
  });

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setTags("");
    setUrl("");
    setDescription("");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name.split(".")[0]);
    }
  };

  const onSave = async () => {
    if (activeTab === "screenshot") {
      if (!selectedFile) return;
      await startUpload([selectedFile], { title, tags });
    } else if (activeTab === "link") {
      if (!url) return;
      setIsSaving(true);
      try {
        await api.post("/links", { title, url, tags });
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["links"] });
        toast.success("Link saved successfully");
        onSuccess();
      } catch (err) {
        toast.error("Failed to save link");
      } finally {
        setIsSaving(false);
      }
    } else {
      if (!title) return;
      createTaskMutation.mutate(
        { title, description },
        {
          onSuccess: () => {
            resetForm();
            toast.success("Task created successfully");
            onSuccess();
          },
          onError: () => {
            toast.error("Failed to save task");
          },
        },
      );
    }
  };

  return (
    <aside className="w-80 h-full border-r flex flex-col bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 max-w-[85vw]">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-black dark:text-white flex items-center gap-2">
          <LayoutGrid size={24} />
          Snapterra
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-zinc-500 hover:text-black dark:hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <Link
            href="/screenshots"
            onClick={() => onClose?.()}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === "/screenshots"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
            }`}
          >
            <Image size={18} />
            Screenshots
          </Link>
          <Link
            href="/links"
            onClick={() => onClose?.()}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === "/links"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
            }`}
          >
            <LinkIcon size={18} />
            Links
          </Link>
          <Link
            href="/tasks"
            onClick={() => onClose?.()}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === "/tasks"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
            }`}
          >
            <CheckSquare size={18} />
            Tasks
          </Link>
        </nav>

        <div className="p-6 space-y-8 overflow-y-auto border-t">
          <div className="space-y-4">
            <div className="flex p-1 bg-zinc-200 dark:bg-zinc-900 rounded-lg">
              <button
                onClick={() => setActiveTab("screenshot")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "screenshot"
                    ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Image size={14} />
                Screenshot
              </button>
              <button
                onClick={() => setActiveTab("link")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "link"
                    ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <LinkIcon size={14} />
                Link
              </button>
              <button
                onClick={() => setActiveTab("task")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "task"
                    ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <CheckSquare size={14} />
                Task
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === "screenshot" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2 dark:text-zinc-300">
                    <FileUp size={14} /> Image File
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-4 border-2 border-dashed rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <FileUp size={20} className="text-zinc-400 mb-1 mx-auto" />
                    <span className="text-xs block text-center truncate px-2 text-zinc-500 dark:text-zinc-400">
                      {selectedFile ? selectedFile.name : "Select an image"}
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>
              )}

              {activeTab === "link" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2 dark:text-zinc-300">
                    <Globe size={14} /> Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-sm border dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>
              )}

              {activeTab === "task" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2 dark:text-zinc-300">
                    <FileText size={14} /> Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task details..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none bg-white dark:bg-zinc-900 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2 dark:text-zinc-300">
                  <Type size={14} /> Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    activeTab === "task" ? "Task title..." : "Enter title..."
                  }
                  className="w-full px-3 py-2 text-sm border dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              {activeTab !== "task" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2 dark:text-zinc-300">
                    <Tag size={14} /> Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="coding, design, news..."
                    className="w-full px-3 py-2 text-sm border dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>
              )}

              <button
                onClick={onSave}
                disabled={
                  isUploading ||
                  isSaving ||
                  (activeTab === "screenshot"
                    ? !selectedFile
                    : activeTab === "link"
                      ? !url
                      : !title)
                }
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-black text-white dark:bg-white dark:text-black text-sm font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading || isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {activeTab === "screenshot"
                  ? "Save Screenshot"
                  : activeTab === "link"
                    ? "Save Link"
                    : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
        {mounted && (
          <div className="flex p-1 bg-zinc-200 dark:bg-zinc-900 rounded-lg mb-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                theme === "light"
                  ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
              title="Light Mode"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                theme === "dark"
                  ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
              title="Dark Mode"
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                theme === "system"
                  ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
              title="System Default"
            >
              <Monitor size={14} />
            </button>
          </div>
        )}

        {user && (
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
              Signed in as
            </p>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-all group disabled:opacity-50"
        >
          {logoutMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut
              size={16}
              className="group-hover:text-black dark:group-hover:text-white"
            />
          )}
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
