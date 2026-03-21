import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router";
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
} from "lucide-react";
import { useUploadThing } from "../utils/uploadthing";
import api from "../api/axios";

interface SidebarProps {
  onSuccess: () => void;
}

const Sidebar = ({ onSuccess }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"screenshot" | "link">("screenshot");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSavingLink, setIsSavingLink] = useState(false);

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
      resetForm();
      onSuccess();
    },
    onUploadError: (e) => alert(e.message),
    headers: async () => ({
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }),
  });

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setTags("");
    setUrl("");
  };

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
    if (activeTab === "screenshot") {
      if (!selectedFile) return;
      await startUpload([selectedFile], { title, tags });
    } else {
      if (!url) return;
      setIsSavingLink(true);
      try {
        await api.post("/links", { title, url, tags });
        resetForm();
        onSuccess();
      } catch (err) {
        alert("Failed to save link");
      } finally {
        setIsSavingLink(false);
      }
    }
  };

  return (
    <aside className="w-80 border-r flex flex-col bg-zinc-50">
      <div className="p-6 border-b border-zinc-200">
        <h1 className="text-xl font-semibold tracking-tight text-black flex items-center gap-2">
          <LayoutGrid size={24} />
          Snapterra
        </h1>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <Link
            to="/screenshots"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === "/screenshots"
                ? "bg-black text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
            }`}
          >
            <Image size={18} />
            Screenshots
          </Link>
          <Link
            to="/links"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === "/links"
                ? "bg-black text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
            }`}
          >
            <LinkIcon size={18} />
            Links
          </Link>
        </nav>

        <div className="p-6 space-y-8 overflow-y-auto border-t">
          {/* New Item Section */}
          <div className="space-y-4">
            <div className="flex p-1 bg-zinc-200 rounded-lg">
              <button
                onClick={() => setActiveTab("screenshot")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "screenshot"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <Image size={14} />
                Screenshot
              </button>
              <button
                onClick={() => setActiveTab("link")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "link"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <LinkIcon size={14} />
                Link
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === "screenshot" ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileUp size={14} /> Image File
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-4 border-2 border-dashed rounded-lg bg-white cursor-pointer hover:bg-zinc-50 transition-colors"
                  >
                    <FileUp size={20} className="text-zinc-400 mb-1 mx-auto" />
                    <span className="text-xs block text-center truncate px-2 text-zinc-500">
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
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe size={14} /> Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              )}

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
                  placeholder="coding, design, news..."
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <button
                onClick={onSave}
                disabled={isUploading || isSavingLink || (activeTab === "screenshot" ? !selectedFile : !url)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading || isSavingLink ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {activeTab === "screenshot" ? "Save Screenshot" : "Save Link"}
              </button>
            </div>
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

