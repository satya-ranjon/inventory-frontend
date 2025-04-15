"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itemService } from "../services/item-service";
import type { ItemFormValues } from "../lib/schemas";
import { useCallback } from "react";

export function useItems() {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => itemService.getItems(),
  });

  const getItemById = useCallback((id: string) => {
    return {
      ...useQuery({
        queryKey: ["items", id],
        queryFn: () => itemService.getItemById(id),
        enabled: !!id,
      }),
    };
  }, []);

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
    getItemById,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
  };
}
