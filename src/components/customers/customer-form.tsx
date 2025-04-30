import { useState, useRef, useEffect } from "react";
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

export function CustomerForm({
  initialData,
  id,
  onSuccess,
}: CustomerFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<
    (HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null)[]
  >([]);

  // Reset inputRefs when form opens
  useEffect(() => {
    if (isOpen) {
      inputRefs.current = inputRefs.current.slice(0, 0);
    }
  }, [isOpen]);

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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    index: number
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // Find the next input field
      const nextIndex = index + 1;
      if (nextIndex < inputRefs.current.length) {
        // Focus the next input field
        inputRefs.current[nextIndex]?.focus();
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
              <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                    ref={(el) => {
                                      inputRefs.current[0] = el;
                                    }}>
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
                                  autoComplete="off"
                                  onKeyDown={(e) => handleKeyDown(e, 1)}
                                  ref={(el) => {
                                    inputRefs.current[1] = el;
                                  }}
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
                                  autoComplete="off"
                                  onKeyDown={(e) => handleKeyDown(e, 2)}
                                  ref={(el) => {
                                    inputRefs.current[2] = el;
                                  }}
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
                                  autoComplete="off"
                                  onKeyDown={(e) => handleKeyDown(e, 3)}
                                  ref={(el) => {
                                    inputRefs.current[3] = el;
                                  }}
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
                                autoComplete="off"
                                onKeyDown={(e) => handleKeyDown(e, 4)}
                                ref={(el) => {
                                  inputRefs.current[4] = el;
                                }}
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
                      disabled={isLoading}
                      ref={(el) => {
                        inputRefs.current[5] = el;
                      }}>
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
