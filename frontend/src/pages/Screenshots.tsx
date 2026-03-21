import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LogOut,
  Image,
  Plus,
  Tag,
  Type,
  FileUp,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { useUploadThing } from "../utils/uploadthing";
import api from "../api/axios";
import ImageModal from "../components/ImageModal";

interface Screenshot {
  id: number;
  filename: string;
  title: string;
  tags?: string;
  created_at: string;
}

const Screenshots = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchScreenshots = async () => {
    try {
      const { data } = await api.get("/screenshots");
      setScreenshots(data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const { startUpload, isUploading } = useUploadThing("screenshotUploader", {
    onClientUploadComplete: async (res: any) => {
      // Manual save to DB because webhooks don't work on localhost
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
      fetchScreenshots();
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

  const onDelete = async (id: number) => {
    if (!confirm("Delete this screenshot?")) return;
    try {
      await api.delete(`/screenshots/${id}`);
      fetchScreenshots();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const onRemoveTag = async (screenshotId: number, tagName: string) => {
    try {
      await api.delete(`/screenshots/${screenshotId}/tags/${tagName}`);
      fetchScreenshots();
    } catch (err) {
      alert("Failed to remove tag");
    }
  };

  return (
    <div className="flex h-screen">
      {/* SideMenu */}
      <aside className="w-80 border-r flex flex-col bg-zinc-50">
        <div className="p-6 border-b border-zinc-200">
          <h1 className="text-xl font-semibold tracking-tight text-black">
            Snapterra
          </h1>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Upload Section */}
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
                  className="w-full px-3 py-2 text-sm border rounded-md"
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
                  className="w-full px-3 py-2 text-sm border rounded-md"
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-8">
          <h2 className="font-medium text-black">All Screenshots</h2>
          <div className="text-xs italic text-zinc-500">
            Showing {screenshots.length} results
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-zinc-200" />
            </div>
          ) : screenshots.length > 0 ? (
            <div className="divide-y divide-black">
              {screenshots.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-6 px-8 py-4"
                >
                  <div className="flex flex-col gap-4 flex-1">
                    <div
                      className="w-24 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setPreviewImage(item.filename)}
                    >
                      <img
                        src={item.filename}
                        alt={item.title}
                        className="w-full h-full object-cover rounded border border-zinc-200"
                      />
                    </div>

                    <div className="max-w-4xl px-2">
                      <h3 className="text-xl font-semibold text-black">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.tags ? (
                          item.tags.split(",").map((tag, idx) => (
                            <span
                              key={idx}
                              className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-3 py-1 rounded-md text-xs font-medium border border-zinc-200"
                            >
                              {tag.trim()}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveTag(item.id, tag.trim());
                                }}
                                className="p-0.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400 italic">
                            No tags
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md hover:cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <Image size={40} className="mb-4 text-zinc-100" />
              <p className="text-sm font-medium">Your library is empty</p>
            </div>
          )}
        </section>
      </main>

      <ImageModal
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default Screenshots;
