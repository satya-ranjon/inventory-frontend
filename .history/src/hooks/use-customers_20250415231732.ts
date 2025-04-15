"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../services/customer-service";
import type { CustomerFormValues } from "../lib/schemas";
import { useCallback } from "react";

// Custom hook for fetching a single customer
export function useCustomer(id?: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customerService.getCustomerById(id as string),
    enabled: !!id,
  });
}

export function useCustomers() {
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getCustomers(),
  });

  // Simple function that returns the customer ID (no useQuery inside)
  const getCustomerById = useCallback((id: string) => {
    return id;
  }, []);

  const createCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormValues) =>
      customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerFormValues }) =>
      customerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  return {
    customers: customersQuery.data?.data || [],
    isLoading: customersQuery.isLoading,
    error: customersQuery.error,
    getCustomerById,
    createCustomer: createCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    deleteCustomer: deleteCustomerMutation.mutate,
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending,
  };
}
