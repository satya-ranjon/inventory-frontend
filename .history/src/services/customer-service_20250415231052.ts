import apiClient from "../lib/api-client";
import type { CustomerFormValues } from "../lib/schemas";

export const customerService = {
  async getCustomers() {
    const response = await apiClient.get("/customers");
    return response.data;
  },

  async getCustomerById(id: string) {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      console.log("Raw API response:", response);

      // Extract the actual customer data
      const data = response.data;

      // The API might return data in different formats
      if (data && data.data) {
        // Format: { data: { ...customer } }
        return data.data;
      } else if (data && data.customer) {
        // Format: { customer: { ...customer } }
        return data.customer;
      } else {
        // Format: { ...customer }
        return data;
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  },

  async createCustomer(data: CustomerFormValues) {
    const response = await apiClient.post("/customers", data);
    return response.data;
  },

  async updateCustomer(id: string, data: CustomerFormValues) {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id: string) {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};
