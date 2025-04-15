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
      console.error("API Error:", itemQuery.error);
      setError("Failed to load item");
      return;
    }

    // Debug the structure of the response
    console.log("Item API Response:", itemQuery.data);

    if (itemQuery.data) {
      try {
        // The API returns nested data object
        const apiData = itemQuery.data.data || itemQuery.data;

        // Map API data to form values
        const formattedItem: ItemFormValues = {
          type: apiData.type || "Goods",
          name: apiData.name,
          sku: apiData.sku || "",
          unit: apiData.unit || "piece",
          isReturnable: Boolean(apiData.isReturnable),
          dimensions: {
            length: Number(apiData.dimensions?.length || 0),
            width: Number(apiData.dimensions?.width || 0),
            height: Number(apiData.dimensions?.height || 0),
            unit: apiData.dimensions?.unit || "cm",
          },
          weight: {
            value: Number(apiData.weight?.value || 0),
            unit: apiData.weight?.unit || "kg",
          },
          manufacturer: apiData.manufacturer || "",
          brand: apiData.brand || "",
          upc: apiData.upc || "",
          ean: apiData.ean || "",
          isbn: apiData.isbn || "",
          mpn: apiData.mpn || "",
          sellingPrice: Number(apiData.sellingPrice || 0),
          salesAccount: apiData.salesAccount || "",
          description: apiData.description || "",
          tax: apiData.tax || "",
          costPrice: Number(apiData.costPrice || 0),
          costAccount: apiData.costAccount || "",
          preferredVendor: apiData.preferredVendor || "",
          inventoryAccount: apiData.inventoryAccount || "",
          openingStock: Number(apiData.openingStock || 0),
          reorderPoint: Number(apiData.reorderPoint || 0),
          inventoryValuationMethod: apiData.inventoryValuationMethod || "FIFO",
        };

        console.log("Formatted item for form:", formattedItem);
        setItem(formattedItem);
      } catch (err) {
        console.error("Error formatting item data:", err);
        setError("Error processing item data");
      }
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
