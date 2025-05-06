import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { customerSchema, type CustomerFormValues } from "../../lib/schemas";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Edit, X } from "lucide-react";

interface CustomerFormProps {
  initialData?: CustomerFormValues;
  id?: string;
  onSuccess?: () => void;
}

// Field identifiers for focus management
const FIELD_IDS = {
  CUSTOMER_TYPE: "customer-type-field",
  CUSTOMER_NAME: "customer-name-field",
  CONTACT_NUMBER: "customer-contact-field",
  EMAIL: "customer-email-field",
  ADDRESS: "customer-address-field",
  SUBMIT: "customer-submit-button",
};

export function CustomerForm({
  initialData,
  id,
  onSuccess,
}: CustomerFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      customerName: "",
      contactNumber: "",
      email: "",
      address: "",
      customerType: "Individual",
    },
  });

  // Focus a field by ID
  const focusField = (id: string) => {
    const element = document.getElementById(id) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    currentField: string
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const fieldOrder = [
        FIELD_IDS.CUSTOMER_TYPE,
        FIELD_IDS.CUSTOMER_NAME,
        FIELD_IDS.CONTACT_NUMBER,
        FIELD_IDS.EMAIL,
        FIELD_IDS.ADDRESS,
        FIELD_IDS.SUBMIT,
      ];
      const currentIndex = fieldOrder.indexOf(currentField);

      if (currentIndex < fieldOrder.length - 1) {
        const nextField = fieldOrder[currentIndex + 1];
        focusField(nextField);
      } else {
        // If last field, submit the form
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setIsLoading(true);
      if (id) {
        const result = await apiClient.patch(`/customers/${id}`, data);
        if (result.data.success) {
          toast.success("Customer updated successfully");
          setIsOpen(false);
          if (onSuccess) onSuccess();
        }
      } else {
        const result = await apiClient.post(`/customers/create`, data);
        if (result.data.success) {
          toast.success("Customer created successfully");
          setIsOpen(false);
          if (onSuccess) onSuccess();
        }
      }
      form.reset();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("Failed to save customer");
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
          Create Customer
        </Button>
      )}

      {/* Custom Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000069] bg-opacity-50">
          <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
              onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                autoComplete="off"
                noValidate>
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle>
                      {id ? "Edit Customer" : "Create Customer"}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="customerType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger
                                    id={FIELD_IDS.CUSTOMER_TYPE}
                                    onKeyDown={(e) =>
                                      handleKeyDown(e, FIELD_IDS.CUSTOMER_TYPE)
                                    }>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Business">
                                    Business
                                  </SelectItem>
                                  <SelectItem value="Individual">
                                    Individual
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id={FIELD_IDS.CUSTOMER_NAME}
                                  autoComplete="off"
                                  name="random-name-1"
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, FIELD_IDS.CUSTOMER_NAME)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id={FIELD_IDS.CONTACT_NUMBER}
                                  autoComplete="off"
                                  name="random-name-2"
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, FIELD_IDS.CONTACT_NUMBER)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  {...field}
                                  id={FIELD_IDS.EMAIL}
                                  autoComplete="off"
                                  name="random-name-3"
                                  onKeyDown={(e) => handleKeyDown(e, FIELD_IDS.EMAIL)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter complete address"
                                className="min-h-[100px]"
                                {...field}
                                id={FIELD_IDS.ADDRESS}
                                autoComplete="off"
                                name="random-name-4"
                                onKeyDown={(e) => handleKeyDown(e, FIELD_IDS.ADDRESS)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end space-x-4 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      id={FIELD_IDS.SUBMIT}
                      disabled={isLoading}>
                      {isLoading
                        ? "Saving..."
                        : id
                          ? "Update Customer"
                          : "Create Customer"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
