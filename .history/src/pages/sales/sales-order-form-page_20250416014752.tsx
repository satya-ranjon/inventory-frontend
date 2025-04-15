import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { SalesOrderForm } from "../../components/sales/sales-order-form";
import { useSalesOrders } from "../../hooks/use-sales-orders";
import { useCustomers } from "../../hooks/use-customers";
import { useItems } from "../../hooks/use-items";
import { SalesOrderFormValues } from "../../lib/schemas";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

// At the top of the file, add an interface
interface OrderItem {
  _id?: string;
  item: string | { _id: string };
  quantity: number;
  rate: number;
  tax?: string;
  amount: number;
}

export function SalesOrderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [formData, setFormData] = useState<SalesOrderFormValues | undefined>(
    undefined
  );
  const [retryCount, setRetryCount] = useState(0);
  const hasMounted = useRef(false);

  // Use custom hooks for fetching data
  const {
    salesOrder,
    isSalesOrderLoading,
    salesOrderError,
    refetchSalesOrder,
  } = useSalesOrders(id);
  const { customers, isLoading: isCustomersLoading } = useCustomers();
  const { items, isLoading: isItemsLoading } = useItems();

  // Force data refresh when component mounts (for navigation cases)
  useEffect(() => {
    if (isEditMode && !hasMounted.current) {
      console.log("Component mounted, triggering data refresh");
      refetchSalesOrder();
      hasMounted.current = true;
    }
  }, [isEditMode, refetchSalesOrder]);

  // Determine if data is still loading
  const isLoading = isSalesOrderLoading || isCustomersLoading || isItemsLoading;
  const isError = !!salesOrderError;

  // Retry loading if necessary (up to 3 times)
  useEffect(() => {
    if (isEditMode && !salesOrder && !isSalesOrderLoading && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying data fetch (attempt ${retryCount + 1})`);
        refetchSalesOrder();
        setRetryCount((prev) => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    isEditMode,
    salesOrder,
    isSalesOrderLoading,
    retryCount,
    refetchSalesOrder,
  ]);

  // Set form data once sales order data is loaded
  useEffect(() => {
    if (salesOrder) {
      console.log("Sales order data received:", salesOrder);

      // Extract the proper data object
      let orderData;
      if (salesOrder.data && typeof salesOrder.data === "object") {
        orderData = salesOrder.data;
      } else {
        orderData = salesOrder;
      }

      // Ensure we have orderData before proceeding
      if (!orderData) {
        console.error("No valid sales order data found");
        return;
      }

      // Ensure items is an array
      const orderItems = Array.isArray(orderData.items) ? orderData.items : [];

      // Transform API response to match form values format
      const formattedOrder: SalesOrderFormValues = {
        _id: orderData._id,
        orderNumber: orderData.orderNumber || "",
        customer:
          typeof orderData.customer === "object"
            ? orderData.customer._id
            : orderData.customer || "",
        reference: orderData.reference || "",
        salesOrderDate: orderData.salesOrderDate || new Date().toISOString(),
        expectedShipmentDate: orderData.expectedShipmentDate || "",
        paymentTerms: orderData.paymentTerms || "Net 30",
        deliveryMethod: orderData.deliveryMethod || "",
        salesPerson: orderData.salesPerson || "",
        // Transform items safely
        items: orderItems
          .map((item: OrderItem) => {
            // Skip if item is null or undefined
            if (!item) return null;

            return {
              _id: item._id,
              item:
                typeof item.item === "object" && item.item
                  ? item.item._id
                  : item.item || "",
              quantity: item.quantity || 0,
              rate: item.rate || 0,
              tax: item.tax || "0",
              amount: item.amount || 0,
            };
          })
          .filter(Boolean), // Remove any null values
        discount: orderData.discount || {
          type: "percentage",
          value: 0,
        },
        shippingCharges: orderData.shippingCharges || 0,
        adjustment: orderData.adjustment || 0,
        customerNotes: orderData.customerNotes || "",
        termsAndConditions: orderData.termsAndConditions || "",
        status: orderData.status || "Draft",
        attachments: Array.isArray(orderData.attachments)
          ? orderData.attachments
          : [],
      };

      console.log("Formatted sales order for form:", formattedOrder);
      setFormData(formattedOrder);
    }
  }, [salesOrder]);

  // Function to manually trigger a refresh
  const handleManualRefresh = () => {
    refetchSalesOrder();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/dashboard/sales")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sales Orders
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Sales Order" : "Create Sales Order"}
        </h1>
      </div>

      {isEditMode && isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isEditMode && isError ? (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-red-500 mb-4">Failed to load sales order data</p>
          <Button onClick={handleManualRefresh} className="mb-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading Data
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/sales")}>
            Go Back to Sales Orders
          </Button>
        </div>
      ) : (
        <SalesOrderForm
          salesOrder={formData}
          customers={customers || []}
          items={items || []}
        />
      )}
    </div>
  );
}
