import apiClient from "../lib/api-client";
import type { SalesOrderFormValues } from "../lib/schemas";

export const salesOrderService = {
  async getSalesOrders() {
    const response = await apiClient.get("/sales-orders");
    return response.data;
  },

  async getSalesOrderById(id: string) {
    const response = await apiClient.get(`/sales-orders/${id}`);
    return response.data;
  },

  async createSalesOrder(data: SalesOrderFormValues) {
    const response = await apiClient.post("/sales-orders", data);
    return response.data;
  },

  async updateSalesOrder(id: string, data: SalesOrderFormValues) {
    const response = await apiClient.patch(`/sales-orders/${id}`, data);
    return response.data;
  },

  async deleteSalesOrder(id: string) {
    const response = await apiClient.delete(`/sales-orders/${id}`);
    return response.data;
  },
};
