import apiClient from "../lib/api-client";
import type { ItemFormValues } from "../lib/schemas";

export const itemService = {
  async getItems() {
    const response = await apiClient.get("/items");
    return response.data;
  },

  async getItemById(id: string) {
    const response = await apiClient.get(`/items/${id}`);
    return response.data;
  },

  async createItem(data: ItemFormValues) {
    const response = await apiClient.post("/items", data);
    return response.data;
  },

  async updateItem(id: string, data: ItemFormValues) {
    const response = await apiClient.put(`/items/${id}`, data);
    return response.data;
  },

  async deleteItem(id: string) {
    const response = await apiClient.delete(`/items/${id}`);
    return response.data;
  },
};
