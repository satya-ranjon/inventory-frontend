import { useState, useEffect } from "react";
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
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Customer {
  _id: string;
  customerName?: string;
  email?: string;
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
    limit: 10,
    total: 0,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const fetchSalesOrders = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `/sales-orders?page=${pagination.page}&limit=${pagination.limit}`
      );
      setSalesOrders(response.data.data || []);
      setPagination({
        page: response.data.meta.page,
        limit: response.data.meta.limit,
        total: response.data.meta.total,
      });
    } catch (err) {
      console.error("Error fetching sales orders:", err);
      toast.error("Something went wrong while fetching sales orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
  }, [pagination.page, pagination.limit]);

  const handleRefresh = () => {
    fetchSalesOrders();
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
    return `${amount.toFixed(2)} tk`;
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

      // Business info - replace with your actual business details
      const businessInfo = {
        name: "Your Business Name",
        logo: "https://placehold.co/200x100/4f46e5/ffffff?text=Your+Logo", // Replace with your logo URL
        address: "123 Business Street, City, Country",
        phone: "+1 234 567 8900",
        email: "contact@yourbusiness.com",
        website: "www.yourbusiness.com",
        taxId: "TAX-123456789",
      };

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Order #${sale.orderNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            :root {
              --primary-color: #4f46e5;
              --text-color: #374151;
              --border-color: #e5e7eb;
              --light-bg: #f9fafb;
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              color: var(--text-color);
              line-height: 1.5;
              padding: 2rem;
              max-width: 850px;
              margin: 0 auto;
            }
            
            .invoice-container {
              border: 1px solid var(--border-color);
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              background: white;
              overflow: hidden;
            }
            
            .invoice-header {
              display: flex;
              justify-content: space-between;
              padding: 2rem;
              background-color: var(--light-bg);
              border-bottom: 1px solid var(--border-color);
            }
            
            .logo-container {
              display: flex;
              flex-direction: column;
            }
            
            .logo {
              max-width: 200px;
              height: auto;
              margin-bottom: 0.5rem;
            }
            
            .invoice-title {
              color: var(--primary-color);
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 0.5rem;
            }
            
            .invoice-details {
              text-align: right;
            }
            
            .invoice-id {
              font-size: 1.1rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            
            .invoice-date {
              color: #6b7280;
              margin-bottom: 0.5rem;
            }
            
            .status {
              display: inline-block;
              padding: 0.35rem 0.75rem;
              border-radius: 0.375rem;
              font-size: 0.875rem;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .draft { background-color: #f3f4f6; color: #4b5563; }
            .confirmed { background-color: #e0f2fe; color: #0369a1; }
            .shipped { background-color: #fef3c7; color: #b45309; }
            .delivered { background-color: #d1fae5; color: #047857; }
            .cancelled { background-color: #fee2e2; color: #b91c1c; }
            
            .section {
              padding: 2rem;
              border-bottom: 1px solid var(--border-color);
            }
            
            .section-title {
              font-size: 1.1rem;
              font-weight: 600;
              color: var(--primary-color);
              margin-bottom: 1rem;
            }
            
            .columns {
              display: flex;
              justify-content: space-between;
              gap: 2rem;
            }
            
            .column {
              flex: 1;
            }
            
            .info-line {
              margin-bottom: 0.5rem;
            }
            
            .info-label {
              font-weight: 500;
              color: #6b7280;
              margin-right: 0.5rem;
            }
            
            .info-value {
              font-weight: 600;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
            }
            
            thead {
              background-color: var(--light-bg);
            }
            
            th {
              color: #6b7280;
              font-weight: 500;
              padding: 0.75rem 1rem;
              text-align: left;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-bottom: 1px solid var(--border-color);
            }
            
            td {
              padding: 1rem;
              border-bottom: 1px solid var(--border-color);
              vertical-align: top;
            }
            
            .amount {
              text-align: right;
            }
            
            .quantity {
              text-align: center;
            }
            
            .summary {
              padding: 1.5rem 2rem;
              border-top: 1px solid var(--border-color);
              display: flex;
              justify-content: flex-end;
            }
            
            .summary-table {
              width: 300px;
              border-collapse: collapse;
            }
            
            .summary-table td {
              padding: 0.4rem 0;
              border: none;
            }
            
            .summary-table .label {
              color: #6b7280;
            }
            
            .summary-table .value {
              text-align: right;
              font-weight: 500;
            }
            
            .summary-table .total {
              font-weight: 700;
              color: var(--primary-color);
              font-size: 1.1rem;
            }
            
            .footer {
              padding: 2rem;
              text-align: center;
              color: #6b7280;
              font-size: 0.875rem;
            }
            
            .notes {
              padding: 1.5rem 2rem;
              background-color: var(--light-bg);
              border-top: 1px solid var(--border-color);
            }
            
            .company-details {
              padding: 1.5rem 2rem;
              background-color: var(--light-bg);
              text-align: center;
              color: #6b7280;
              font-size: 0.875rem;
              border-top: 1px solid var(--border-color);
            }
            
            .print-button {
              display: block;
              margin: 1.5rem auto;
              padding: 0.75rem 1.5rem;
              background-color: var(--primary-color);
              color: white;
              border: none;
              border-radius: 0.375rem;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.15s ease;
            }
            
            .print-button:hover {
              background-color: #4338ca;
            }
            
            @media print {
              body {
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .invoice-container {
                border: none;
                box-shadow: none;
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
              <div class="logo-container">
                <img src="${businessInfo.logo}" alt="${businessInfo.name} Logo" class="logo">
                <div>${businessInfo.name}</div>
              </div>
              <div class="invoice-details">
                <div class="invoice-title">SALES ORDER</div>
                <div class="invoice-id">#${sale.orderNumber}</div>
                <div class="invoice-date">Date: ${new Date(sale.salesOrderDate).toLocaleDateString()}</div>
                <div class="status ${sale.status.toLowerCase()}">${sale.status}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="columns">
                <div class="column">
                  <div class="section-title">Company Info</div>
                  <div class="info-line">${businessInfo.name}</div>
                  <div class="info-line">${businessInfo.address}</div>
                  <div class="info-line">Phone: ${businessInfo.phone}</div>
                  <div class="info-line">Email: ${businessInfo.email}</div>
                  <div class="info-line">Tax ID: ${businessInfo.taxId}</div>
                </div>
                <div class="column">
                  <div class="section-title">Customer Info</div>
                  <div class="info-line">
                    <span class="info-value">${sale.customer?.customerName || "N/A"}</span>
                  </div>
                  ${sale.customer?.email ? `<div class="info-line">Email: ${sale.customer.email}</div>` : ""}
                  <div class="info-line">Reference: ${sale.reference || "N/A"}</div>
                  <div class="info-line">Payment Terms: ${sale.paymentTerms || "N/A"}</div>
                  <div class="info-line">Sales Person: ${sale.salesPerson || "N/A"}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Order Items</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 40%;">Item</th>
                    <th class="quantity" style="width: 15%;">Quantity</th>
                    <th class="amount" style="width: 20%;">Rate</th>
                    <th class="amount" style="width: 25%;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${sale.items
                    .map(
                      (item) => `
                    <tr>
                      <td>${item.item.name}</td>
                      <td class="quantity">${item.quantity}</td>
                      <td class="amount">${formatCurrency(item.rate)}</td>
                      <td class="amount">${formatCurrency(item.amount)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            
            <div class="summary">
              <table class="summary-table">
                <tr>
                  <td class="label">Subtotal:</td>
                  <td class="value">${formatCurrency(sale.total - (sale.due || 0))}</td>
                </tr>
                ${
                  sale.due
                    ? `
                <tr>
                  <td class="label">Due Amount:</td>
                  <td class="value">${formatCurrency(sale.due)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td class="label">Total:</td>
                  <td class="value total">${formatCurrency(sale.total)}</td>
                </tr>
                <tr>
                  <td class="label">Paid:</td>
                  <td class="value">${formatCurrency(sale.payment)}</td>
                </tr>
                <tr>
                  <td class="label">Balance Due:</td>
                  <td class="value">${formatCurrency(sale.due)}</td>
                </tr>
              </table>
            </div>
            
            <div class="company-details">
              <div>${businessInfo.name} | ${businessInfo.address}</div>
              <div>${businessInfo.phone} | ${businessInfo.email} | ${businessInfo.website}</div>
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
    if (!salesOrders.length) return { total: 0, paid: 0, due: 0, count: 0 };

    return salesOrders.reduce(
      (acc, order) => {
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

  const summary = getSummary();

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
                <span className="text-3xl font-bold">{summary.count}</span>
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
                  {formatCurrency(summary.total)}
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
                  {formatCurrency(summary.paid)}
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
                  {formatCurrency(summary.due)}
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
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
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
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-20 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredSalesOrders.length > 0 ? (
              filteredSalesOrders.map((sale) => (
                <TableRow
                  key={sale._id}
                  className="group hover:bg-muted/30 cursor-pointer"
                  onClick={() => navigate(`/sales/${sale._id}`)}>
                  <TableCell className="font-medium">
                    #{sale.orderNumber.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {sale.customer?.customerName ||
                          sale.customer?.email ||
                          "N/A"}
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
                        <span>
                          {format(new Date(sale.salesOrderDate), "MMM d, yyyy")}
                        </span>
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
                      {sale.payment > 0 && (
                        <span className="text-xs text-green-600">
                          {formatCurrency(sale.payment)} paid
                        </span>
                      )}
                      {sale.total > sale.payment && (
                        <span className="text-xs text-red-600">
                          {formatCurrency(sale.total - sale.payment)} due
                        </span>
                      )}
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
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(sale._id);
                        }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm || statusFilter !== "all" ? (
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
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShoppingCart className="h-8 w-8 mb-2" />
                      <p>No sales orders found</p>
                      <div className="mt-2">
                        <SalesForm onSuccess={handleRefresh} />
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
