import { useState, useEffect } from "react";
import { Link as LinkIcon, Loader2, Trash2, X, Globe, ExternalLink } from "lucide-react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

interface LinkItem {
  id: number;
  url: string;
  title: string;
  tags?: string;
  created_at: string;
}

const Links = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const { data } = await api.get("/links");
      setLinks(data);
    } catch (err) {
      console.error("Failed to fetch links:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm("Delete this link?")) return;
    try {
      await api.delete(`/links/${id}`);
      fetchLinks();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const onRemoveTag = async (linkId: number, tagName: string) => {
    try {
      await api.delete(`/links/${linkId}/tags/${tagName}`);
      fetchLinks();
    } catch (err) {
      alert("Failed to remove tag");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar onSuccess={fetchLinks} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-8">
          <h2 className="font-medium text-black">All Links</h2>
          <div className="text-xs italic text-zinc-500">
            Showing {links.length} saved URLs
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-zinc-200" />
            </div>
          ) : links.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {links.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-6 px-8 py-4 hover:bg-zinc-50 transition-colors group"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500">
                        <Globe size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-black leading-tight">
                            {item.title || "Untitled Link"}
                          </h3>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-black transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <p className="text-sm text-zinc-500 truncate max-w-2xl mt-0.5">
                          {item.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.tags ? (
                        item.tags.split(",").map((tag, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-3 py-1 rounded-md text-xs font-medium border border-zinc-200"
                          >
                            {tag.trim()}
                            <button
                              onClick={() => onRemoveTag(item.id, tag.trim())}
                              className="p-0.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-400 italic">No tags</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-md transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <LinkIcon size={40} className="mb-4 text-zinc-100" />
              <p className="text-sm font-medium">No links saved yet</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Links;
