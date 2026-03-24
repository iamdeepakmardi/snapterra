import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import {
  Link as LinkIcon,
  Loader2,
  Trash2,
  X,
  Globe,
  ExternalLink,
} from "lucide-react";
import api from "../api/axios";
import type { LayoutContextType } from "../components/MainLayout";

interface LinkItem {
  id: number;
  url: string;
  title: string;
  tags?: string;
  created_at: string;
}

const Links = () => {
  const { refreshTrigger } = useOutletContext<LayoutContextType>();
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
  }, [refreshTrigger]);

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
    <>
      <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-4 lg:px-8 bg-white shrink-0">
        <h2 className="font-medium text-black">All Links</h2>
        <div className="text-xs italic text-zinc-500 hidden sm:block">
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
                className="flex flex-col sm:flex-row items-start justify-between gap-4 px-4 lg:px-8 py-6 hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex flex-col gap-2 flex-1 w-full min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500 shrink-0">
                      <Globe size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-black leading-tight wrap-break-words">
                          {item.title || "Untitled Link"}
                        </h3>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-black transition-colors shrink-0"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <p className="text-sm text-zinc-500 break-all mt-1">
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
                      <span className="text-xs text-zinc-400 italic">
                        No tags
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-red-500 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 hover:bg-red-50 rounded-md transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
            <LinkIcon size={40} className="mb-4 text-zinc-100" />
            <p className="text-sm font-medium">No links saved yet</p>
          </div>
        )}
      </section>
    </>
  );
};

export default Links;
