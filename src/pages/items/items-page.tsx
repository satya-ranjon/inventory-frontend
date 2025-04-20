import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { ItemForm } from "../../components/items/item-form";

import { Search, Package, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface EntryBy {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Item {
  _id: string;
  id?: string;
  name: string;
  quantity: number;
  warranty?: string | null;
  entryBy: EntryBy | null;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export function ItemsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Ensure items is an array and filter safely
  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter((item) => {
    if (!item) return false;

    const name = item.name?.toLowerCase() || "";
    const entryByName = item.entryBy?.name?.toLowerCase() || "";
    const warranty = item.warranty?.toLowerCase() || "";
    const searchTermLower = searchTerm.toLowerCase();

    return (
      name.includes(searchTermLower) ||
      entryByName.includes(searchTermLower) ||
      warranty?.includes(searchTermLower)
    );
  });

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      await apiClient.delete(`/items/${id}`);
      toast.success("Item deleted successfully");
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/items");
      setItems(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Something went wrong while fetching items.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRefresh = () => {
    fetchItems();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <ItemForm onSuccess={() => handleRefresh()} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">Failed to load items</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the item data
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Entry By</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8 mb-2" />
                          {searchTerm ? "No items found" : "No items yet"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item?._id || Math.random()}>
                        <TableCell className="font-medium">
                          {item?.name || "Unnamed Item"}
                        </TableCell>
                        <TableCell>{item?.quantity || 0}</TableCell>
                        <TableCell>{item?.warranty || "-"}</TableCell>
                        <TableCell>{item?.entryBy?.name || "-"}</TableCell>
                        <TableCell>${Number(item?.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex  space-x-3">
                            <ItemForm
                              initialData={item}
                              id={item._id}
                              onSuccess={() => handleRefresh()}
                            />

                            <Button
                              onClick={() => handleDelete(item._id)}
                              variant="destructive">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
