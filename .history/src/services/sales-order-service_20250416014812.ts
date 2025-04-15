import apiClient from "../lib/api-client";
import type { SalesOrderFormValues } from "../lib/schemas";

export const salesOrderService = {
  async getSalesOrders() {
    try {
      console.log("Fetching all sales orders");
      const response = await apiClient.get("/sales-orders");
      console.log("All sales orders response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching all sales orders:", error);
      throw error;
    }
  },

  async getSalesOrderById(id: string) {
    try {
      console.log(`Fetching sales order with ID: ${id}`);
      const response = await apiClient.get(`/sales-orders/${id}`);
      console.log(`Raw sales order API response for ID ${id}:`, response.data);

      // Extract the actual sales order data
      const data = response.data;

      // The API might return data in different formats
      let result;
      if (data && data.data) {
        // Format: { data: { ...salesOrder } }
        result = data.data;
      } else if (data && data.salesOrder) {
        // Format: { salesOrder: { ...salesOrder } }
        result = data.salesOrder;
      } else {
        // Format: { ...salesOrder }
        result = data;
      }

      console.log(`Processed sales order data for ID ${id}:`, result);
      return result;
    } catch (error) {
      console.error(`Error fetching sales order with ID ${id}:`, error);
      throw error;
    }
  },

  async createSalesOrder(data: SalesOrderFormValues) {
    try {
      console.log("Creating new sales order with data:", data);
      const response = await apiClient.post("/sales-orders", data);
      console.log("Create sales order response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating sales order:", error);
      throw error;
    }
  },

  async updateSalesOrder(id: string, data: SalesOrderFormValues) {
    try {
      console.log(`Updating sales order with ID ${id}:`, data);
      const response = await apiClient.patch(`/sales-orders/${id}`, data);
      console.log(`Update sales order response for ID ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating sales order with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteSalesOrder(id: string) {
    try {
      console.log(`Deleting sales order with ID ${id}`);
      const response = await apiClient.delete(`/sales-orders/${id}`);
      console.log(`Delete sales order response for ID ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting sales order with ID ${id}:`, error);
      throw error;
    }
  },
};
