import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { useItems } from "../../hooks/use-items";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { ItemsTable } from "../../components/items/items-table";

export function ItemsPage() {
  const navigate = useNavigate();
  const { items, isLoading, error } = useItems();

  const hasError = !!error;
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <Button onClick={() => navigate("/dashboard/items/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">Failed to load items</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the item data
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : (
        <ItemsTable items={safeItems} />
      )}
    </div>
  );
}
