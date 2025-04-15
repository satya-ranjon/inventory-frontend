import { useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { SalesOrdersTable } from "../../components/sales/sales-orders-table";
import { useSalesOrderStore } from "../../stores/sales-order-store";
import { Plus, Loader2, AlertTriangle } from "lucide-react";

export function SalesPage() {
  const navigate = useNavigate();
  const { salesOrders, isLoading, error, fetchSalesOrders } =
    useSalesOrderStore();

  // Load sales orders when component mounts
  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  const hasError = !!error;
  const safeSalesOrders = Array.isArray(salesOrders) ? salesOrders : [];

  // Transform store salesOrders to match the table component's expected format
  const formattedOrders = useMemo(() => {
    return safeSalesOrders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customer:
        typeof order.customer === "object"
          ? { displayName: order.customer.displayName || "Unknown" }
          : null,
      salesOrderDate: order.salesOrderDate || "",
      total: order.total || 0,
      status: order.status || "Draft",
    }));
  }, [safeSalesOrders]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sales Orders</h1>

        <Button onClick={() => navigate("/dashboard/sales/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sales Order
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">
            Failed to load sales orders
          </h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the sales order data
          </p>
          <Button variant="outline" onClick={() => fetchSalesOrders()}>
            Try Again
          </Button>
        </div>
      ) : (
        <SalesOrdersTable salesOrders={formattedOrders} />
      )}
    </div>
  );
}
