import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { ItemForm } from "../../components/items/item-form";
import { useItems } from "../../hooks/use-items";
import { ItemFormValues } from "../../lib/schemas";

export function ItemFormPage() {
  const { id } = useParams();
  const { getItemById } = useItems();
  const [item, setItem] = useState<ItemFormValues | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          const { data, isLoading, error } = getItemById(id);

          if (error) {
            setError("Failed to load item");
            setIsLoading(false);
            return;
          }

          if (data?.data) {
            // Transform API response to match form values format
            const formattedItem: ItemFormValues = {
              type: data.data.type || "Goods",
              name: data.data.name,
              sku: data.data.sku || "",
              unit: data.data.unit || "piece",
              isReturnable: data.data.isReturnable || false,
              dimensions: {
                length: data.data.dimensions?.length || 0,
                width: data.data.dimensions?.width || 0,
                height: data.data.dimensions?.height || 0,
                unit: data.data.dimensions?.unit || "cm",
              },
              weight: {
                value: data.data.weight?.value || 0,
                unit: data.data.weight?.unit || "kg",
              },
              manufacturer: data.data.manufacturer || "",
              brand: data.data.brand || "",
              sellingPrice: data.data.sellingPrice || 0,
              salesAccount: data.data.salesAccount || "",
              description: data.data.description || "",
              tax: data.data.tax || "",
              costPrice: data.data.costPrice || 0,
              costAccount: data.data.costAccount || "",
              inventoryAccount: data.data.inventoryAccount || "",
              openingStock: data.data.openingStock || 0,
              reorderPoint: data.data.reorderPoint || 0,
            };

            setItem(formattedItem);
          }

          setIsLoading(isLoading);
        } catch {
          setError("An error occurred while fetching the item");
          setIsLoading(false);
        }
      };

      fetchItem();
    }
  }, [id, getItemById]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading item data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
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
