"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";
import { createContext, useContext } from "react";

const LayoutContext = createContext({ refreshTrigger: 0 });

export const useLayoutContext = () => useContext(LayoutContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    };

    const timeoutId = setTimeout(checkAuth, 0);
    return () => clearTimeout(timeoutId);
  }, [router]);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <LayoutContext.Provider value={{ refreshTrigger }}>
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out lg:block shrink-0 h-full`}
        >
          <Sidebar
            onSuccess={handleSuccess}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="lg:hidden h-16 border-b border-zinc-200 flex items-center justify-between px-4 bg-zinc-50 shrink-0">
            <h1 className="text-xl font-semibold tracking-tight text-black flex items-center gap-2">
              Snapterra
            </h1>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-zinc-600 hover:text-black"
            >
              <Menu size={24} />
            </button>
          </header>

          <section className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </section>
        </main>
      </div>
    </LayoutContext.Provider>
  );
}
