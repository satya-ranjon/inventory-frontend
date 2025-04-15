import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { ItemForm } from "../../components/items/item-form";
import { useItems } from "../../hooks/use-items";
import { ItemFormValues } from "../../lib/schemas";

export function ItemFormPage() {
  const { id } = useParams();
  const { getItemById } = useItems();
  const [item, setItem] = useState<ItemFormValues | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Create the query outside of the effect
  const itemQuery = id
    ? getItemById(id)
    : { data: null, isLoading: false, error: null };

  useEffect(() => {
    if (!id) return;

    if (itemQuery.error) {
      setError("Failed to load item");
      return;
    }

    if (itemQuery.data?.data) {
      // Transform API response to match form values format
      const data = itemQuery.data.data;
      const formattedItem: ItemFormValues = {
        type: data.type || "Goods",
        name: data.name,
        sku: data.sku || "",
        unit: data.unit || "piece",
        isReturnable: data.isReturnable || false,
        dimensions: {
          length: data.dimensions?.length || 0,
          width: data.dimensions?.width || 0,
          height: data.dimensions?.height || 0,
          unit: data.dimensions?.unit || "cm",
        },
        weight: {
          value: data.weight?.value || 0,
          unit: data.weight?.unit || "kg",
        },
        manufacturer: data.manufacturer || "",
        brand: data.brand || "",
        upc: data.upc || "",
        ean: data.ean || "",
        isbn: data.isbn || "",
        mpn: data.mpn || "",
        sellingPrice: data.sellingPrice || 0,
        salesAccount: data.salesAccount || "",
        description: data.description || "",
        tax: data.tax || "",
        costPrice: data.costPrice || 0,
        costAccount: data.costAccount || "",
        preferredVendor: data.preferredVendor || "",
        inventoryAccount: data.inventoryAccount || "",
        openingStock: data.openingStock || 0,
        reorderPoint: data.reorderPoint || 0,
        inventoryValuationMethod: data.inventoryValuationMethod || "FIFO",
      };

      setItem(formattedItem);
    }
  }, [id, itemQuery.data, itemQuery.error]);

  if (itemQuery.isLoading) {
    return <div className="p-4 text-center">Loading item data...</div>;
  }

  if (error || itemQuery.error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error || "Failed to load item"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {id ? "Edit Item" : "Add New Item"}
      </h1>
      <ItemForm item={item} />
    </div>
  );
}
