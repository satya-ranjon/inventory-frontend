"use client";

import { useState, useEffect, useCallback } from "react";
import { itemService } from "../services/item-service";
import type { ItemFormValues } from "../lib/schemas";

export function useItem(id: string | undefined) {
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchItem() {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await itemService.getItemById(id);
        setItem(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching item:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  return { data: item, isLoading, error };
}

export function useItems() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // State for mutation operations
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await itemService.getItems();
      setItems(response.data || []);
      setMeta(response.meta);
      setError(null);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Create item
  const createItem = async (
    data: ItemFormValues,
    options?: { onSuccess?: Function }
  ) => {
    setIsCreating(true);
    try {
      const response = await itemService.createItem(data);
      await fetchItems(); // Refresh items list
      if (options?.onSuccess) {
        options.onSuccess(response);
      }
      return response;
    } catch (err) {
      console.error("Error creating item:", err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Update item
  const updateItem = async (
    params: { id: string; data: ItemFormValues },
    options?: { onSuccess?: Function }
  ) => {
    setIsUpdating(true);
    try {
      const response = await itemService.updateItem(params.id, params.data);
      await fetchItems(); // Refresh items list
      if (options?.onSuccess) {
        options.onSuccess(response);
      }
      return response;
    } catch (err) {
      console.error("Error updating item:", err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete item
  const deleteItem = async (id: string, options?: { onSuccess?: Function }) => {
    setIsDeleting(true);
    try {
      const response = await itemService.deleteItem(id);
      await fetchItems(); // Refresh items list
      if (options?.onSuccess) {
        options.onSuccess(response);
      }
      return response;
    } catch (err) {
      console.error("Error deleting item:", err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    items,
    meta,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    isCreating,
    isUpdating,
    isDeleting,
    refresh: fetchItems,
  };
}
