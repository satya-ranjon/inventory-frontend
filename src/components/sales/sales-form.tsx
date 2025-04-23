import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import {
  CalendarIcon,
  Edit,
  Plus,
  Trash,
  X,
  Info,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Item } from "@/pages/items/items-page";
import { SalesFormValues, salesSchema } from "@/lib/schemas";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Define the types based on the API response
interface Customer {
  _id: string;
  customerName: string;
  contactNumber: string;
  email?: string;
  address?: string;
  customerType: "Business" | "Individual";
  due?: number;
}

// Function to generate default notes and terms
const generateDefaultContent = () => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "MMMM d, yyyy");

  // Default customer notes
  const defaultNotes =
    `Thank you for your business on ${formattedDate}. We appreciate your prompt payment.\n\n` +
    `For any questions regarding this invoice, please contact our support team.`;

  // Default terms and conditions
  const defaultTerms =
    `PAYMENT TERMS:\n` +
    `1. Payment is due within the agreed payment terms.\n` +
    `2. Late payments may incur a service charge of 1.5% per month.\n\n` +
    `DELIVERY & RETURNS:\n` +
    `1. Goods once sold cannot be returned without prior authorization.\n` +
    `2. Delivery times are estimates and may vary based on availability.\n` +
    `3. Please inspect all items upon delivery. Claims for damaged goods must be made within 48 hours.\n\n` +
    `WARRANTY:\n` +
    `1. Warranty claims must be accompanied by proof of purchase.\n` +
    `2. Warranty period varies by product and is specified in product documentation.\n\n` +
    `Last updated: ${formattedDate}`;

  return { defaultNotes, defaultTerms };
};

export function SalesForm({
  initialData,
  id,
  onSuccess,
}: {
  initialData?: Partial<SalesFormValues>;
  id?: string;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [includePreviousDue, setIncludePreviousDue] = useState(true);

  // Get default notes and terms
  const { defaultNotes, defaultTerms } = generateDefaultContent();

  // Initialize form with default values
  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesSchema),
    defaultValues: initialData || {
      customer: "",
      reference: "",
      salesOrderDate: new Date(),
      paymentTerms: "Net 30",
      deliveryMethod: "Standard Shipping",
      salesPerson: "",
      items: [
        {
          item: "",
          quantity: 1,
          rate: 0,
          amount: 0,
          discount: 0,
        },
      ],
      discount: {
        type: "percentage",
        value: 0,
      },
      shippingCharges: 0,
      adjustment: 0,
      customerNotes: defaultNotes,
      termsAndConditions: defaultTerms,
      status: "Draft",
      payment: 0,
    },
  });

  // Calculate totals
  const calculateItemAmount = (
    quantity: number,
    rate: number,
    discount = 0
  ) => {
    const amount = quantity * rate;
    return discount ? amount - discount : amount;
  };

  const calculateSubTotal = (items: SalesFormValues["items"]) => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTotal = (
    subtotal: number,
    discount: SalesFormValues["discount"],
    shipping: number,
    adjustment: number
  ) => {
    let total = subtotal;

    if (discount.type === "percentage") {
      total = total * (1 - discount.value / 100);
    } else {
      total = total - discount.value;
    }

    total = total + shipping + adjustment;
    return total;
  };

  const calculateCurrentDue = () => {
    const currentTotal = calculateTotal(
      calculateSubTotal(form.watch("items")),
      form.watch("discount"),
      form.watch("shippingCharges"),
      form.watch("adjustment")
    );

    const payment = form.watch("payment") || 0;
    return currentTotal - payment;
  };

  const calculateTotalDue = () => {
    const currentDue = calculateCurrentDue();

    // If we're including previous due and have a selected customer with due
    if (includePreviousDue && selectedCustomer?.due) {
      return currentDue + selectedCustomer.due;
    }

    return currentDue;
  };

  // Fetch customers and items on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, itemsRes] = await Promise.all([
          apiClient.get("/customers"),
          apiClient.get("/items"),
        ]);
        setCustomers(customersRes.data.data || []);
        setItems(itemsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch customer details when a customer is selected
  useEffect(() => {
    const customerId = form.watch("customer");
    if (customerId) {
      const customer = customers.find((c) => c._id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [form.watch("customer"), customers]);

  // Handle form submission
  const onSubmit = async (data: SalesFormValues) => {
    try {
      setIsLoading(true);

      const previousDue =
        includePreviousDue && selectedCustomer?.due ? selectedCustomer.due : 0;

      const formData = {
        ...data,
        previousDue,
        // Calculate current due amount without previous due
        due: calculateTotalDue(),
        includePreviousDue,
      };

      if (id) {
        // Update existing sales order
        const result = await apiClient.patch(`/sales-orders/${id}`, formData);
        if (result.data.success) {
          toast.success("Sales order updated successfully");
          setIsOpen(false);
          if (onSuccess) onSuccess();
        }
      } else {
        // Create new sales order
        const result = await apiClient.post(`/sales-orders/create`, formData);
        if (result.data.success) {
          toast.success("Sales order created successfully");
          setIsOpen(false);
          if (onSuccess) onSuccess();
        }
      }
      form.reset();
    } catch (error) {
      console.error("Error saving sales order:", error);
      toast.error("Failed to save sales order");
    } finally {
      setIsLoading(false);
    }
  };

  // Add and remove item row handlers
  const addItemRow = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      { item: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length === 1) return; // Don't remove the last item
    form.setValue(
      "items",
      currentItems.filter((_, i) => i !== index)
    );
  };

  // Update amount when quantity or rate changes
  const updateItemAmount = (index: number) => {
    const items = form.getValues("items");
    const item = items[index];
    const amount = calculateItemAmount(item.quantity, item.rate, item.discount);
    items[index].amount = amount;
    form.setValue("items", items);
  };

  // Set rate when item is selected
  const handleItemSelection = (itemId: string, index: number) => {
    // Find the selected item from the items array
    const selectedItem = items.find((item) => item._id === itemId);

    if (selectedItem) {
      // Update the rate with the item's price
      const formItems = form.getValues("items");
      formItems[index].rate = selectedItem.price;

      // Update the amount calculation
      formItems[index].amount = calculateItemAmount(
        formItems[index].quantity,
        selectedItem.price,
        formItems[index].discount
      );

      // Update the form values
      form.setValue("items", formItems);
    }
  };

  return (
    <div>
      {/* Dialog Trigger */}
      {id ? (
        <Button size="icon" variant="outline" onClick={() => setIsOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Create Sales Order
        </Button>
      )}

      {/* Custom Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000069]">
          <div className="relative w-full max-w-9/10 max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
              onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <div className="space-y-6 py-2">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-primary">
                  {id ? "Edit Sales Order" : "Create Sales Order"}
                </h3>
                {id && (
                  <Badge
                    variant="outline"
                    className="text-sm font-medium">{`ID: ${id}`}</Badge>
                )}
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="rounded-md border border-muted p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      Order Information
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Customer Selection */}
                      <FormField
                        control={form.control}
                        name="customer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Customer
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between bg-background",
                                      !field.value && "text-muted-foreground"
                                    )}>
                                    {field.value
                                      ? customers.find(
                                          (customer) =>
                                            customer._id === field.value
                                        )?.customerName || "Select a customer"
                                      : "Select a customer"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                  <CommandInput placeholder="Search customer by name..." />
                                  <CommandEmpty>
                                    No customer found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    <CommandList>
                                      {customers.map((customer) => (
                                        <CommandItem
                                          key={customer._id}
                                          value={customer.customerName}
                                          onSelect={() => {
                                            field.onChange(customer._id);
                                          }}>
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === customer._id
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          <span className="font-medium">
                                            {customer.customerName}
                                          </span>
                                          {customer.contactNumber && (
                                            <span className="ml-2 text-muted-foreground">
                                              - {customer.contactNumber}
                                            </span>
                                          )}
                                        </CommandItem>
                                      ))}
                                    </CommandList>
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reference Number */}
                      <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Reference
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="PO number or reference"
                                {...field}
                                className="bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Order Date */}
                      <FormField
                        control={form.control}
                        name="salesOrderDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="font-medium">
                              Order Date
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal bg-background",
                                      !field.value && "text-muted-foreground"
                                    )}>
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Terms */}
                      <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Payment Terms
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Net 30"
                                {...field}
                                className="bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Delivery Method */}
                      <FormField
                        control={form.control}
                        name="deliveryMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Delivery Method
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Standard Shipping"
                                {...field}
                                className="bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Sales Person */}
                      <FormField
                        control={form.control}
                        name="salesPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Sales Person
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Sales representative"
                                {...field}
                                className="bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="rounded-md border border-muted p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Items
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addItemRow}
                        className="gap-1 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary">
                        <Plus className="h-4 w-4" /> Add Item
                      </Button>
                    </div>

                    {/* Item Headers */}
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium bg-muted/30 px-3 py-2 rounded-md">
                      <div className="col-span-4">Item</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-2 text-center">Rate</div>
                      <div className="col-span-2 text-center">Discount</div>
                      <div className="col-span-2 text-center">Amount</div>
                    </div>

                    {/* Dynamic Item Rows */}
                    <div className="space-y-3">
                      {form.watch("items").map((_, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-2 items-end bg-background/50 p-2 rounded-md border border-muted/30 hover:border-muted/50 transition-colors">
                          {/* Item Selection */}
                          <div className="col-span-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.item`}
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormControl>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                              "w-full justify-between",
                                              !field.value &&
                                                "text-muted-foreground"
                                            )}>
                                            {field.value
                                              ? items.find(
                                                  (item) =>
                                                    item._id === field.value
                                                )?.name || "Select an item"
                                              : "Select an item"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                        <Command>
                                          <CommandInput placeholder="Search item by name..." />
                                          <CommandEmpty>
                                            No item found.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            <CommandList>
                                              {items.map((item) => (
                                                <CommandItem
                                                  key={item._id}
                                                  value={item.name}
                                                  onSelect={() => {
                                                    field.onChange(item._id);
                                                    handleItemSelection(
                                                      item._id,
                                                      index
                                                    );
                                                  }}>
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      field.value === item._id
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    )}
                                                  />
                                                  <span className="font-medium">
                                                    {item.name}
                                                  </span>
                                                  <span className="ml-2 text-muted-foreground">
                                                    - {item.price.toFixed(2)} tk
                                                  </span>
                                                </CommandItem>
                                              ))}
                                            </CommandList>
                                          </CommandGroup>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Quantity */}
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      className="text-center"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(Number(e.target.value));
                                        updateItemAmount(index);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Rate */}
                          <div className="col-span-2">
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
                                      className="text-center"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(Number(e.target.value));
                                        updateItemAmount(index);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Discount */}
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.discount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="text-center"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        field.onChange(
                                          e.target.value === ""
                                            ? undefined
                                            : Number(e.target.value)
                                        );
                                        updateItemAmount(index);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Amount (calculated) */}
                          <div className="col-span-1">
                            <FormField
                              control={form.control}
                              name={`items.${index}.amount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      readOnly
                                      className="text-right font-medium bg-muted/20"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Remove button */}
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItemRow(index)}
                              disabled={form.watch("items").length <= 1}
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Notes and Terms */}
                    <div className="space-y-4 rounded-md border border-muted p-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        Additional Information
                      </h4>
                      <FormField
                        control={form.control}
                        name="customerNotes"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel className="font-medium">
                                Customer Notes
                              </FormLabel>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() =>
                                  form.setValue("customerNotes", defaultNotes)
                                }>
                                Reset to Default
                              </Button>
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder="Notes for the customer"
                                className="min-h-[100px] bg-background resize-none"
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
                            <div className="flex justify-between items-center">
                              <FormLabel className="font-medium">
                                Terms and Conditions
                              </FormLabel>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() =>
                                  form.setValue(
                                    "termsAndConditions",
                                    defaultTerms
                                  )
                                }>
                                Reset to Default
                              </Button>
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder="Terms and conditions"
                                className="min-h-[100px] bg-background resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right Column - Totals */}
                    <div className="space-y-4 rounded-md border border-muted p-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        Order Details
                      </h4>
                      {/* Order Status */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Status
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Confirmed">
                                  Confirmed
                                </SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">
                                  Delivered
                                </SelectItem>
                                <SelectItem value="Cancelled">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Summary Display */}
                      <div className="bg-muted/30 p-4 rounded-md space-y-2 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Subtotal:</span>
                          <span className="font-medium">
                            {calculateSubTotal(form.watch("items")).toFixed(2)}{" "}
                            tk
                          </span>
                        </div>

                        {/* Discount */}
                        <div className="pt-2 border-t grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="discount.type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium text-xs">
                                  Discount Type
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="percentage">
                                      Percentage (%)
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                      Fixed Amount
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="discount.value"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium text-xs">
                                  Discount Value
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="h-8 text-xs bg-background"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span>Discount Amount:</span>
                          <span>
                            {form.watch("discount").type === "percentage"
                              ? `${form.watch("discount").value}% (${((calculateSubTotal(form.watch("items")) * form.watch("discount").value) / 100).toFixed(2)} tk)`
                              : `${form.watch("discount").value.toFixed(2)} tk`}
                          </span>
                        </div>

                        {/* Shipping and Adjustment */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                          <FormField
                            control={form.control}
                            name="shippingCharges"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium text-xs">
                                  Shipping Charges
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="h-8 text-xs bg-background"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="adjustment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium text-xs">
                                  Adjustment
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="h-8 text-xs bg-background"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-dashed">
                          <span className="text-base font-bold">Total:</span>
                          <span className="text-base font-bold">
                            {calculateTotal(
                              calculateSubTotal(form.watch("items")),
                              form.watch("discount"),
                              form.watch("shippingCharges"),
                              form.watch("adjustment")
                            ).toFixed(2)}{" "}
                            tk
                          </span>
                        </div>

                        {/* Payment */}
                        <div className="pt-2 border-t">
                          <FormField
                            control={form.control}
                            name="payment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-medium">
                                  Payment Amount
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="bg-background"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Previous Due */}
                        {selectedCustomer?.due ? (
                          <div className="pt-3 border-t border-dashed">
                            <div className="flex items-center gap-1 mb-2">
                              <div className="flex flex-1 items-center justify-between">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="includePreviousDue"
                                    checked={includePreviousDue}
                                    onChange={(e) =>
                                      setIncludePreviousDue(e.target.checked)
                                    }
                                    className="mr-2 h-4 w-4"
                                  />
                                  <label
                                    htmlFor="includePreviousDue"
                                    className="text-sm font-medium">
                                    Include Previous Due
                                  </label>
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="w-[200px] text-xs">
                                        Include the customer's previous
                                        outstanding balance in this invoice's
                                        total due amount
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm">Previous Due:</span>
                              <Badge
                                variant={
                                  includePreviousDue ? "secondary" : "outline"
                                }
                                className="font-medium">
                                {selectedCustomer.due.toFixed(2)} tk
                              </Badge>
                            </div>
                          </div>
                        ) : null}

                        {/* Current Due - without previous due */}
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm font-medium">
                            Current Invoice Due:
                          </span>
                          <span className="font-medium">
                            {calculateCurrentDue().toFixed(2)} tk
                          </span>
                        </div>

                        {/* Total Due - includes previous due if selected */}
                        <div className="flex justify-between items-center pt-3 mt-2 border-t border-primary">
                          <span className="text-base font-bold text-primary">
                            Total Due:
                          </span>
                          <span className="text-base font-bold text-primary">
                            {calculateTotalDue().toFixed(2)} tk
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="px-8">
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          {id ? "Updating..." : "Creating..."}
                        </>
                      ) : id ? (
                        "Update Sales Order"
                      ) : (
                        "Create Sales Order"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
