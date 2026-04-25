import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface User {
  id: number;
  email: string;
  is_pro: boolean;
  storage_used: string; // BIGINT comes as string from pg
  subscription_id?: string;
}

export const useUserQuery = () => {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      window.location.href = "/login";
    },
  });
};
