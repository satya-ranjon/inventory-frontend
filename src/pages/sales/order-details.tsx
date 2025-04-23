import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { InvoiceView, InvoiceData } from "@/components/invoice/invoice-view";

interface OrderItem {
  item: {
    _id: string;
    name: string;
    quantity: number;
    warranty: string;
    price: number;
  };
  quantity: number;
  rate: number;
  amount: number;
  discount: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  reference: string;
  salesOrderDate: string;
  paymentTerms: string;
  deliveryMethod: string;
  salesPerson: string;
  items: OrderItem[];
  subTotal: number;
  discount: {
    type: string;
    value: number;
  };
  shippingCharges: number;
  adjustment: number;
  total: number;
  customerNotes: string;
  termsAndConditions: string;
  status: string;
  payment: number;
  previousDue: number;
  due: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    _id: string;
    customerName: string;
    customerType: "Individual" | "Business";
    email: string;
    contactNumber: string;
    address: string;
    due?: number;
  };
}

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await apiClient.get(`/sales-orders/${id}`);
        setOrder(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
        toast.error("Something went wrong while fetching order data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const calculateDiscountAmount = () => {
    if (!order) return 0;

    if (order.discount.type === "percentage") {
      return (order.subTotal * order.discount.value) / 100;
    }
    return order.discount.value;
  };

  // Duplicate the current sales order
  const handleDuplicate = async () => {
    if (!order) return;

    setIsDuplicating(true);
    try {
      // Create a new order object based on the current one
      const newOrderData = {
        customer: order.customer._id,
        reference: order.reference,
        paymentTerms: order.paymentTerms,
        deliveryMethod: order.deliveryMethod,
        salesPerson: order.salesPerson,

        // Map items to include only necessary fields
        items: order.items.map((item) => ({
          item: item.item._id,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          discount: item.discount,
        })),

        discount: order.discount,
        shippingCharges: order.shippingCharges,
        adjustment: order.adjustment,
        customerNotes: order.customerNotes,
        termsAndConditions: order.termsAndConditions,

        // Set as draft with no payment initially
        status: "Draft",
        payment: 0,

        // Include previous due if available
        previousDue: order.customer.due || 0,

        // Current date for the new order
        salesOrderDate: new Date(),
      };

      // Create the new sales order
      const response = await apiClient.post(
        "/sales-orders/create",
        newOrderData
      );

      if (response.data.success) {
        toast.success("Sales order duplicated successfully");
        // Navigate to the new sales order
        navigate(`/sales/${response.data.data._id}`);
      }
    } catch (error) {
      console.error("Error duplicating sales order:", error);
      toast.error("Failed to duplicate sales order");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handlePrint = () => {
    if (!order) return;

    const formatCurrency = (amount: number) => {
      return `Tk ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Order #${order.orderNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, sans-serif;
          }
          
          body {
            color: #374151;
            line-height: 1.5;
            padding: 2rem;
            max-width: 850px;
            margin: 0 auto;
            font-size: 14px;
          }
          
          .invoice-container {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            padding: 2rem;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
          }
          
          .company-info h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          
          .company-info p {
            margin-bottom: 0.25rem;
          }
          
          .invoice-info {
            text-align: right;
          }
          
          .invoice-info h2 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
          }
          
          .customer-info {
            margin-top: 1rem;
          }
          
          .customer-info h3 {
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
          }
          
          thead {
            background-color: #f3f4f6;
          }
          
          th, td {
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            text-align: left;
          }
          
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .summary {
            display: flex;
            justify-content: flex-end;
          }
          
          .summary-table {
            width: 50%;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .summary-row.total {
            font-weight: 700;
          }
          
          .summary-row.paid {
            color: #059669;
          }
          
          .summary-row.previous-due {
            color: #9f1239;
          }
          
          .summary-row.due {
            color: #dc2626;
            font-weight: 700;
          }
          
          .print-button {
            display: block;
            margin: 1.5rem auto;
            padding: 0.75rem 1.5rem;
            background-color: #4f46e5;
            color: white;
            border: none;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .invoice-container {
              border: none;
            }
            
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <!-- Company Info -->
            <div class="company-info">
              <h2>Inventory Management System</h2>
              <p>Dhaka, Bangladesh</p>
              <p>Mobile: +8801717171717 (Office)</p>
              <p>Mobile: +8801717171717 (Sales)</p>
              <p>Email: inventory@gmail.com</p>
              <p>Sold By: ${order.customer?.customerName || "N/A"}</p>
            </div>
            
            <!-- Invoice Info -->
            <div class="invoice-info">
              <h2>Invoice</h2>
              <p><strong>Invoice No:</strong> ${order.orderNumber}</p>
              <p><strong>Invoice Date:</strong> ${format(new Date(order.salesOrderDate), "dd/MM/yyyy")}</p>
              
              <div class="customer-info">
                <h3>Bill To</h3>
                <p><strong>Name:</strong> ${order.customer?.customerName || "N/A"}</p>
                <p><strong>Mobile:</strong> ${order.customer?.contactNumber || "N/A"}</p>
                <p><strong>Address:</strong> ${order.customer?.address || "N/A"}</p>
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Item</th>
                <th>Warranty</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.item.name}</td>
                  <td>${item.item.warranty || "N/A"}</td>
                  <td>${formatCurrency(item.rate)}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.amount)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <!-- Summary -->
          <div class="summary">
            <div class="summary-table">
              <div class="summary-row">
                <span><strong>Subtotal:</strong></span>
                <span>${formatCurrency(order.subTotal)}</span>
              </div>
              
              ${
                order.discount.value > 0
                  ? `
              <div class="summary-row">
                <span><strong>Discount ${order.discount.type === "percentage" ? `(${order.discount.value}%)` : ""}:</strong></span>
                <span>${formatCurrency(calculateDiscountAmount())}</span>
              </div>
              `
                  : ""
              }
              
              ${
                order.shippingCharges > 0
                  ? `
              <div class="summary-row">
                <span><strong>Shipping Charges:</strong></span>
                <span>${formatCurrency(order.shippingCharges)}</span>
              </div>
              `
                  : ""
              }
              
              ${
                order.adjustment !== 0
                  ? `
              <div class="summary-row">
                <span><strong>Adjustment:</strong></span>
                <span>${formatCurrency(order.adjustment)}</span>
              </div>
              `
                  : ""
              }
              
              <div class="summary-row total">
                <span>Total:</span>
                <span>${formatCurrency(order.total)}</span>
              </div>
              
              ${
                order.previousDue > 0
                  ? `
              <div class="summary-row previous-due">
                <span><strong>Previous Due:</strong></span>
                <span>${formatCurrency(order.previousDue)}</span>
              </div>
              `
                  : ""
              }
              
              <div class="summary-row paid">
                <span><strong>Amount Paid:</strong></span>
                <span>${formatCurrency(order.payment)}</span>
              </div>
              
              ${
                order.due > 0
                  ? `
              <div class="summary-row due">
                <span>Balance Due:</span>
                <span>${formatCurrency(order.due)}</span>
              </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
        
        <button class="print-button" onclick="window.print()">Print Invoice</button>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
    } else {
      toast.error(
        "Unable to open print window. Please allow pop-ups for this site."
      );
    }
  };

  // Convert Order to InvoiceData format for the InvoiceView component
  const mapOrderToInvoiceData = (order: Order): InvoiceData => {
    return {
      id: order._id,
      invoiceNumber: order.orderNumber,
      date: order.salesOrderDate,
      customer: {
        name: order.customer.customerName,
        email: order.customer.email,
        phone: order.customer.contactNumber,
        address: order.customer.address,
      },
      items: order.items.map((item) => ({
        name: item.item.name,
        warranty: item.item.warranty,
        price: item.rate,
        quantity: item.quantity,
        total: item.amount,
      })),
      subtotal: order.subTotal,
      discount: order.discount,
      shippingCharges: order.shippingCharges,
      adjustment: order.adjustment,
      total: order.total,
      previousDue: order.previousDue,
      payment: order.payment,
      due: order.due,
      notes: order.customerNotes,
      terms: order.termsAndConditions,
      status: order.status,
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold mb-1">
          Failed to load order details
        </h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the order data
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  // Use our new InvoiceView component
  return (
    <InvoiceView
      invoice={mapOrderToInvoiceData(order)}
      onPrint={handlePrint}
      onDuplicate={handleDuplicate}
      isDuplicating={isDuplicating}
    />
  );
}
