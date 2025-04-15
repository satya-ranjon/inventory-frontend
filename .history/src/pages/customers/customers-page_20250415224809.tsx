import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { CustomersTable } from "../../components/customers/customers-table";
import { useCustomers } from "../../hooks/use-customers";
import { Plus, Loader2 } from "lucide-react";

export function CustomersPage() {
  const navigate = useNavigate();
  const { customers, isLoading } = useCustomers();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => navigate("/dashboard/customers/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <CustomersTable customers={customers || []} />
      )}
    </div>
  );
}
