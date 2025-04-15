import { create } from "zustand";
import { salesOrderService } from "../services/sales-order-service";
import type { SalesOrderFormValues } from "../lib/schemas";

// Define interfaces for sales order data from API
interface SalesOrderItem {
  _id?: string;
  item: string | { _id: string };
  quantity: number;
  rate: number;
  tax?: string;
  amount?: number;
}

interface SalesOrder {
  _id: string;
  orderNumber: string;
  customer: string | { _id: string; displayName?: string };
  reference?: string;
  salesOrderDate?: string;
  expectedShipmentDate?: string;
  paymentTerms: string;
  deliveryMethod?: string;
  salesPerson?: string;
  items: SalesOrderItem[];
  discount?: { type: string; value: number };
  shippingCharges?: number;
  adjustment?: number;
  customerNotes?: string;
  termsAndConditions?: string;
  status?: string;
  attachments?: { fileName: string; fileUrl: string }[];
  subTotal?: number;
  total?: number;
}

interface SalesOrdersState {
  salesOrders: SalesOrder[];
  currentSalesOrder: SalesOrder | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  fetchSalesOrders: () => Promise<void>;
  fetchSalesOrderById: (id: string) => Promise<void>;
  createSalesOrder: (data: SalesOrderFormValues) => Promise<void>;
  updateSalesOrder: (id: string, data: SalesOrderFormValues) => Promise<void>;
  deleteSalesOrder: (id: string) => Promise<void>;
  reset: () => void;
}

export const useSalesOrderStore = create<SalesOrdersState>((set, get) => ({
  salesOrders: [],
  currentSalesOrder: null,
  isLoading: false,
  error: null,

  fetchSalesOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log("Fetching all sales orders from store");
      const response = await salesOrderService.getSalesOrders();
      const orders = response.data || [];
      set({ salesOrders: orders, isLoading: false });
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      set({ error: error as Error, isLoading: false });
    }
  },

  fetchSalesOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`Fetching sales order with ID ${id} from store`);
      const result = await salesOrderService.getSalesOrderById(id);
      set({ currentSalesOrder: result, isLoading: false });
      return result;
    } catch (error) {
      console.error(`Error fetching sales order with ID ${id}:`, error);
      set({ error: error as Error, isLoading: false });
    }
  },

  createSalesOrder: async (data: SalesOrderFormValues) => {
    set({ isLoading: true, error: null });
    try {
      const response = await salesOrderService.createSalesOrder(data);
      // Refresh the sales orders list after creation
      get().fetchSalesOrders();
      return response;
    } catch (error) {
      console.error("Error creating sales order:", error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  updateSalesOrder: async (id: string, data: SalesOrderFormValues) => {
    set({ isLoading: true, error: null });
    try {
      const response = await salesOrderService.updateSalesOrder(id, data);
      // Update the current sales order and refresh the list
      set({ currentSalesOrder: response });
      get().fetchSalesOrders();
      return response;
    } catch (error) {
      console.error(`Error updating sales order with ID ${id}:`, error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  deleteSalesOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await salesOrderService.deleteSalesOrder(id);
      // Refresh the sales orders list after deletion
      get().fetchSalesOrders();
      set({ isLoading: false });
    } catch (error) {
      console.error(`Error deleting sales order with ID ${id}:`, error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  reset: () => {
    set({ currentSalesOrder: null });
  },
}));
