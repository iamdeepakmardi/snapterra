"use client";

import { useUserQuery } from "@/hooks/useUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { 
  BarChart3, 
  Database, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Settings2,
  ExternalLink,
  History,
  ShieldCheck,
  Loader2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DashboardHome() {
  const { data: user } = useUserQuery();
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/stats");
      return data;
    }
  });

  const handlePortalRedirect = async () => {
    try {
      const { data } = await api.get("/billing/portal");
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      toast.error("Could not load billing portal");
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose Pro features at the end of your billing cycle.")) {
      return;
    }

    try {
      await api.post("/billing/cancel");
      toast.success("Subscription cancellation requested. It may take a few moments to update.");
      // Invalidate user query to update UI (though it might take a webhook to fully update)
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (err) {
      toast.error("Failed to cancel subscription. Please try again or contact support.");
    }
  };

  const storageLimit = user?.is_pro ? 10 * 1024 * 1024 * 1024 : 100 * 1024 * 1024; // 10GB Pro, 100MB Free
  const storageUsed = parseInt(user?.storage_used || "0");
  const storagePercent = Math.min(Math.round((storageUsed / storageLimit) * 100), 100);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const todoTasks = stats?.tasks?.find((t: { status: string; count: string }) => t.status === 'todo')?.count || 0;
  const inProgressTasks = stats?.tasks?.find((t: { status: string; count: string }) => t.status === 'in-progress')?.count || 0;

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Mission Control
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.is_pro ? (
              <button 
                onClick={handleCancelSubscription}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors shadow-sm"
              >
                <XCircle size={16} />
                Cancel Subscription
              </button>
            ) : (
              <button 
                onClick={handlePortalRedirect}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
              >
                <Settings2 size={16} />
                Billing Portal
              </button>
            )}
            {!user?.is_pro && (
              <Link
                href="/upgrade"
                className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-zinc-200 dark:shadow-none"
              >
                <ArrowUpRight size={16} />
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <LinkIcon size={20} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-[10px]">Links Saved</h3>
            </div>
            <p className="text-4xl font-black text-zinc-900 dark:text-white">{stats?.linksCount || 0}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                <ImageIcon size={20} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-[10px]">Screenshots</h3>
            </div>
            <p className="text-4xl font-black text-zinc-900 dark:text-white">{stats?.screenshotsCount || 0}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-[10px]">Active Tasks</h3>
            </div>
            <p className="text-4xl font-black text-zinc-900 dark:text-white">{parseInt(todoTasks) + parseInt(inProgressTasks)}</p>
          </div>
        </div>

        {/* Storage & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Storage Tracking */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-zinc-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Storage Overview</h2>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{storagePercent}% used</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatSize(storageUsed)} of {formatSize(storageLimit)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.is_pro ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                  {user?.is_pro ? 'Pro Account' : 'Free Plan'}
                </div>
              </div>

              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${storagePercent > 90 ? 'bg-red-500' : 'bg-black dark:bg-white'}`}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <ShieldCheck size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {user?.is_pro 
                    ? "You have 10GB of storage. Uploaded screenshots are optimized for performance automatically."
                    : "You are on the free plan with a 100MB limit. Upgrade to Pro for 10GB and priority processing."}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <History size={18} className="text-zinc-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Activity</h2>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {stats?.activity?.map((item: { type: string; title: string; created_at: string }, i: number) => (
                <div key={i} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`p-2 rounded-xl shrink-0 ${item.type === 'link' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'}`}>
                      {item.type === 'link' ? <LinkIcon size={14} /> : <ImageIcon size={14} />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{item.title || 'Untitled'}</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-tighter flex items-center gap-1.5 mt-0.5">
                        <Clock size={10} />
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={item.type === 'link' ? '/links' : '/screenshots'}
                    className="p-2 text-zinc-300 group-hover:text-black dark:group-hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              ))}
              {(!stats?.activity || stats.activity.length === 0) && !isLoading && (
                <div className="p-10 text-center text-zinc-400 italic text-sm">
                  No recent activity found.
                </div>
              )}
              {isLoading && (
                <div className="p-10 flex justify-center">
                  <Loader2 className="animate-spin text-zinc-200" />
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
