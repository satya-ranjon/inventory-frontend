import { format } from "date-fns";
import { Printer, Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { useEffect } from "react";

// Add print styles
const printStyles = `
@media print {
  body {
    background-color: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  .print-hide {
    display: none !important;
  }
  
  .invoice-container {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    max-width: 100% !important;
  }
  
  .invoice-content {
    page-break-inside: avoid;
  }
  
  @page {
    size: A4;
    margin: 0.5cm;
  }
}
`;

// Define prop types for the invoice items
interface InvoiceItem {
  name: string;
  warranty?: string;
  price: number;
  quantity: number;
  total: number;
}

// Define discount structure
interface InvoiceDiscount {
  type: "percentage" | "fixed" | string;
  value: number;
}

// Define the complete invoice structure
export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: Date | string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount?: InvoiceDiscount;
  shippingCharges?: number;
  adjustment?: number;
  total: number;
  previousDue?: number;
  payment?: number;
  due?: number;
  notes?: string;
  terms?: string;
  status?: string;
}

interface InvoiceViewProps {
  invoice: InvoiceData;
  onPrint?: () => void;
  onDuplicate?: () => void;
  isDuplicating?: boolean;
  showActions?: boolean;
  showBackButton?: boolean;
}

export function InvoiceView({
  invoice,
  onPrint,
  onDuplicate,
  isDuplicating = false,
  showActions = true,
  showBackButton = true,
}: InvoiceViewProps) {
  const navigate = useNavigate();

  // Add print styles to the document
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = printStyles;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const calculateDiscountAmount = () => {
    if (!invoice.discount) return 0;

    if (invoice.discount.type === "percentage") {
      return (invoice.subtotal * invoice.discount.value) / 100;
    }
    return invoice.discount.value;
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
      case "draft":
        return "bg-slate-100 text-slate-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-amber-100 text-amber-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return `Tk ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans text-sm">
      {/* Action Buttons */}
      {showActions && (
        <div className="flex justify-between mb-6 print-hide">
          {showBackButton ? (
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-2">
            {onDuplicate && (
              <Button
                onClick={onDuplicate}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isDuplicating}>
                {isDuplicating ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span> Duplicating...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Duplicate Invoice
                  </>
                )}
              </Button>
            )}

            {onPrint && (
              <Button onClick={onPrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> Print Invoice
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Invoice Content */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white invoice-container">
        {/* Header - Company & Customer Info */}
        <div className="border-b bg-gray-50/50 p-6">
          <div className="flex justify-between flex-wrap gap-6">
            {/* Company Info */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Inventory Management System
              </h2>
              <div className="space-y-1 text-gray-600">
                <p>Dhaka, Bangladesh</p>
                <p>Mobile: +8801717171717 (Office)</p>
                <p>Email: inventory@gmail.com</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-2">
                <h2 className="text-lg font-semibold text-gray-700">Invoice</h2>
                {invoice.status && (
                  <Badge className={`${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-gray-600">
                <p>
                  <span className="font-semibold">Invoice No:</span>{" "}
                  {invoice.invoiceNumber}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {typeof invoice.date === "string"
                    ? format(new Date(invoice.date), "dd/MM/yyyy")
                    : format(invoice.date, "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mt-6 pt-6 border-t border-dashed grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Bill To</h3>
              <div className="space-y-1 text-gray-600">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {invoice.customer.name}
                </p>
                {invoice.customer.phone && (
                  <p>
                    <span className="font-semibold">Mobile:</span>{" "}
                    {invoice.customer.phone}
                  </p>
                )}
                {invoice.customer.email && (
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {invoice.customer.email}
                  </p>
                )}
                {invoice.customer.address && (
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {invoice.customer.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="py-3 px-4 border border-gray-200 font-semibold">
                    #
                  </th>
                  <th className="py-3 px-4 border border-gray-200 font-semibold">
                    Item
                  </th>
                  <th className="py-3 px-4 border border-gray-200 font-semibold">
                    Price
                  </th>
                  <th className="py-3 px-4 border border-gray-200 font-semibold text-center">
                    Qty
                  </th>
                  <th className="py-3 px-4 border border-gray-200 font-semibold text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 border border-gray-200">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 border border-gray-200">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.warranty && (
                          <div className="text-xs text-gray-500 mt-1">
                            Warranty: {item.warranty}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border border-gray-200">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3 px-4 border border-gray-200 text-center">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 border border-gray-200 text-right">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-1/2 border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 border-b">
                Summary
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>

                {invoice.discount && invoice.discount.value > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span>
                      Discount{" "}
                      {invoice.discount.type === "percentage"
                        ? `(${invoice.discount.value}%)`
                        : ""}
                      :
                    </span>
                    <span>-{formatCurrency(calculateDiscountAmount())}</span>
                  </div>
                )}

                {invoice.shippingCharges && invoice.shippingCharges > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span>Shipping Charges:</span>
                    <span>{formatCurrency(invoice.shippingCharges)}</span>
                  </div>
                )}

                {invoice.adjustment && invoice.adjustment !== 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span>Adjustment:</span>
                    <span>
                      {invoice.adjustment > 0 ? "+" : ""}
                      {formatCurrency(invoice.adjustment)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>

                {invoice.previousDue && invoice.previousDue > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span>Previous Due:</span>
                    <span className="text-red-600">
                      {formatCurrency(invoice.previousDue)}
                    </span>
                  </div>
                )}

                {invoice.payment !== undefined && (
                  <div className="flex justify-between py-2 border-b">
                    <span>Amount Paid:</span>
                    <span className="text-green-600">
                      {formatCurrency(invoice.payment)}
                    </span>
                  </div>
                )}

                {invoice.due !== undefined && invoice.due > 0 && (
                  <div className="flex justify-between py-2 font-bold">
                    <span>Balance Due:</span>
                    <span className="text-red-600">
                      {formatCurrency(invoice.due)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {invoice.notes && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 border-b">
                    Notes
                  </div>
                  <div className="p-4 text-gray-600 whitespace-pre-line">
                    {invoice.notes}
                  </div>
                </div>
              )}

              {invoice.terms && (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 border-b">
                    Terms & Conditions
                  </div>
                  <div className="p-4 text-gray-600 whitespace-pre-line">
                    {invoice.terms}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
