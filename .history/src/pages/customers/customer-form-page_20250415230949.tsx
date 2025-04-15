import { useNavigate, useParams } from "react-router";
import { CustomerForm } from "../../components/customers/customer-form";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "../../services/customer-service";
import { useEffect, useState } from "react";

export function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [formData, setFormData] = useState(null);

  // Directly use the query for fetching a customer by ID
  const {
    data: customer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      try {
        return await customerService.getCustomerById(id as string);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        throw error;
      }
    },
    enabled: isEditMode,
    retry: 1,
  });

  // Set form data once customer data is loaded
  useEffect(() => {
    if (customer) {
      console.log("Customer data loaded:", customer);
      // Check if the data is nested in a 'data' property (common API response pattern)
      const customerData = customer.data || customer;
      setFormData(customerData);
    }
  }, [customer]);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/dashboard/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Customer" : "Add Customer"}
        </h1>
      </div>

      {isEditMode && isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isEditMode && isError ? (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-red-500 mb-4">Failed to load customer data</p>
          <Button onClick={() => navigate("/dashboard/customers")}>
            Go Back to Customers
          </Button>
        </div>
      ) : (
        <CustomerForm customer={formData} />
      )}
    </div>
  );
}
