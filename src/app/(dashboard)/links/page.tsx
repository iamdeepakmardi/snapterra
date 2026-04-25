"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Link as LinkIcon,
  Loader2,
  Trash2,
  X,
  Globe,
  ExternalLink,
} from "lucide-react";
import {
  useLinksQuery,
  useDeleteLinkMutation,
  useRemoveLinkTagMutation,
  LinkItem,
} from "@/hooks/useLinks";
import { toast } from "sonner";

export default function LinksPage() {
  const observerTarget = useRef<HTMLDivElement>(null);
  const deleteMutation = useDeleteLinkMutation();
  const removeTagMutation = useRemoveLinkTagMutation();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLinksQuery();

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);

  const onDelete = async (id: number) => {
    toast.info("Deleting link...", { id: "delete-link" });
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Link deleted", { id: "delete-link" }),
      onError: () => toast.error("Failed to delete link", { id: "delete-link" }),
    });
  };

  const onRemoveTag = async (linkId: number, tagName: string) => {
    removeTagMutation.mutate(
      { linkId, tagName },
      {
        onSuccess: () => toast.success(`Removed tag: ${tagName}`),
        onError: () => toast.error("Failed to remove tag"),
      }
    );
  };

  const links = data?.pages.flat() || [];

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
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load links.
          </div>
        ) : links.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {links.map((item: LinkItem) => (
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
                      item.tags.split(",").map((tag: string, idx: number) => (
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

            <div ref={observerTarget} className="h-10 flex justify-center items-center">
              {isFetchingNextPage && (
                <Loader2 size={24} className="animate-spin text-zinc-300" />
              )}
            </div>
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
}
