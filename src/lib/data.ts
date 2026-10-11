import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRow = any;

/** Generic table read; RLS scopes rows to what the signed-in role may see. */
export function useRows(table: string, select = "*", order = "created_at") {
  return useQuery({
    queryKey: [table, select],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from(table as any) as any).select(select).order(order, { ascending: false }).limit(500);
      if (error) throw error;
      return (data ?? []) as AnyRow[];
    },
  });
}

export function useSave(table: string, okMsg = "✓") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: AnyRow }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q = supabase.from(table as any) as any;
      const { data, error } = id ? await q.update(values).eq("id", id).select().single() : await q.insert(values).select().single();
      if (error) throw error;
      return data as AnyRow;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success(okMsg);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const money = (n: number | string, cur: string) => `${Number(n || 0).toLocaleString("fr-FR")} ${cur}`;
export const today = () => new Date().toISOString().slice(0, 10);
