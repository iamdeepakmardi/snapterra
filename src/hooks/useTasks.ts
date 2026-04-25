import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  created_at: string;
}

/**
 * FETCH TASKS: Simple data retrieval
 * Uses useQuery to fetch and cache the tasks list.
 */
export const useTasksQuery = () => {
  return useQuery<Task[]>({
    queryKey: ["tasks"], // Unique cache key
    queryFn: async () => {
      const { data } = await api.get("/tasks");
      return data;
    },
  });
};

/**
 * CREATE TASK: Add new data
 * Uses useMutation to post a new task and refresh the cache.
 */
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTask: { title: string; description: string }) => {
      const { data } = await api.post("/tasks", newTask);
      return data;
    },
    onSuccess: () => {
      // Refresh the 'tasks' list to show the new entry
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

/**
 * UPDATE TASK STATUS: With Optimistic Updates
 * This makes the UI feel instant by updating the cache BEFORE the server responds.
 */
export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "todo" | "in-progress" | "done";
    }) => {
      const { data } = await api.patch(`/tasks/${id}/status`, { status });
      return data;
    },
    // Step 1: When mutate() is called
    onMutate: async (updatedTask) => {
      // Cancel background refetches so they don't overwrite us
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the current cache (for rollback)
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      // Manually update the cache to show the new status immediately
      queryClient.setQueryData<Task[]>(["tasks"], (old) => {
        return old?.map((t) =>
          t.id === updatedTask.id ? { ...t, status: updatedTask.status } : t,
        );
      });

      return { previousTasks };
    },
    // Step 2: If the server request fails
    onError: (err, updatedTask, context) => {
      // Revert to the snapshot we took in onMutate
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    // Step 3: Once finished (error or success)
    onSettled: () => {
      // Refetch from server to ensure we are perfectly in sync
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

/**
 * DELETE TASK: Remove data
 */
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      // Refresh the list after deletion
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
