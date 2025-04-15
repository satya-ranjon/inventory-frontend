import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CustomerForm } from "../../components/customers/customer-form";
import { useCustomers } from "../../hooks/use-customers";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { type CustomerFormValues } from "../../lib/schemas";

export function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, isLoading } = useCustomers();
  const [customer, setCustomer] = useState<
    (CustomerFormValues & { _id?: string }) | null
  >(null);

  const isEditMode = !!id;

  useEffect(() => {
    async function fetchCustomer() {
      if (id) {
        try {
          const data = await getCustomerById(id);
          setCustomer(data);
        } catch (error) {
          console.error("Error fetching customer:", error);
          navigate("/dashboard/customers");
        }
      }
    }

    if (isEditMode) {
      fetchCustomer();
    }
  }, [id, getCustomerById, navigate, isEditMode]);

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
      ) : (
        <CustomerForm
          customer={isEditMode ? customer || undefined : undefined}
        />
      )}
    </div>
  );
}
