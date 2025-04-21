import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Package,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Tag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
  due: number;
  createdAt: string;
  updatedAt: string;
}

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" className="mr-4" asChild>
          <Link to="/dashboard/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>
              Customer since{" "}
              {customer.createdAt
                ? formatDistanceToNow(new Date(customer.createdAt), {
                    addSuffix: true,
                  })
                : "N/A"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{customer.customerName}</p>
                <Badge variant="outline" className="mt-1">
                  {customer.customerType}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <p>{customer.email || "No email provided"}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <p>{customer.contactNumber || "No contact number provided"}</p>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <p>{customer.address || "No address provided"}</p>
            </div>

            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Outstanding Balance
                </p>
                <p className="text-xl font-bold">
                  $
                  {Number(customer.due).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed by
              this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
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
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {new Date(
                              order.salesOrderDate
                            ).toLocaleDateString()}
                          </div>
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
                        <TableCell>
                          $
                          {Number(order.total).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          $
                          {Number(order.payment).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          $
                          {Number(order.due).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        {orders.length > 0 && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Detailed information about each order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="border rounded-lg p-4">
                  <div className="flex flex-wrap justify-between items-center mb-4">
                    <div>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                          {order.orderNumber}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on{" "}
                        {new Date(order.salesOrderDate).toLocaleDateString()}
                      </p>
                    </div>
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
                  </div>

                  <div className="rounded-md border mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={`${order._id}-item-${index}`}>
                            <TableCell>{item.item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.rate.toFixed(2)}</TableCell>
                            <TableCell>
                              ${(item.discount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>${item.amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Payment Information</h4>
                      <p>
                        <span className="text-muted-foreground">
                          Payment Terms:
                        </span>{" "}
                        {order.paymentTerms}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          Reference:
                        </span>{" "}
                        {order.reference || "N/A"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          Sales Person:
                        </span>{" "}
                        {order.salesPerson || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Shipping Information</h4>
                      <p>
                        <span className="text-muted-foreground">
                          Delivery Method:
                        </span>{" "}
                        {order.deliveryMethod}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Customer Notes</h4>
                      <p className="text-sm whitespace-pre-line">
                        {order.customerNotes || "No notes provided"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>${order.subTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Discount (
                          {order.discount.type === "percentage"
                            ? `${order.discount.value}%`
                            : `$${order.discount.value}`}
                          ):
                        </span>
                        <span>
                          -$
                          {(order.discount.type === "percentage"
                            ? (order.subTotal * order.discount.value) / 100
                            : order.discount.value
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Shipping Charges:
                        </span>
                        <span>${order.shippingCharges.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Adjustment:
                        </span>
                        <span>${order.adjustment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Paid:</span>
                        <span>${order.payment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600 font-bold">
                        <span>Balance Due:</span>
                        <span>${order.due.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
