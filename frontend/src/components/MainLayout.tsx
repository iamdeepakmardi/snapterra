import { useState } from "react";
import { Navigate, Outlet } from "react-router";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

const MainLayout = () => {
  const token = localStorage.getItem("token");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Close sidebar on success (for mobile)
    setIsSidebarOpen(false);
  };

  return (
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
        } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out lg:block shrink-0`}
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
          <Outlet context={{ refreshTrigger }} />
        </section>
      </main>
    </div>
  );
};

export default MainLayout;

export interface LayoutContextType {
  refreshTrigger: number;
}
