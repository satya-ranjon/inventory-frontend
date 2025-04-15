import apiClient from "../lib/api-client";
import type { ItemFormValues } from "../lib/schemas";

export const itemService = {
  async getItems() {
    const response = await apiClient.get("/items");
    return response.data;
  },

  async getItemById(id: string) {
    try {
      const response = await apiClient.get(`/items/${id}`);
      console.log("Raw API response:", response);

      // Extract the actual item data
      const data = response.data;

      // The API might return data in different formats
      if (data && data.data) {
        // Format: { data: { ...item } }
        return data.data;
      } else if (data && data.item) {
        // Format: { item: { ...item } }
        return data.item;
      } else {
        // Format: { ...item }
        return data;
      }
    } catch (error) {
      console.error("Error fetching item:", error);
      throw error;
    }
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
