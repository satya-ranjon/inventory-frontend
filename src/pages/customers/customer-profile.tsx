import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Package,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Banknote,
  BarChart3,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

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
  customer?: {
    _id: string;
    customerName: string;
    email: string;
    contactNumber?: string;
    address?: string;
  };
}

// Define SalesOrder as an alias to Order
type SalesOrder = Order;

interface Customer {
  _id: string;
  customerName: string;
  customerType: "Individual" | "Business";
  email: string;
  contactNumber: string;
  address: string;
  due: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
}

interface CustomerProfileData {
  customer: Customer;
  orders: Order[];
}

export function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<CustomerProfileData | null>(
    null
  );

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await apiClient.get(`/customers/${id}`);
        setProfileData(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching customer profile:", err);
        setError("Failed to load customer profile");
        toast.error("Something went wrong while fetching customer data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold mb-1">
          Failed to load customer profile
        </h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the customer data
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const { customer, orders } = profileData;

  // Calculate customer metrics
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const paidOrders = orders.filter((order) => order.due === 0).length;
  const paymentRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;
  const latestOrder =
    orders.length > 0
      ? orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get status badge color based on status
  const getStatusColor = (status: string) => {
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} tk`;
  };

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
              <img style="width: 50px; height: 50px;" src="https://i.ibb.co.com/Z1zKNVkp/material-management.png" alt="logo" />
                <h2>Inventory Management System</h2>
                <p>Dhaka, Bangladesh</p>
                <p>Mobile: +8801717171717 (Office)</p>
                <p>Mobile: +8801717171717 (Sales)</p>
                <p>Email: inventory@gmail.com</p>
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
                  <p><strong>Address:</strong> ${sale.customer?.address || "N/A"}</p>
                  <p><strong>Phone:</strong> ${sale.customer?.contactNumber || "N/A"}</p>
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
            
            <div style="display: flex; justify-content: space-between; gap: 1rem; margin-top: 1rem;">
              <!-- Notes and Terms Side-by-Side -->
              <div style="flex: 1; max-width: 60%;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <!-- Customer Notes -->
                  <div>
                    <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem; color: #4b5563;">Customer Notes</h3>
                    <p style="font-size: 0.75rem; white-space: pre-line;  padding: 0.5rem; min-height: 60px;  background-color: #f9fafb; line-height: 1.3;">
                      ${sale.customerNotes || "No customer notes"}
                    </p>
                  </div>
                  
                  <!-- Terms and Conditions -->
                  <div>
                    <h3 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem; color: #4b5563;">Terms and Conditions</h3>
                    <p style="font-size: 0.75rem; white-space: pre-line;   padding: 0.5rem; min-height: 60px;  background-color: #f9fafb; line-height: 1.3;">
                      ${sale.termsAndConditions || "No terms and conditions"}
                    </p>
                  </div>
                </div>
              </div>
            
              <!-- Summary -->
              <div style="min-width: 40%;">
                <div style=" padding: 0.5rem; background-color: #f9fafb;">
                  <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; color: #4b5563; font-size: 0.75rem;">
                    <span><strong>Subtotal:</strong></span>
                    <span>${formatCurrency(sale.subTotal)}</span>
                  </div>
                  
                  ${
                    sale.discount.value > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; color: #4b5563; font-size: 0.75rem;">
                    <span><strong>Discount ${sale.discount.type === "percentage" ? `(${sale.discount.value}%)` : ""}:</strong></span>
                    <span>${formatCurrency(calculateDiscountAmount())}</span>
                  </div>
                  `
                      : ""
                  }
                  
                  ${
                    sale.shippingCharges > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; color: #4b5563; font-size: 0.75rem;">
                    <span><strong>Shipping:</strong></span>
                    <span>${formatCurrency(sale.shippingCharges)}</span>
                  </div>
                  `
                      : ""
                  }
                  
                  ${
                    sale.adjustment !== 0
                      ? `
                  <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; color: #4b5563; font-size: 0.75rem;">
                    <span><strong>Adjustment:</strong></span>
                    <span>${formatCurrency(sale.adjustment)}</span>
                  </div>
                  `
                      : ""
                  }
                  
                  <div style="display: flex; justify-content: space-between; margin: 0.25rem 0; padding-top: 0.25rem; border-top: 1px solid #e5e7eb; font-weight: 700; font-size: 0.75rem;">
                    <span>Total:</span>
                    <span>${formatCurrency(sale.total)}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; color: #059669; font-size: 0.75rem;">
                    <span><strong>Amount Paid:</strong></span>
                    <span>${formatCurrency(sale.payment)}</span>
                  </div>
                  
                  ${
                    sale.previousDue > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; color: #9f1239; font-size: 0.75rem;">
                    <span>Previous Due:</span>
                    <span>${formatCurrency(sale.previousDue)}</span>
                  </div>
                  `
                      : ""
                  }
                  
                  ${
                    sale.due > 0
                      ? `
                  <div style="display: flex; justify-content: space-between; margin-top: 0.25rem; padding-top: 0.25rem; border-top: 1px solid #e5e7eb; color: #dc2626; font-weight: 700; font-size: 0.75rem;">
                    <span>Balance Due:</span>
                    <span>${formatCurrency(sale.due)}</span>
                  </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
            
            <div style="margin-top: 0.75rem; font-size: 0.75rem; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 0.5rem;">
              <p>Thank you for your business!</p>
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
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link to="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Customer Profile</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1 w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-lg bg-primary/10">
                  {getInitials(customer.customerName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{customer.customerName}</h2>
              <Badge variant="secondary" className="mt-1 mb-2">
                {customer.customerType}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Customer since{" "}
                {format(new Date(customer.createdAt), "MMM yyyy")}
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {customer.email || "No email provided"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {customer.contactNumber || "No contact number provided"}
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">
                  {customer.address || "No address provided"}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Outstanding Balance</span>
                <span className="font-bold">
                  Tk{" "}
                  {Number(customer.due).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Orders</span>
                <span className="font-bold">{totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Lifetime Value</span>
                <span className="font-bold">
                  Tk{" "}
                  {totalSpent.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {/* Overview Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Spent</CardDescription>
                  <CardTitle className="text-2xl">
                    Tk{" "}
                    {totalSpent.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Banknote className="h-3 w-3 mr-1" />
                    Across {totalOrders} orders
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Order</CardDescription>
                  <CardTitle className="text-2xl">
                    Tk{" "}
                    {avgOrderValue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    {paidOrders} paid of {totalOrders} orders
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Payment Rate</CardDescription>
                  <CardTitle className="text-2xl">
                    {paymentRate.toFixed(0)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={paymentRate} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-2 flex items-center">
                    <CreditCard className="h-3 w-3 mr-1" />
                    {paidOrders} fully paid orders
                  </div>
                </CardContent>
              </Card>
            </div>

            {latestOrder && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Latest Order</CardTitle>
                  </div>
                  <CardDescription>
                    Order #{latestOrder.orderNumber} •{" "}
                    {format(new Date(latestOrder.salesOrderDate), "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(latestOrder.status)}`}></div>
                        <p>{latestOrder.status}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total</p>
                      <p>
                        Tk{" "}
                        {Number(latestOrder.total).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Payment</p>
                      <p>
                        {latestOrder.due === 0
                          ? "Fully Paid"
                          : `Tk ${Number(latestOrder.payment).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )} / ${Number(latestOrder.total).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`}
                      </p>
                    </div>
                  </div>

                  {latestOrder.items.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Items</h4>
                        <div className="space-y-2">
                          {latestOrder.items
                            .slice(0, 3)
                            .map((orderItem, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center py-1">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                                    <Package className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {orderItem.item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {orderItem.quantity} x Tk{" "}
                                      {orderItem.rate.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-medium">
                                  Tk{" "}
                                  {orderItem.amount.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                            ))}
                          {latestOrder.items.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{latestOrder.items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Orders Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order History</CardTitle>
                </div>
                <CardDescription>
                  {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                  by this customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Package className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold mb-1">
                      No orders yet
                    </h3>
                    <p className="text-muted-foreground">
                      This customer hasn't placed any orders yet.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Due</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow
                            key={order._id}
                            className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`h-2 w-2 rounded-full ${getStatusColor(order.status)}`}></div>
                                <span>{order.orderNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <HoverCard>
                                <HoverCardTrigger>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {format(
                                      new Date(order.salesOrderDate),
                                      "PP"
                                    )}
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <p className="text-sm">
                                      <span className="font-medium">
                                        Created:{" "}
                                      </span>
                                      {format(new Date(order.createdAt), "PPp")}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-medium">
                                        Last Updated:{" "}
                                      </span>
                                      {format(new Date(order.updatedAt), "PPp")}
                                    </p>
                                    {order.salesPerson && (
                                      <p className="text-sm">
                                        <span className="font-medium">
                                          Sales Person:{" "}
                                        </span>
                                        {order.salesPerson}
                                      </p>
                                    )}
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.status === "Shipped"
                                    ? "default"
                                    : order.status === "Pending"
                                      ? "secondary"
                                      : order.status === "Delivered"
                                        ? "default"
                                        : "outline"
                                }>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              Tk{" "}
                              {Number(order.total).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              Tk{" "}
                              {Number(order.payment).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  order.due > 0
                                    ? "text-red-500 font-medium"
                                    : ""
                                }>
                                Tk{" "}
                                {Number(order.due).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  printSalesOrder(order);
                                }}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
