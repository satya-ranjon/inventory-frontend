import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { Loader2, AlertTriangle, Printer } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

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
  };
}

// Mock implementation of react-to-print until it can be installed

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  console.log(order);

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

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans text-sm">
      {/* Print Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" /> Print Invoice
        </Button>
      </div>

      {/* Invoice Content */}
      <div ref={invoiceRef}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          {/* Company Info */}
          <div>
            <img
              src="https://i.ibb.co.com/pB683QWW/material-management.png"
              alt="Logo"
              className="mb-2 w-24"
            />
            <h2 className="text-xl font-bold text-gray-800">
              Inventory Management System
            </h2>
            <p>Dhaka, Bangladesh</p>
            <p>Mobile: +8801717171717 (Office)</p>
            <p>Mobile: +8801717171717 (Sales)</p>
            <p>Email: inventory@gmail.com</p>
            <p>Sold By: {order?.customer.customerName ?? "N/A"}</p>
          </div>

          {/* Invoice Info */}
          <div className="text-right">
            <h2 className="text-lg font-semibold text-gray-700">Invoice</h2>
            <p>
              <span className="font-semibold">Invoice No:</span>{" "}
              {order.orderNumber}
            </p>
            <p>
              <span className="font-semibold">Invoice Date:</span>{" "}
              {format(new Date(order.salesOrderDate), "dd/MM/yyyy")}
            </p>

            <div className="mt-4">
              <h3 className="font-bold text-gray-700">Bill To</h3>
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {order.customer.customerName}
              </p>
              <p>
                <span className="font-semibold">Mobile:</span>{" "}
                {order.customer.contactNumber || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {order.customer.address || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full table-auto border border-gray-300 mb-4 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">SL</th>
              <th className="border px-3 py-2 text-left">Item</th>
              <th className="border px-3 py-2 text-left">Warranty</th>
              <th className="border px-3 py-2 text-left">Price</th>
              <th className="border px-3 py-2 text-left">Quantity</th>
              <th className="border px-3 py-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border px-3 py-2">{index + 1}</td>
                <td className="border px-3 py-2">{item.item.name}</td>
                <td className="border px-3 py-2">
                  {item.item.warranty || "N/A"}
                </td>
                <td className="border px-3 py-2">
                  Tk{" "}
                  {item.rate.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="border px-3 py-2">{item.quantity}</td>
                <td className="border px-3 py-2">
                  Tk{" "}
                  {item.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">Subtotal:</span>
              <span>
                Tk{" "}
                {order.subTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            {order.discount.value > 0 && (
              <div className="flex justify-between border-b py-2">
                <span className="font-semibold">
                  Discount{" "}
                  {order.discount.type === "percentage"
                    ? `(${order.discount.value}%)`
                    : ""}
                  :
                </span>
                <span>
                  Tk{" "}
                  {calculateDiscountAmount().toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {order.shippingCharges > 0 && (
              <div className="flex justify-between border-b py-2">
                <span className="font-semibold">Shipping Charges:</span>
                <span>
                  Tk{" "}
                  {order.shippingCharges.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {order.adjustment !== 0 && (
              <div className="flex justify-between border-b py-2">
                <span className="font-semibold">Adjustment:</span>
                <span>
                  Tk{" "}
                  {order.adjustment.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="flex justify-between border-b py-2 font-bold">
              <span>Total:</span>
              <span>
                Tk{" "}
                {order.total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">Amount Paid:</span>
              <span className="text-green-600">
                Tk{" "}
                {order.payment.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            {order.due > 0 && (
              <div className="flex justify-between py-2 font-bold">
                <span>Balance Due:</span>
                <span className="text-red-500">
                  Tk{" "}
                  {order.due.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
