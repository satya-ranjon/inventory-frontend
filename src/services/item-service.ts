import apiClient from "../lib/api-client";
import type { ItemFormValues } from "../lib/schemas";

export const itemService = {
  async getItems() {
    const response = await apiClient.get("/items");
    return response.data; // Returns the whole response which includes meta data
  },

  async getItemById(id: string) {
    try {
      const response = await apiClient.get(`/items/${id}`);

      const data = response.data;

      if (data && data.data) {
        return data.data;
      } else {
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
    const response = await apiClient.patch(`/items/${id}`, data);
    return response.data;
  },

  async deleteItem(id: string) {
    const response = await apiClient.delete(`/items/${id}`);
    return response.data;
  },
};
