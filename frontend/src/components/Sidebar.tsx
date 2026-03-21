import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { LogOut, Image, Plus, Tag, Type, FileUp, Loader2 } from "lucide-react";
import { useUploadThing } from "../utils/uploadthing";
import api from "../api/axios";

interface SidebarProps {
  onUploadSuccess: () => void;
}

const Sidebar = ({ onUploadSuccess }: SidebarProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { startUpload, isUploading } = useUploadThing("screenshotUploader", {
    onClientUploadComplete: async (res: any) => {
      if (res && res[0]) {
        try {
          await api.post("/screenshots", {
            title: title || res[0].name,
            filename: res[0].ufsUrl || res[0].url,
            tags: tags,
          });
        } catch (err) {
          console.error("Manual save failed:", err);
        }
      }
      setSelectedFile(null);
      setTitle("");
      setTags("");
      onUploadSuccess();
    },
    onUploadError: (e) => alert(e.message),
    headers: async () => ({
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }),
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name.split(".")[0]);
    }
  };

  const onSave = async () => {
    if (!selectedFile) return;
    await startUpload([selectedFile], { title, tags });
  };

  return (
    <aside className="w-80 border-r flex flex-col bg-zinc-50">
      <div className="p-6 border-b border-zinc-200">
        <h1 className="text-xl font-semibold tracking-tight text-black">
          Snapterra
        </h1>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider">
            New Screenshot
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Image size={14} /> Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-4 border-2 border-dashed rounded-lg bg-white cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <FileUp size={20} className="text-zinc-400 mb-1" />
                <span className="text-xs block truncate px-2">
                  {selectedFile ? selectedFile.name : "Click to select image"}
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

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Type size={14} /> Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag size={14} /> Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Seperate with commas..."
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <button
              onClick={onSave}
              disabled={isUploading || !selectedFile}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Save Screenshot
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 bg-zinc-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-md transition-all group"
        >
          <LogOut size={16} className="group-hover:text-black" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
