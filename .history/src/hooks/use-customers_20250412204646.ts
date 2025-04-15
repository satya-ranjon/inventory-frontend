"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../services/customer-service";
import type { CustomerFormValues } from "../lib/schemas";
import { useCallback } from "react";

export function useCustomers() {
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getCustomers(),
  });

  const getCustomerById = useCallback((id: string) => {
    return {
      query: useQuery({
        queryKey: ["customers", id],
        queryFn: () => customerService.getCustomerById(id),
        enabled: !!id,
      }),
    };
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
