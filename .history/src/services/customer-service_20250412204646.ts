import apiClient from "../lib/api-client";
import type { CustomerFormValues } from "../lib/schemas";

export const customerService = {
  async getCustomers() {
    const response = await apiClient.get("/customers");
    return response.data;
  },

  async getCustomerById(id: string) {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
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
