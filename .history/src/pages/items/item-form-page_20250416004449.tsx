import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { ItemForm } from "../../components/items/item-form";
import { useItem } from "../../hooks/use-items";
import { ItemFormValues } from "../../lib/schemas";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export function ItemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [formData, setFormData] = useState<ItemFormValues | undefined>(
    undefined
  );

  // Use the custom hook for fetching the item
  const { data: item, isLoading, isError } = useItem(id);

  // Set form data once item data is loaded
  useEffect(() => {
    if (item) {
      console.log("Item data received:", item);

      let itemData;
      if (item.data && typeof item.data === "object") {
        itemData = item.data;
      } else {
        itemData = item;
      }

      // Transform API response to match form values format
      const formattedItem: ItemFormValues = {
        type: itemData.type || "Goods",
        name: itemData.name,
        sku: itemData.sku || "",
        unit: itemData.unit || "piece",
        isReturnable: Boolean(itemData.isReturnable),
        dimensions: {
          length: Number(itemData.dimensions?.length || 0),
          width: Number(itemData.dimensions?.width || 0),
          height: Number(itemData.dimensions?.height || 0),
          unit: itemData.dimensions?.unit || "cm",
        },
        weight: {
          value: Number(itemData.weight?.value || 0),
          unit: itemData.weight?.unit || "kg",
        },
        manufacturer: itemData.manufacturer || "",
        brand: itemData.brand || "",
        upc: itemData.upc || "",
        ean: itemData.ean || "",
        isbn: itemData.isbn || "",
        mpn: itemData.mpn || "",
        sellingPrice: Number(itemData.sellingPrice || 0),
        salesAccount: itemData.salesAccount || "",
        description: itemData.description || "",
        tax: itemData.tax || "",
        costAccount: itemData.costAccount || "",
        preferredVendor: itemData.preferredVendor || "",
        inventoryAccount: itemData.inventoryAccount || "",
        openingStock: Number(itemData.openingStock || 0),
        reorderPoint: Number(itemData.reorderPoint || 0),
        inventoryValuationMethod: itemData.inventoryValuationMethod || "FIFO",
      };

      console.log("Formatted item for form:", formattedItem);
      setFormData(formattedItem);
    }
  }, [item]);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/dashboard/items")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Item" : "Add Item"}
        </h1>
      </div>

      {isEditMode && isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isEditMode && isError ? (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-red-500 mb-4">Failed to load item data</p>
          <Button onClick={() => navigate("/dashboard/items")}>
            Go Back to Items
          </Button>
        </div>
      ) : (
        <ItemForm item={formData} />
      )}
    </div>
  );
}
