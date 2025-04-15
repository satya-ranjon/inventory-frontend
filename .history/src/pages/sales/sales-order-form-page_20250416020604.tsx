import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { SalesOrderForm } from "../../components/sales/sales-order-form";
import { useSalesOrderStore } from "../../stores/sales-order-store";
import { useCustomers } from "../../hooks/use-customers";
import { useItems } from "../../hooks/use-items";
import { SalesOrderFormValues } from "../../lib/schemas";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

// Interface for order item
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

  // Use Zustand store instead of react-query hooks
  const {
    currentSalesOrder,
    isLoading: isSalesOrderLoading,
    error: salesOrderError,
    fetchSalesOrderById,
  } = useSalesOrderStore();

  const { customers, isLoading: isCustomersLoading } = useCustomers();
  const { items, isLoading: isItemsLoading } = useItems();

  // Determine if data is still loading
  const isLoading = isSalesOrderLoading || isCustomersLoading || isItemsLoading;
  const isError = !!salesOrderError;

  // Load data when component mounts or ID changes
  useEffect(() => {
    if (isEditMode && id) {
      console.log("Fetching sales order data for ID:", id);
      fetchSalesOrderById(id);
    }
  }, [isEditMode, id, fetchSalesOrderById]);

  // Set form data once sales order data is loaded
  useEffect(() => {
    if (currentSalesOrder) {
      console.log("Sales order data received from store:", currentSalesOrder);

      // Extract the data
      const orderData = currentSalesOrder;

      // Ensure items is an array
      const orderItems = Array.isArray(orderData.items) ? orderData.items : [];

      // Transform API response to match form values format
      const formattedOrder: SalesOrderFormValues = {
        _id: orderData._id,
        orderNumber: orderData.orderNumber || "",
        customer:
          typeof orderData.customer === "object" && orderData.customer
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
          .filter(Boolean).length
          ? (orderItems
              .map((item: OrderItem) => {
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
              .filter(Boolean) as [
              {
                item: string;
                quantity: number;
                rate: number;
                _id?: string;
                tax?: string;
                amount?: number;
              },
              ...{
                item: string;
                quantity: number;
                rate: number;
                _id?: string;
                tax?: string;
                amount?: number;
              }[],
            ])
          : [
              {
                item: "",
                quantity: 1,
                rate: 0,
                amount: 0,
                tax: "0",
              },
            ],
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
  }, [currentSalesOrder]);

  // Function to manually trigger a refresh
  const handleManualRefresh = () => {
    if (id) {
      fetchSalesOrderById(id);
    }
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
