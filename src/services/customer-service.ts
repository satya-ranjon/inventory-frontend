import apiClient from "../lib/api-client";
import type { CustomerFormValues } from "../lib/schemas";

// Define TypeScript interfaces for better type safety
interface CustomerResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    customer: Customer;
    orders: Order[];
  };
}

interface Customer {
  _id: string;
  customerName: string;
  contactNumber: string;
  email?: string;
  address?: string;
  customerType: "Business" | "Individual";
  due?: number;
  createdAt: string;
  updatedAt: string;
}

interface ItemData {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  [key: string]: unknown;
}

interface OrderItem {
  item: ItemData;
  quantity: number;
  rate: number;
  amount: number;
  discount?: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  salesOrderDate: string;
  [key: string]: unknown;
}

interface CustomerWithOrders {
  customer: Customer;
  orders: Order[];
}

export const customerService = {
  async getCustomers() {
    const response = await apiClient.get("/customers");
    return response.data;
  },

  async getCustomerById(id: string): Promise<CustomerWithOrders> {
    try {
      const response = await apiClient.get<CustomerResponse>(
        `/customers/${id}`
      );

      // The backend now consistently returns { data: { customer, orders } }
      const responseData = response.data.data;

      if (!responseData.customer) {
        throw new Error("Invalid response format");
      }

      return {
        customer: responseData.customer,
        orders: responseData.orders || [],
      };
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
    const response = await apiClient.patch(`/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id: string) {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};
