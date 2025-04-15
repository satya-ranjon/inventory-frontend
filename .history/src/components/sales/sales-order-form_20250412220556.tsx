import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { salesOrderSchema, type SalesOrderFormValues } from "@/lib/schemas";
import { useSalesOrders } from "@/hooks/use-sales-orders";
import { toast } from "sonner";

interface SalesOrderFormProps {
  salesOrder?: SalesOrderFormValues;
  customers: { _id: string; displayName: string }[];
  items: { _id: string; name: string; sku: string; sellingPrice: number }[];
}

// Add this type guard function above your component
const isValidStatus = (
  status: string | undefined
): status is "Draft" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" => {
  return (
    status === "Draft" ||
    status === "Confirmed" ||
    status === "Shipped" ||
    status === "Delivered" ||
    status === "Cancelled" ||
    status === undefined
  );
};

export function SalesOrderForm({
  salesOrder,
  customers,
  items,
}: SalesOrderFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isCalculating, setIsCalculating] = useState(false);

  // Use the React Query hook for API operations
  const { createSalesOrder, updateSalesOrder, isCreating, isUpdating } =
    useSalesOrders(id);

  // Get the status with proper type-checking
  const orderStatus = salesOrder?.status;
  const validStatus = isValidStatus(orderStatus) ? orderStatus : "Draft";

  // Form default values
  const defaultValues: Partial<SalesOrderFormValues> = {
    customer:
      typeof salesOrder?.customer === "object" && salesOrder?.customer !== null
        ? (salesOrder.customer as { _id: string })._id
        : (salesOrder?.customer ?? ""),
    salesOrderDate: salesOrder?.salesOrderDate
      ? new Date(salesOrder.salesOrderDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    paymentTerms: salesOrder?.paymentTerms || "Net 30",
    status: validStatus,
    items: (salesOrder?.items?.length
      ? salesOrder.items.map((item) => ({
          item:
            typeof item.item === "object" && item.item !== null
              ? (item.item as { _id: string })._id
              : ((item.item as string) ?? ""),
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          _id: item._id,
          tax: item.tax,
        }))
      : [
          {
            item: "",
            quantity: 1,
            rate: 0,
            amount: 0,
            _id: undefined,
            tax: undefined,
          },
        ]) as [
      {
        item: string;
        quantity: number;
        rate: number;
        amount: number | undefined;
        _id?: string;
        tax?: string;
      },
    ],
  };

  // Initialize the form
  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues,
  });

  // Initialize field array for dynamic order items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate totals when items change
  const watchItems = form.watch("items");
  const [subTotal, setSubTotal] = useState<number>(salesOrder?.subTotal || 0);
  const [total, setTotal] = useState<number>(salesOrder?.total || 0);

  // Calculate totals whenever watchItems changes
  useEffect(() => {
    calculateTotals();
  }, [watchItems]);

  const calculateTotals = () => {
    if (isCalculating || !watchItems) return;
    setIsCalculating(true);

    try {
      const calculatedSubTotal = watchItems.reduce(
        (sum, item) => sum + (item.quantity * item.rate || 0),
        0
      );

      setSubTotal(calculatedSubTotal);
      setTotal(calculatedSubTotal); // In a real app, you'd add tax, shipping, etc.
    } finally {
      setIsCalculating(false);
    }
  };

  // Add new order item
  const addOrderItem = () => {
    append({
      item: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    });
  };

  // Update item rate when item selection changes
  const updateItemRate = (index: number, itemId: string) => {
    const selectedItem = items.find((i) => i._id === itemId);
    if (selectedItem) {
      const rate = selectedItem.sellingPrice || 0;
      form.setValue(`items.${index}.rate`, rate);

      // Also update amount
      const quantity = form.getValues(`items.${index}.quantity`) || 0;
      form.setValue(`items.${index}.amount`, rate * quantity);
    }
  };

  // Update amount when quantity or rate changes
  const updateAmount = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`) || 0;
    const rate = form.getValues(`items.${index}.rate`) || 0;
    form.setValue(`items.${index}.amount`, rate * quantity);
  };

  // Handle form submission
  const onSubmit = async (data: SalesOrderFormValues) => {
    try {
      const orderData = {
        ...data,
        subTotal,
        total,
      };

      if (salesOrder?._id) {
        updateSalesOrder({
          id: salesOrder._id,
          data: orderData,
        });
        toast.success("Sales order updated successfully");
      } else {
        createSalesOrder(orderData);
        toast.success("Sales order created successfully");
      }
      navigate("/dashboard/sales");
    } catch (error) {
      console.error("Error saving sales order:", error);
      toast.error("Failed to save sales order");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer._id} value={customer._id}>
                            {customer.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesOrderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Due on Receipt">
                          Due on Receipt
                        </SelectItem>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Order Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOrderItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground">
                          No items added. Click "Add Item" to add items to this
                          order.
                        </TableCell>
                      </TableRow>
                    ) : (
                      fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.item`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      updateItemRate(index, value);
                                    }}
                                    value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select item" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {items.map((item) => (
                                        <SelectItem
                                          key={item._id}
                                          value={item._id}>
                                          {item.name} ({item.sku})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(
                                          parseInt(e.target.value) || 0
                                        );
                                        updateAmount(index);
                                      }}
                                      value={field.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.rate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        );
                                        updateAmount(index);
                                      }}
                                      value={field.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            $
                            {form
                              .getValues(`items.${index}.amount`)
                              ?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || fields.length === 0}>
              {isLoading
                ? "Saving..."
                : salesOrder
                  ? "Update Sales Order"
                  : "Create Sales Order"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
