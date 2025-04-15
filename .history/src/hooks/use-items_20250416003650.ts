"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itemService } from "../services/item-service";
import type { ItemFormValues } from "../lib/schemas";

export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: ["items", id],
    queryFn: () => (id ? itemService.getItemById(id) : null),
    enabled: !!id,
  });
}

export function useItems() {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => itemService.getItems(),
  });

  const createItemMutation = useMutation({
    mutationFn: (data: ItemFormValues) => itemService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemFormValues }) =>
      itemService.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => itemService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  return {
    items: itemsQuery.data?.data || [],
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
  };
}
