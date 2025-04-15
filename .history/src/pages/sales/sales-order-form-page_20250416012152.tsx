import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { SalesOrderForm } from "../../components/sales/sales-order-form";
import { useSalesOrders } from "../../hooks/use-sales-orders";
import { useCustomers } from "../../hooks/use-customers";
import { useItems } from "../../hooks/use-items";
import { SalesOrderFormValues } from "../../lib/schemas";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

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

  // Use custom hooks for fetching data
  const { salesOrder, isSalesOrderLoading, salesOrderError } =
    useSalesOrders(id);
  const { customers, isLoading: isCustomersLoading } = useCustomers();
  const { items, isLoading: isItemsLoading } = useItems();

  // Determine if data is still loading
  const isLoading = isSalesOrderLoading || isCustomersLoading || isItemsLoading;
  const isError = !!salesOrderError;

  // Set form data once sales order data is loaded
  useEffect(() => {
    if (salesOrder) {
      console.log("Sales order data received:", salesOrder);

      let orderData;
      if (salesOrder.data && typeof salesOrder.data === "object") {
        orderData = salesOrder.data;
      } else {
        orderData = salesOrder;
      }

      // Transform API response to match form values format
      const formattedOrder: SalesOrderFormValues = {
        _id: orderData._id,
        orderNumber: orderData.orderNumber || "",
        customer: orderData.customer,
        reference: orderData.reference || "",
        salesOrderDate: orderData.salesOrderDate || new Date().toISOString(),
        expectedShipmentDate: orderData.expectedShipmentDate || "",
        paymentTerms: orderData.paymentTerms || "Net 30",
        deliveryMethod: orderData.deliveryMethod || "",
        salesPerson: orderData.salesPerson || "",
        items: orderData.items.map((item: OrderItem) => ({
          _id: item._id,
          item: typeof item.item === "object" ? item.item._id : item.item,
          quantity: item.quantity,
          rate: item.rate,
          tax: item.tax || "0",
          amount: item.amount,
        })),
        discount: orderData.discount || {
          type: "percentage",
          value: 0,
        },
        shippingCharges: orderData.shippingCharges || 0,
        adjustment: orderData.adjustment || 0,
        customerNotes: orderData.customerNotes || "",
        termsAndConditions: orderData.termsAndConditions || "",
        status: orderData.status || "Draft",
        attachments: orderData.attachments || [],
      };

      console.log("Formatted sales order for form:", formattedOrder);
      setFormData(formattedOrder);
    }
  }, [salesOrder]);

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
          <Button onClick={() => navigate("/dashboard/sales")}>
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
