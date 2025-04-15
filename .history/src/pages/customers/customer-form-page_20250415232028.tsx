import { useNavigate, useParams } from "react-router";
import { CustomerForm } from "../../components/customers/customer-form";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCustomer } from "../../hooks/use-customers";
import { useEffect, useState } from "react";
import { CustomerFormValues } from "../../lib/schemas";

export function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [formData, setFormData] = useState<
    (CustomerFormValues & { _id?: string }) | undefined
  >(undefined);

  // Use the custom hook instead of direct useQuery
  const { data: customer, isLoading, isError } = useCustomer(id);

  // Set form data once customer data is loaded
  useEffect(() => {
    if (customer) {
      let customerData;

      if (customer.data && typeof customer.data === "object") {
        customerData = customer.data;
      } else if (customer.customer && typeof customer.customer === "object") {
        customerData = customer.customer;
      } else {
        customerData = customer;
      }

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
