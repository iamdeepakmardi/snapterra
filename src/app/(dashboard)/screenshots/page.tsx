"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Image as ImageIcon, Loader2, Trash2, X } from "lucide-react";
import {
  useScreenshotsQuery,
  useDeleteScreenshotMutation,
  useRemoveScreenshotTagMutation,
  Screenshot,
} from "@/hooks/useScreenshots";
import ImageModal from "@/components/ImageModal";
import Image from "next/image";
import { toast } from "sonner";

export default function ScreenshotsPage() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const deleteMutation = useDeleteScreenshotMutation();
  const removeTagMutation = useRemoveScreenshotTagMutation();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useScreenshotsQuery();

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
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
    toast.info("Deleting screenshot...", { id: "delete-screenshot" });
    deleteMutation.mutate(id, {
      onSuccess: () =>
        toast.success("Screenshot deleted", { id: "delete-screenshot" }),
      onError: () =>
        toast.error("Failed to delete screenshot", { id: "delete-screenshot" }),
    });
  };

  const onRemoveTag = async (screenshotId: number, tagName: string) => {
    removeTagMutation.mutate(
      { screenshotId, tagName },
      {
        onSuccess: () => toast.success(`Removed tag: ${tagName}`),
        onError: () => toast.error("Failed to remove tag"),
      }
    );
  };

  const screenshots = data?.pages.flat() || [];

  return (
    <>
      <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-4 lg:px-8 bg-white shrink-0">
        <h2 className="font-medium text-black">All Screenshots</h2>
        <div className="text-xs italic text-zinc-500 hidden sm:block">
          Showing {screenshots.length} results
        </div>
      </header>

      <section className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-zinc-200" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load screenshots.
          </div>
        ) : screenshots.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {screenshots.map((item: Screenshot) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start justify-between gap-4 px-4 lg:px-8 py-6 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                  <div
                    className="w-full sm:w-24 h-48 sm:h-16 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setPreviewImage(item.filename)}
                  >
                    <Image
                      height={16}
                      width={32}
                      src={item.filename}
                      alt={item.title}
                      className="w-full h-full object-cover rounded border border-zinc-200"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-black leading-tight wrap-break-words">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags ? (
                        item.tags.split(",").map((tag: string, idx: number) => (
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
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <div
              ref={observerTarget}
              className="h-10 flex justify-center items-center"
            >
              {isFetchingNextPage && (
                <Loader2 size={24} className="animate-spin text-zinc-300" />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
            <ImageIcon size={40} className="mb-4 text-zinc-100" />
            <p className="text-sm font-medium">Your library is empty</p>
          </div>
        )}
      </section>

      <ImageModal
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}
