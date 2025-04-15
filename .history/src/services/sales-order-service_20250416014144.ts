import apiClient from "../lib/api-client";
import type { SalesOrderFormValues } from "../lib/schemas";

export const salesOrderService = {
  async getSalesOrders() {
    const response = await apiClient.get("/sales-orders");
    return response.data;
  },

  async getSalesOrderById(id: string) {
    try {
      const response = await apiClient.get(`/sales-orders/${id}`);
      console.log("Raw sales order API response:", response);

      // Extract the actual sales order data
      const data = response.data;

      // The API might return data in different formats
      if (data && data.data) {
        // Format: { data: { ...salesOrder } }
        return data.data;
      } else if (data && data.salesOrder) {
        // Format: { salesOrder: { ...salesOrder } }
        return data.salesOrder;
      } else {
        // Format: { ...salesOrder }
        return data;
      }
    } catch (error) {
      console.error("Error fetching sales order:", error);
      throw error;
    }
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
