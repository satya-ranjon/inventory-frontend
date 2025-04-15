import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { Plus, Trash2, Paperclip, X } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UploadButton } from "../ui/upload-button";
import { salesOrderSchema, type SalesOrderFormValues } from "../../lib/schemas";
import { useSalesOrders } from "../../hooks/use-sales-orders";
import { toast } from "sonner";

interface SalesOrderFormProps {
  salesOrder?: SalesOrderFormValues & {
    subTotal?: number;
    total?: number;
    _id?: string;
  };
  customers: {
    _id: string;
    displayName: string;
  }[];
  items: {
    _id: string;
    name: string;
    sku: string;
    sellingPrice: number;
    tax?: string;
  }[];
}

// Status badge type for consistent styling
type OrderStatus =
  | "Draft"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "Draft", label: "Draft", color: "bg-gray-400" },
  { value: "Confirmed", label: "Confirmed", color: "bg-blue-500" },
  { value: "Shipped", label: "Shipped", color: "bg-green-500" },
  { value: "Delivered", label: "Delivered", color: "bg-green-700" },
  { value: "Cancelled", label: "Cancelled", color: "bg-red-500" },
];

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
  const [uploadedFiles, setUploadedFiles] = useState<
    { fileName: string; fileUrl: string }[]
  >(salesOrder?.attachments || []);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Use the React Query hook for API operations
  const { createSalesOrder, updateSalesOrder, isCreating, isUpdating } =
    useSalesOrders(id);

  // Get the status with proper type-checking
  const orderStatus = salesOrder?.status;
  const validStatus = isValidStatus(orderStatus) ? orderStatus : "Draft";

  // Calculate initial values for subtotal and total
  const initialSubTotal = salesOrder?.subTotal || 0;
  const initialTotal = salesOrder?.total || 0;

  // State for calculated totals
  const [subTotal, setSubTotal] = useState<number>(initialSubTotal);
  const [total, setTotal] = useState<number>(initialTotal);

  // Form default values
  const defaultValues: Partial<SalesOrderFormValues> = {
    customer:
      typeof salesOrder?.customer === "object" && salesOrder?.customer !== null
        ? (salesOrder.customer as { _id: string })._id
        : (salesOrder?.customer ?? ""),
    reference: salesOrder?.reference || "",
    salesOrderDate: salesOrder?.salesOrderDate
      ? new Date(salesOrder.salesOrderDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    expectedShipmentDate: salesOrder?.expectedShipmentDate
      ? new Date(salesOrder.expectedShipmentDate).toISOString().split("T")[0]
      : "",
    paymentTerms: salesOrder?.paymentTerms || "Net 30",
    deliveryMethod: salesOrder?.deliveryMethod || "",
    salesPerson: salesOrder?.salesPerson || "",
    items: salesOrder?.items,
    discount: salesOrder?.discount || {
      type: "percentage",
      value: 0,
    },
    shippingCharges: salesOrder?.shippingCharges || 0,
    adjustment: salesOrder?.adjustment || 0,
    customerNotes: salesOrder?.customerNotes || "",
    termsAndConditions: salesOrder?.termsAndConditions || "",
    status: validStatus,
    attachments: salesOrder?.attachments || [],
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

  // Add initial items if needed
  useEffect(() => {
    if (fields.length === 0) {
      if (salesOrder?.items?.length) {
        // Add existing items from salesOrder
        salesOrder.items.forEach((item) => {
          append({
            item:
              typeof item.item === "object" && item.item !== null
                ? (item.item as { _id: string })._id
                : ((item.item as string) ?? ""),
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            _id: item._id,
            tax: item.tax || "0",
          });
        });
      } else {
        // Add one empty item
        append({
          item: "",
          quantity: 1,
          rate: 0,
          amount: 0,
          tax: "0",
        });
      }
    }
  }, [append, fields.length, salesOrder]);

  // Calculate totals whenever watchItems changes
  const watchItems = form.watch("items");
  const watchDiscount = form.watch("discount");
  const watchShippingCharges = form.watch("shippingCharges");
  const watchAdjustment = form.watch("adjustment");

  useEffect(() => {
    calculateTotals();
  }, [watchItems, watchDiscount, watchShippingCharges, watchAdjustment]);

  const calculateTotals = () => {
    if (isCalculating) return;
    setIsCalculating(true);

    try {
      // Calculate subtotal from all items
      const calculatedSubTotal = watchItems.reduce(
        (sum, item) => sum + (item.quantity * item.rate || 0),
        0
      );

      let calculatedTotal = calculatedSubTotal;

      // Apply discount
      if (watchDiscount) {
        if (watchDiscount.type === "percentage") {
          calculatedTotal -= (calculatedTotal * watchDiscount.value) / 100;
        } else {
          calculatedTotal -= watchDiscount.value;
        }
      }

      // Add shipping charges
      if (watchShippingCharges) {
        calculatedTotal += watchShippingCharges;
      }

      // Apply adjustment
      if (watchAdjustment) {
        calculatedTotal += watchAdjustment;
      }

      // Apply tax to the total (if needed)
      const taxAmount = watchItems.reduce((sum, item) => {
        const itemAmount = item.quantity * item.rate || 0;
        const taxPercentage = item.tax ? parseFloat(item.tax) : 0;
        return sum + (itemAmount * taxPercentage) / 100;
      }, 0);

      calculatedTotal += taxAmount;

      setSubTotal(calculatedSubTotal);
      setTotal(calculatedTotal);
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
      tax: "0",
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
      const amount = rate * quantity;
      form.setValue(`items.${index}.amount`, amount);

      // Set tax from item if available
      if (selectedItem.tax) {
        form.setValue(`items.${index}.tax`, selectedItem.tax);
      }
    }
  };

  // Update amount when quantity or rate changes
  const updateAmount = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`) || 0;
    const rate = form.getValues(`items.${index}.rate`) || 0;
    const amount = rate * quantity;
    form.setValue(`items.${index}.amount`, amount);

    // Recalculate totals after changing amounts
    calculateTotals();
  };

  // Upload file to server
  const handleFileUpload = async (file: File) => {
    // In a real application, you would upload the file to your server or storage
    // For this example, we'll simulate a successful upload
    setUploading(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add the file to the uploaded files array
      setUploadedFiles([
        ...uploadedFiles,
        {
          fileName: file.name,
          fileUrl: `https://storage.example.com/documents/${file.name}`,
        },
      ]);

      // Update form's attachments value
      const currentAttachments = form.getValues("attachments") || [];
      form.setValue("attachments", [
        ...currentAttachments,
        {
          fileName: file.name,
          fileUrl: `https://storage.example.com/documents/${file.name}`,
        },
      ]);

      setCurrentFile(null);
      toast.success(`File ${file.name} uploaded successfully`);
    } catch (error) {
      toast.error("Failed to upload file");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Remove a file from the uploads
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);

    // Update form's attachments value
    form.setValue("attachments", newFiles);
  };

  // Handle form submission
  const onSubmit = async (data: SalesOrderFormValues) => {
    try {
      // Fix any items with empty or missing fields
      const validatedItems = data.items.map((item) => ({
        ...item,
        tax: item.tax || "0",
        amount: item.quantity * item.rate || 0,
      }));

      // Create a new object with the validated data and calculated totals
      const orderData = {
        ...data,
        items: validatedItems,
        subTotal,
        total,
      };

      if (salesOrder?._id) {
        updateSalesOrder({
          id: salesOrder._id,
          data: orderData as unknown as SalesOrderFormValues,
        });
        toast.success("Sales order updated successfully");
      } else {
        createSalesOrder(orderData as unknown as SalesOrderFormValues);
        toast.success("Sales order created successfully");
      }
      navigate("/dashboard/sales");
    } catch (error) {
      console.error("Error saving sales order:", error);
      toast.error("Failed to save sales order");
    }
  };

  // Check if form is in loading state
  const isLoading = isCreating || isUpdating || uploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
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
                  name="expectedShipmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Shipment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="Purchase order number" {...field} />
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
                        value={field.value}>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
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
                            <FormField
                              control={form.control}
                              name={`items.${index}.tax`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        calculateTotals();
                                      }}
                                      value={field.value || "0"}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            $
                            {(
                              form.getValues(`items.${index}.quantity`) *
                              form.getValues(`items.${index}.rate`)
                            ).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 1}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={addOrderItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>

                <div className="w-64 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${subTotal.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="discount.type"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Discount Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                              <SelectItem value="amount">
                                Fixed Amount
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discount.value"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value) || 0);
                                calculateTotals();
                              }}
                              value={field.value}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingCharges"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-2 items-center gap-2">
                        <FormLabel className="text-muted-foreground">
                          Shipping:
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              calculateTotals();
                            }}
                            value={field.value}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adjustment"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-2 items-center gap-2">
                        <FormLabel className="text-muted-foreground">
                          Adjustment:
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              calculateTotals();
                            }}
                            value={field.value}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">
                Notes & Terms
              </TabsTrigger>
              <TabsTrigger value="files" className="flex-1">
                Files & Attachments
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex-1">
                Shipping Info
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="customerNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="These notes will appear on the sales order"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Standard terms and conditions"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="files" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Attachments</h3>

                    <div className="grid gap-4">
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">
                            Uploaded Files
                          </h4>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {file.fileName}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFile(index)}
                                  className="h-6 w-6">
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Upload Documents
                        </h4>
                        <UploadButton
                          existingFiles={uploadedFiles}
                          onFileRemove={removeFile}
                          onUploadComplete={(files) => {
                            // Update form's attachments value
                            const currentAttachments =
                              form.getValues("attachments") || [];
                            const newAttachments = [
                              ...currentAttachments,
                              ...files,
                            ];

                            form.setValue("attachments", newAttachments);
                            setUploadedFiles((prevFiles) => [
                              ...prevFiles,
                              ...files,
                            ]);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Method</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Standard Shipping, Express"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salesPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sales Person</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/sales")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || fields.length === 0}>
              {isLoading
                ? "Saving..."
                : salesOrder?._id
                  ? "Update Sales Order"
                  : "Create Sales Order"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
