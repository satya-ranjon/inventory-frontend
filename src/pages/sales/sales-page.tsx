import { useState, useEffect, useMemo, useRef } from "react";
import {
  Loader2,
  Search,
  RefreshCcw,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ClipboardList,
  Printer,
  Trash2,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SalesForm } from "@/components/sales/sales-form";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sales table row component for rendering each sales order
interface SalesTableRowProps {
  sale: SalesOrder;
  formatCurrency: (amount: number) => string;
  format: (date: Date | number, format: string) => string;
  getStatusBadgeClass: (status: string) => string;
  isUpdatingStatus: string | null;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  printSalesOrder: (sale: SalesOrder) => void;
  openDeleteModal: (id: string) => void;
}

const SalesTableRow = ({
  sale,
  formatCurrency,
  format,
  getStatusBadgeClass,
  isUpdatingStatus,
  updateOrderStatus,
  printSalesOrder,
  openDeleteModal,
}: SalesTableRowProps) => {
  return (
    <TableRow key={sale._id} className="group hover:bg-muted/30 cursor-pointer">
      <TableCell className="font-medium">#{sale.orderNumber}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>
            {sale.customer?.customerName || sale.customer?.email || "N/A"}
          </span>
          {sale.customer?.email && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {sale.customer.email}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {sale.salesOrderDate ? (
          <div className="flex flex-col">
            <span>{format(new Date(sale.salesOrderDate), "MMM d, yyyy")}</span>
            <span className="text-xs text-muted-foreground">
              {sale.paymentTerms}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">Not set</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end">
          <span>{formatCurrency(sale.total || 0)}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end text-green-600">
          <span>{formatCurrency(sale.payment)}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end text-red-600">
          <span>{formatCurrency(sale.previousDue)}</span>
        </div>
      </TableCell>
      <TableCell className="text-right text-red-600">
        <div className="flex flex-col items-end">
          <span>{formatCurrency(sale.due)}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex items-center gap-1 px-2"
                disabled={isUpdatingStatus === sale._id}>
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusBadgeClass(sale.status)}`}>
                  {sale.status}
                </Badge>
                {isUpdatingStatus === sale._id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem
                className="text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(sale._id, "Draft");
                }}>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass("Draft")}>
                  Draft
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(sale._id, "Confirmed");
                }}>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass("Confirmed")}>
                  Confirmed
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(sale._id, "Shipped");
                }}>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass("Shipped")}>
                  Shipped
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(sale._id, "Delivered");
                }}>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass("Delivered")}>
                  Delivered
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(sale._id, "Cancelled");
                }}>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass("Cancelled")}>
                  Cancelled
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              printSalesOrder(sale);
            }}>
            <Printer className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(sale._id);
            }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

interface Customer {
  _id: string;
  customerName?: string;
  email?: string;
  due?: number;
}

interface SalesItem {
  item: {
    _id: string;
    name: string;
  };
  quantity: number;
  rate: number;
  amount: number;
  discount?: number;
}

interface SalesDiscount {
  type: "percentage" | "fixed";
  value: number;
}

interface SalesOrder {
  _id: string;
  orderNumber: string;
  customer: Customer | null;
  reference: string;
  salesOrderDate: string;
  paymentTerms: string;
  deliveryMethod: string;
  salesPerson: string;
  items: SalesItem[];
  subTotal: number;
  discount: SalesDiscount;
  shippingCharges: number;
  adjustment: number;
  total: number;
  customerNotes?: string;
  termsAndConditions?: string;
  status: "Draft" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  payment: number;
  previousDue: number;
  due: number;
  createdAt: string;
  updatedAt: string;
}

export function SalesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
  });
  const [summary, setSummary] = useState({
    count: 0,
    total: 0,
    paid: 0,
    due: 0,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Use a ref to track if we're filtering, to prevent unnecessary API calls
  const isFilteringRef = useRef(false);
  const lastPageRef = useRef(1);

  // Effect to track filtering changes
  useEffect(() => {
    // Update the filtering ref based on current filter state
    const isFiltering = searchTerm !== "" || statusFilter !== "all";

    // Only reset pagination if we're transitioning between filtering states
    if (isFiltering !== isFilteringRef.current) {
      // Reset to page 1 when filter status changes
      setPagination((prev) => ({ ...prev, page: 1 }));

      // If switching from filtering to non-filtering, fetch new data
      if (!isFiltering && isFilteringRef.current) {
        fetchSalesOrders(1);
      }
    }

    // Update the ref
    isFilteringRef.current = isFiltering;
  }, [searchTerm, statusFilter]);

  // Filter sales orders based on search term and status
  const filteredSalesOrders = Array.isArray(salesOrders)
    ? salesOrders.filter((order) => {
        if (!order) return false;

        // Status filter
        if (statusFilter !== "all" && order.status !== statusFilter) {
          return false;
        }

        // Search term filter
        const orderNumber = order.orderNumber?.toLowerCase() || "";
        const customerName = order.customer?.customerName?.toLowerCase() || "";
        const customerEmail = order.customer?.email?.toLowerCase() || "";
        const reference = order.reference?.toLowerCase() || "";
        const salesPerson = order.salesPerson?.toLowerCase() || "";
        const searchTermLower = searchTerm.toLowerCase();

        return (
          orderNumber.includes(searchTermLower) ||
          customerName.includes(searchTermLower) ||
          customerEmail.includes(searchTermLower) ||
          reference.includes(searchTermLower) ||
          salesPerson.includes(searchTermLower)
        );
      })
    : [];

  const fetchSalesOrders = async (pageToFetch = pagination.page) => {
    setIsLoading(true);
    try {
      console.log("Fetching sales orders for page:", pageToFetch);

      const response = await apiClient.get(
        `/sales-orders?page=${pageToFetch}&limit=${pagination.limit}`
      );

      console.log("API Response:", response.data);

      // Check if the response follows the expected structure
      if (response.data && response.data.data) {
        // The actual data is nested inside response.data.data
        const salesData = response.data.data.data || [];
        console.log("Sales data extracted:", salesData.length, "items");
        setSalesOrders(salesData);

        // Update pagination from meta
        const meta = response.data.data.meta || {};
        console.log("Meta data:", meta);

        // Important: Update with the page we requested, not what might come in the response
        // This ensures we're showing the right page of data
        setPagination({
          page: pageToFetch, // Use the page we requested, not what comes back from API
          limit: parseInt(meta.limit) || 8,
          total: parseInt(meta.total) || 0,
        });

        // Update summary from meta
        setSummary({
          count: parseInt(meta.total) || 0,
          total: parseFloat(meta.totalAmount) || 0,
          paid: parseFloat(meta.totalPaid) || 0,
          due: parseFloat(meta.totalDue) || 0,
        });
      } else {
        // Fallback for older API structure
        console.log("Using fallback API structure");
        setSalesOrders(response.data.data || []);
        setPagination({
          page: pageToFetch, // Use the page we requested, not what comes back from API
          limit: parseInt(response.data.meta?.limit) || 8,
          total: parseInt(response.data.meta?.total) || 0,
        });

        // Update summary with fallback
        setSummary({
          count: parseInt(response.data.meta?.total) || 0,
          total: parseFloat(response.data.meta?.totalAmount) || 0,
          paid: parseFloat(response.data.meta?.totalPaid) || 0,
          due: parseFloat(response.data.meta?.totalDue) || 0,
        });
      }

      // Update the last page ref after a successful fetch
      lastPageRef.current = pageToFetch;
    } catch (err) {
      console.error("Error fetching sales orders:", err);
      toast.error("Something went wrong while fetching sales orders.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch - only run once
  useEffect(() => {
    fetchSalesOrders(1);
  }, []); // Empty dependency array for initial load only

  const handleRefresh = () => {
    fetchSalesOrders();
  };

  // Custom pagination handlers to directly fetch the right page
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      const prevPage = pagination.page - 1;
      if (!isFilteringRef.current) {
        // For server-side pagination, fetch the data directly without updating state first
        fetchSalesOrders(prevPage);
      } else {
        // For client-side filtering, just update the page
        setPagination((prev) => ({ ...prev, page: prevPage }));
      }
    }
  };

  const handleNextPage = () => {
    const maxPage = isFilteringRef.current
      ? Math.max(Math.ceil(filteredSalesOrders.length / pagination.limit), 1)
      : Math.max(Math.ceil(pagination.total / pagination.limit), 1);

    if (pagination.page < maxPage) {
      const nextPage = pagination.page + 1;
      console.log("Moving to next page:", nextPage);

      if (!isFilteringRef.current) {
        // For server-side pagination, fetch the data directly without updating state first
        fetchSalesOrders(nextPage);
      } else {
        // For client-side filtering, just update the page
        setPagination((prev) => ({ ...prev, page: nextPage }));
      }
    }
  };

  // Delete a sales order
  const openDeleteModal = (id: string) => {
    setOrderToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    setIsLoading(true);
    try {
      await apiClient.delete(`/sales-orders/${orderToDelete}`);
      toast.success("Sales order deleted successfully");
      handleRefresh();
    } catch (error) {
      console.error("Error deleting sales order:", error);
      toast.error("Failed to delete sales order");
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  // Get custom class for status badge based on status
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "Draft":
        return "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200";
      case "Confirmed":
        return "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200";
      case "Delivered":
        return "bg-green-100 hover:bg-green-200 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 hover:bg-red-200 text-red-800 border-red-200";
      default:
        return "";
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} tk`;
  };

  // Print a sales order
  const printSalesOrder = (sale: SalesOrder) => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error(
          "Unable to open print window. Please check your popup settings."
        );
        return;
      }

      const calculateDiscountAmount = () => {
        if (sale.discount.type === "percentage") {
          return (sale.subTotal * sale.discount.value) / 100;
        }
        return sale.discount.value;
      };

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Order #${sale.orderNumber}</title>
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
                <p>Sold By: ${sale.customer?.customerName || "N/A"}</p>
              </div>
              
              <!-- Invoice Info -->
              <div class="invoice-info">
                <h2>Invoice</h2>
                <p><strong>Invoice No:</strong> ${sale.orderNumber}</p>
                <p><strong>Invoice Date:</strong> ${format(new Date(sale.salesOrderDate), "dd/MM/yyyy")}</p>
                
                <div class="customer-info">
                  <h3>Bill To</h3>
                  <p><strong>Name:</strong> ${sale.customer?.customerName || "N/A"}</p>
                  <p><strong>Email:</strong> ${sale.customer?.email || "N/A"}</p>
                  <p><strong>Reference:</strong> ${sale.reference || "N/A"}</p>
                </div>
              </div>
            </div>
            
            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items
                  .map(
                    (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.item.name}</td>
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
                  <span>${formatCurrency(sale.subTotal)}</span>
                </div>
                
                ${
                  sale.discount.value > 0
                    ? `
                <div class="summary-row">
                  <span><strong>Discount ${sale.discount.type === "percentage" ? `(${sale.discount.value}%)` : ""}:</strong></span>
                  <span>${formatCurrency(calculateDiscountAmount())}</span>
                </div>
                `
                    : ""
                }
                
                ${
                  sale.shippingCharges > 0
                    ? `
                <div class="summary-row">
                  <span><strong>Shipping Charges:</strong></span>
                  <span>${formatCurrency(sale.shippingCharges)}</span>
                </div>
                `
                    : ""
                }
                
                ${
                  sale.adjustment !== 0
                    ? `
                <div class="summary-row">
                  <span><strong>Adjustment:</strong></span>
                  <span>${formatCurrency(sale.adjustment)}</span>
                </div>
                `
                    : ""
                }
                
                <div class="summary-row total">
                  <span>Total:</span>
                  <span>${formatCurrency(sale.total)}</span>
                </div>
                
                <div class="summary-row paid">
                  <span><strong>Amount Paid:</strong></span>
                  <span>${formatCurrency(sale.payment)}</span>
                </div>
                
                ${
                  sale.previousDue > 0
                    ? `
                <div class="summary-row previous-due">
                  <span>Previous Due:</span>
                  <span>${formatCurrency(sale.previousDue)}</span>
                </div>
                `
                    : ""
                }
                
                ${
                  sale.due > 0
                    ? `
                <div class="summary-row due">
                  <span>Balance Due:</span>
                  <span>${formatCurrency(sale.due)}</span>
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

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      // Automatically print after content loads
      printWindow.onload = () => {
        setTimeout(() => {
          // Small delay to ensure styles are loaded
          printWindow.print();
        }, 500);
      };

      toast.success("Preparing sales order for printing");
    } catch (error) {
      console.error("Error printing sales order:", error);
      toast.error("Failed to print sales order");
    }
  };

  // Get summary data
  const getSummary = () => {
    // Use server-provided summary if available and not filtering
    if (!(searchTerm || statusFilter !== "all")) {
      return summary;
    }

    // Fall back to local calculation when filtering
    if (!salesOrders.length) return { total: 0, paid: 0, due: 0, count: 0 };

    return salesOrders.reduce(
      (acc, order) => {
        if (statusFilter !== "all" && order.status !== statusFilter) {
          return acc;
        }

        // Search term filter
        const orderNumber = order.orderNumber?.toLowerCase() || "";
        const customerName = order.customer?.customerName?.toLowerCase() || "";
        const customerEmail = order.customer?.email?.toLowerCase() || "";
        const reference = order.reference?.toLowerCase() || "";
        const salesPerson = order.salesPerson?.toLowerCase() || "";
        const searchTermLower = searchTerm.toLowerCase();

        if (
          searchTerm &&
          !(
            orderNumber.includes(searchTermLower) ||
            customerName.includes(searchTermLower) ||
            customerEmail.includes(searchTermLower) ||
            reference.includes(searchTermLower) ||
            salesPerson.includes(searchTermLower)
          )
        ) {
          return acc;
        }

        return {
          count: acc.count + 1,
          total: acc.total + (order.total || 0),
          paid: acc.paid + (order.payment || 0),
          due: acc.due + (order.due || 0),
        };
      },
      { count: 0, total: 0, paid: 0, due: 0 }
    );
  };

  const calculatedSummary = getSummary();

  // Update sales order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(orderId);
    try {
      await apiClient.patch(`/sales-orders/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchSalesOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Calculate the current page's sales orders
  const currentSalesOrders = useMemo(() => {
    console.log("Recalculating currentSalesOrders");
    console.log("Sales orders length:", salesOrders.length);
    console.log("Filtered sales orders length:", filteredSalesOrders.length);
    console.log("Search term:", searchTerm);
    console.log("Status filter:", statusFilter);

    if (searchTerm || statusFilter !== "all") {
      // Client-side filtering and pagination
      return filteredSalesOrders.slice(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit
      );
    }

    // Server-side pagination - use the data as-is
    return salesOrders;
  }, [salesOrders, filteredSalesOrders, searchTerm, statusFilter, pagination]);

  // Check if there's any data or if we're still loading
  const hasNoData = !isLoading && salesOrders.length === 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Sales Orders</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={isLoading}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <SalesForm onSuccess={handleRefresh} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden border-muted bg-muted/5 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-muted" />
            ) : (
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 text-primary mr-2" />
                <span className="text-3xl font-bold">
                  {calculatedSummary.count}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-muted bg-muted/5 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-muted" />
            ) : (
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
                <span className="text-3xl font-bold">
                  {formatCurrency(calculatedSummary.total)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-muted bg-muted/5 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-muted" />
            ) : (
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-3xl font-bold">
                  {formatCurrency(calculatedSummary.paid)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-muted bg-muted/5 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-muted" />
            ) : (
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-3xl font-bold">
                  {formatCurrency(calculatedSummary.due)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-auto max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer, reference..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Status:
          </span>
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={statusFilter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter("all")}>
              All
            </Badge>
            <Badge
              variant={statusFilter === "Draft" ? "default" : "outline"}
              className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
              onClick={() => setStatusFilter("Draft")}>
              Draft
            </Badge>
            <Badge
              variant={statusFilter === "Confirmed" ? "default" : "outline"}
              className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200"
              onClick={() => setStatusFilter("Confirmed")}>
              Confirmed
            </Badge>
            <Badge
              variant={statusFilter === "Shipped" ? "default" : "outline"}
              className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200"
              onClick={() => setStatusFilter("Shipped")}>
              Shipped
            </Badge>
            <Badge
              variant={statusFilter === "Delivered" ? "default" : "outline"}
              className="cursor-pointer bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
              onClick={() => setStatusFilter("Delivered")}>
              Delivered
            </Badge>
            <Badge
              variant={statusFilter === "Cancelled" ? "default" : "outline"}
              className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
              onClick={() => setStatusFilter("Cancelled")}>
              Cancelled
            </Badge>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[100px]">Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Previous Due</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-20 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : hasNoData ? (
              // No data case
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mb-2" />
                    <p>No sales orders found</p>
                    <div className="mt-2">
                      <SalesForm onSuccess={handleRefresh} />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentSalesOrders.length > 0 ? (
              // Display data when available
              currentSalesOrders.map((sale) => (
                <SalesTableRow
                  key={sale._id}
                  sale={sale}
                  formatCurrency={formatCurrency}
                  format={format}
                  getStatusBadgeClass={getStatusBadgeClass}
                  isUpdatingStatus={isUpdatingStatus}
                  updateOrderStatus={updateOrderStatus}
                  printSalesOrder={printSalesOrder}
                  openDeleteModal={openDeleteModal}
                />
              ))
            ) : (
              // No results after filtering
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2" />
                    <p>No sales orders matching your filters</p>
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}>
                      Clear filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls - only show if we have data */}
      {!hasNoData && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={pagination.page === 1}>
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.page} of{" "}
            {searchTerm || statusFilter !== "all"
              ? Math.max(
                  Math.ceil(filteredSalesOrders.length / pagination.limit),
                  1
                )
              : Math.max(Math.ceil(pagination.total / pagination.limit), 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={
              searchTerm || statusFilter !== "all"
                ? pagination.page >=
                  Math.max(
                    Math.ceil(filteredSalesOrders.length / pagination.limit),
                    1
                  )
                : pagination.page >=
                  Math.max(Math.ceil(pagination.total / pagination.limit), 1)
            }>
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000069]">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-muted-foreground">
              Are you sure you want to delete this sales order? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setOrderToDelete(null);
                }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
