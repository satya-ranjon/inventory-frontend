import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { useState } from "react";
import { Edit, X } from "lucide-react";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  warranty: z.string().optional().nullable(),
  price: z.number().min(0, "Price must be positive"),
});

type ItemFormValues = z.infer<typeof itemSchema>;

// Field identifiers for focus management
const FIELD_IDS = {
  NAME: "item-name-field",
  QUANTITY: "item-quantity-field",
  WARRANTY: "item-warranty-field",
  PRICE: "item-price-field",
};

export function ItemForm({
  initialData,
  id,
  onSuccess,
}: {
  initialData?: ItemFormValues;
  id?: string;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: initialData || {
      name: "",
      quantity: undefined,
      warranty: "",
      price: undefined,
    },
  });

  // Focus a field by ID
  const focusField = (id: string) => {
    const element = document.getElementById(id) as HTMLInputElement;
    if (element) {
      element.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentField: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      // Determine next field to focus
      const fieldOrder = [
        FIELD_IDS.NAME,
        FIELD_IDS.QUANTITY,
        FIELD_IDS.WARRANTY,
        FIELD_IDS.PRICE,
      ];
      const currentIndex = fieldOrder.indexOf(currentField);
      
      if (currentIndex < fieldOrder.length - 1) {
        // Focus next field
        focusField(fieldOrder[currentIndex + 1]);
      } else {
        // If last field, submit the form
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const onSubmit = async (data: ItemFormValues) => {
    try {
      setIsLoading(true);
      if (id) {
        const result = await apiClient.patch(`/items/${id}`, data);
        if (result.data.success) {
          toast.success("Item updated successfully");
          setIsOpen(false);
          if (onSuccess) onSuccess();
        }
      } else {
        const result = await apiClient.post(`/items/create`, data);
        if (result.data.success) {
          toast.success("Item created successfully");
          setIsOpen(false);
          if (onSuccess) onSuccess();
        }
      }
      form.reset();
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Dialog Trigger */}
      {id ? (
        <Button size="icon" variant="outline" onClick={() => setIsOpen(true)}>
          <Edit />
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Create Item
        </Button>
      )}

      {/* Custom Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000069] bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
              onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <div className="space-y-6 py-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id={FIELD_IDS.NAME}
                              autoComplete="off"
                              onKeyDown={(e) => handleKeyDown(e, FIELD_IDS.NAME)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              id={FIELD_IDS.QUANTITY}
                              autoComplete="off"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              value={field.value}
                              onKeyDown={(e) => handleKeyDown(e, FIELD_IDS.QUANTITY)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="warranty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warranty</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id={FIELD_IDS.WARRANTY}
                              autoComplete="off"
                              value={field.value ?? ""}
                              onKeyDown={(e) => handleKeyDown(e, FIELD_IDS.WARRANTY)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              id={FIELD_IDS.PRICE}
                              autoComplete="off"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              value={field.value}
                              onKeyDown={(e) => handleKeyDown(e, FIELD_IDS.PRICE)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {id ? "Update Item" : "Create Item"}
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
