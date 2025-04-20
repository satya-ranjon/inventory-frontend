/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * User data structure
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/**
 * Inventory item data structure
 */
export interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  warranty: string;
  entryBy: User;
  price: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

/**
 * Type for inventory item creation response
 */
export type InventoryItemResponse = ApiResponse<InventoryItem>;
