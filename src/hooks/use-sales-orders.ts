import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesOrderService } from "../services/sales-order-service";
import type { SalesOrderFormValues } from "../lib/schemas";

export function useSalesOrders(id?: string) {
  const queryClient = useQueryClient();

  const salesOrdersQuery = useQuery({
    queryKey: ["salesOrders"],
    queryFn: () => salesOrderService.getSalesOrders(),
  });

  const salesOrderByIdQuery = useQuery({
    queryKey: ["salesOrders", id],
    queryFn: () => salesOrderService.getSalesOrderById(id!),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const createSalesOrderMutation = useMutation({
    mutationFn: (data: SalesOrderFormValues) =>
      salesOrderService.createSalesOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
    },
  });

  const updateSalesOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SalesOrderFormValues }) =>
      salesOrderService.updateSalesOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
    },
  });

  const deleteSalesOrderMutation = useMutation({
    mutationFn: (id: string) => salesOrderService.deleteSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
    },
  });

  return {
    salesOrders: salesOrdersQuery.data?.data || [],
    isLoading: salesOrdersQuery.isLoading,
    error: salesOrdersQuery.error,
    salesOrder: salesOrderByIdQuery.data,
    isSalesOrderLoading: salesOrderByIdQuery.isLoading,
    salesOrderError: salesOrderByIdQuery.error,
    refetchSalesOrder: salesOrderByIdQuery.refetch,
    createSalesOrder: createSalesOrderMutation.mutate,
    updateSalesOrder: updateSalesOrderMutation.mutate,
    deleteSalesOrder: deleteSalesOrderMutation.mutate,
    isCreating: createSalesOrderMutation.isPending,
    isUpdating: updateSalesOrderMutation.isPending,
    isDeleting: deleteSalesOrderMutation.isPending,
  };
}
